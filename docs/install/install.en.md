## Overview

The `buddy-mlir` prebuilt release artifacts provide two types of packages:

- Python wheel: provides Python APIs, `buddy_mlir` bindings, and command-line tools such as `buddy-opt`.
- C++ archive: provides the Buddy/LLVM/MLIR toolchain, headers, and static libraries.

## Install Python dependencies

### Prerequisites

It is recommended to create a virtual environment first:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Before importing PyTorch models with the Buddy frontend, install PyTorch first. Please refer to the official installation page: https://pytorch.org/get-started/locally/

The simplest CPU-only installation is:

```bash
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
```

For RISC-V, PyTorch does not officially support RISC-V yet. You can build from source or use third-party builds:
https://community-ci.openruyi.cn/pypi/riscv64/dev/+simple/torch/

Then go to the [release](https://github.com/buddy-compiler/buddy-mlir/releases) page and install the wheel that matches your Python version and system architecture.

For example, for `x86_64 + Python 3.10`:
```bash
python -m pip install \
  https://github.com/buddy-compiler/buddy-mlir/releases/download/v0.0.1/buddy-0.0.1-cp310-cp310-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl
```

For example, for `riscv64 + Python 3.12`:

```bash
python -m pip install \
  https://github.com/buddy-compiler/buddy-mlir/releases/download/v0.0.1/buddy-0.0.1-cp312-cp312-manylinux_2_39_riscv64.whl
```

After installation, verify it with the following commands:

```bash
python -c "import buddy; import buddy_mlir; print('buddy: ok')"
python -c "from buddy_mlir import ir; print('buddy_mlir ok')"
buddy-opt --version
```

## Import DeepseekR1 model

First install two Python dependencies:

```
pip install numpy transformers==4.56.2
```

Then prepare the following `import-deepseek-r1.py` script and run it directly:

```py
import torch
from transformers import (
    AutoModelForCausalLM,
    StaticCache,
)
from torch._inductor.decomposition import decompositions as inductor_decomp
import numpy

from buddy.compiler.frontend import DynamoCompiler
from buddy.compiler.ops import tosa
from buddy.compiler.graph import GraphDriver
from buddy.compiler.graph.transform import (
    simply_fuse,
    apply_classic_fusion,
    eliminate_transpose,
    eliminate_matmul_transpose_reshape,
    flash_attention_prefill,
    gqa_attention_fusion,
)
from buddy.compiler.graph.type import DeviceType

# Initialize the model from the specified model path.
model = AutoModelForCausalLM.from_pretrained(
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B", torchscript=True
).eval()
model.config.use_cache = False

# Initialize Dynamo Compiler with specific configurations as an importer.
dynamo_compiler_prefill = DynamoCompiler(
    primary_registry=tosa.ops_registry,
    aot_autograd_decomposition=inductor_decomp,
    func_name="forward_prefill",
)

dynamo_compiler_decode = DynamoCompiler(
    primary_registry=tosa.ops_registry,
    aot_autograd_decomposition=inductor_decomp,
    func_name="forward_decode",
)

# Import the model into MLIR module and parameters.
with torch.no_grad():
    past_key_values_prefill = StaticCache(config=model.config, max_cache_len=1024)
    past_key_values_decode = StaticCache(config=model.config, max_cache_len=1024)

    data_prefill = {
        "input_ids": torch.zeros((1, 1024), dtype=torch.int64),
    }
    data_decode = {
        "input_ids": torch.zeros((1, 1), dtype=torch.int64),
    }

    cache_position = torch.tensor([200], dtype=torch.int64)

    graphs_prefill = dynamo_compiler_prefill.importer(
        model,
        input_ids=data_prefill["input_ids"],
        use_cache=True,
        # past_key_values=past_key_values_prefill,
        cache_implementation="static",
    )
    # Initialize past_key_values once during the first forward call
    model(
        input_ids=data_decode["input_ids"],
        past_key_values=past_key_values_decode,
        use_cache=True,
        cache_implementation="static",
    )

    graphs_decode = dynamo_compiler_decode.importer(
        model,
        input_ids=data_decode["input_ids"],
        use_cache=True,
        cache_position=cache_position,
        past_key_values=past_key_values_decode,
        cache_implementation="static",
    )

    assert len(graphs_prefill) == 1
    assert len(graphs_decode) == 1
    graph_prefill = graphs_prefill[0]
    graph_decode = graphs_decode[0]

    params = dynamo_compiler_prefill.imported_params[graph_prefill]
    graphs_prefill[0].perform([eliminate_transpose, eliminate_matmul_transpose_reshape])
    graphs_decode[0].perform([eliminate_transpose, eliminate_matmul_transpose_reshape])
    pattern_list_prefill = [
        simply_fuse,
        apply_classic_fusion,
        flash_attention_prefill,
    ]
    pattern_list_decode = [
        simply_fuse,
        apply_classic_fusion,
        gqa_attention_fusion,
    ]

    graphs_prefill[0].fuse_ops(pattern_list_prefill)
    graphs_decode[0].fuse_ops(pattern_list_decode)

    graph_prefill.op_groups["subgraph0_prefill"] = graph_prefill.op_groups.pop(
        "subgraph0"
    )
    graph_prefill.group_map_device["subgraph0_prefill"] = DeviceType.CPU

    graph_decode.op_groups["subgraph0_decode"] = graph_decode.op_groups.pop("subgraph0")
    graph_decode.group_map_device["subgraph0_decode"] = DeviceType.CPU

    driver_prefill = GraphDriver(graphs_prefill[0])
    driver_prefill.subgraphs[0].lower_to_top_level_ir()

    driver_decode = GraphDriver(graphs_decode[0])
    driver_decode.subgraphs[0].lower_to_top_level_ir()

    # Save the generated files to the specified output directory.
    with open("subgraph0_prefill.mlir", "w") as module_file:
        print(driver_prefill.subgraphs[0]._imported_module, file=module_file)
    with open("forward_prefill.mlir", "w") as module_file:
        print(driver_prefill.construct_main_graph(True), file=module_file)
    all_param = numpy.concatenate(
        [param.detach().numpy().reshape([-1]) for param in params]
    )
    all_param.tofile("arg0.data")

    with open("subgraph0_decode.mlir", "w") as module_file:
        print(driver_decode.subgraphs[0]._imported_module, file=module_file)
    with open("forward_decode.mlir", "w") as module_file:
        print(driver_decode.construct_main_graph(True), file=module_file)
```

Expected outputs after compilation:

```
6.7G Apr 22 03:35 arg0.data
  10 Apr 22 03:31 build
211K Apr 22 03:35 forward_decode.mlir
183K Apr 22 03:35 forward_prefill.mlir
4.4K Apr 22 03:38 import-deepseek-r1.py
730K Apr 22 03:35 subgraph0_decode.mlir
756K Apr 22 03:35 subgraph0_prefill.mlir
```
