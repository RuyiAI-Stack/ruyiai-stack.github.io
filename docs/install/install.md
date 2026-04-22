## Overview

`buddy-mlir` 预编译发布产物提供两类安装包：

- Python wheel：提供 Python API、`buddy_mlir` 绑定以及 `buddy-opt` 等命令行工具。
- C++ 压缩包：提供 Buddy/LLVM/MLIR 工具链、头文件和静态库。

## 安装 Python 支持库

### Prerequisites

建议先创建虚拟环境：

```bash
python3 -m venv .venv
source .venv/bin/activate
```

使用 Buddy 前端导入 PyTorch 模型需要先安装 PyTorch。请以官方安装页为准：https://pytorch.org/get-started/locally/

最简单的 CPU 版本安装方式如下：

```bash
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
```

对于 RISC-V, 由于 PyTorch 官方尚未支持 RISC-V, 可以自行从源码构建或者直接使用第三方构建：https://community-ci.openruyi.cn/pypi/riscv64/dev/+simple/torch/

然后请前往 [release](https://github.com/buddy-compiler/buddy-mlir/releases) 页面，安装与您的 Python 版本和系统架构匹配的 wheel。

例如对于 `x86_64 + Python 3.10`：
```bash
python -m pip install \
  https://github.com/buddy-compiler/buddy-mlir/releases/download/v0.0.1/buddy-0.0.1-cp310-cp310-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl
```

例如对于 `riscv64 + Python 3.12`：

```bash
python -m pip install \
  https://github.com/buddy-compiler/buddy-mlir/releases/download/v0.0.1/buddy-0.0.1-cp312-cp312-manylinux_2_39_riscv64.whl
```

安装完成后，可以通过下面的命令检测是否安装成功。

```bash
python -c "import buddy; import buddy_mlir; print('buddy: ok')"
python -c "from buddy_mlir import ir; print('buddy_mlir ok')"
buddy-opt --version
```

## 导入 DeepseekR1 模型

首先安装两个 python 依赖

```
pip install numpy transformers==4.56.2
```

然后准备下面的 `import-deepseek-r1.py` 脚本并直接运行

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

编译结束后应得的产物如下

```
6.7G Apr 22 03:35 arg0.data
  10 Apr 22 03:31 build
211K Apr 22 03:35 forward_decode.mlir
183K Apr 22 03:35 forward_prefill.mlir
4.4K Apr 22 03:38 import-deepseek-r1.py
730K Apr 22 03:35 subgraph0_decode.mlir
756K Apr 22 03:35 subgraph0_prefill.mlir
```
