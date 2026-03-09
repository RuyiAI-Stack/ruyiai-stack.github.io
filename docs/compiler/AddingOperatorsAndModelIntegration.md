## 指南：在 Buddy-MLIR 中添加算子与集成模型

本指南面向希望在 Buddy-MLIR 中添加前端算子映射（PyTorch → Buddy Graph → MLIR）以及导入/集成模型的开发者。内容基于仓库目录 `examples` 和 `frontend/Python`。阅读后，您将能够：

- 添加 Buddy Graph 层级的算子并将其降级到 MLIR（TOSA/Linalg/Math 等）。
- 通过 TorchDynamo 或 Export API 将 PyTorch 函数/模型导入到 Buddy Graph 和 MLIR 模块中，并获取/打包参数。

### 相关目录概览

- `frontend/Python/frontend.py`
  - 前端入口 `DynamoCompiler`：导入 FX Graph → Buddy Graph，组装注册表，并封装执行/编译。
- `frontend/Python/graph/`
  - `operation.py`：Buddy Graph 算子类（算子类型、元数据等）。
  - `graph.py`：图结构、符号表和 MLIR 模块生成驱动。
  - `transform/`：图级别变换（如 `maxpool2d_simplify`）。
- `frontend/Python/ops/`
  - `tosa.py` / `linalg.py` / `math.py` / `func.py`：从 Buddy Graph 算子到 MLIR 方言算子的降级，通过 `ops_registry` 注册。
  - `utils.py`：类型/属性辅助函数。
- `examples/BuddyPython/`
  - `module_gen.py`：最小导入演示（函数 → MLIR）。
  - `bert.py`：HuggingFace BERT 导入演示。
- `examples/MLIRPython/`
  - `README.md`：如何构建 MLIR Python 绑定和 TorchDynamo 自定义后端演示。

---

## 1. 环境设置（MLIR Python 绑定）

Buddy 的 Python 前端依赖 MLIR Python 绑定。构建要点（参见 `examples/BuddyPython/README.md` 和 `examples/MLIRPython/README.md`）：

1) 在 `buddy-mlir/llvm` 下构建 MLIR Python 绑定，并使用 `ninja check-mlir` 验证。
2) 将构建输出添加到 `PYTHONPATH`：

```bash
export PYTHONPATH=$(pwd)/tools/mlir/python_packages/mlir_core
```

然后在 Python 中验证：

```python
from mlir.ir import Context, Module
```

---

## 2. 添加算子（Torch → Buddy Graph → MLIR）

添加新算子通常涉及三个层次：

1) 在 Buddy Graph 层定义算子（如果没有合适的现有类）。
2) 实现到 MLIR（TOSA/Linalg/Math 等）的降级函数并注册到 `ops_registry`。
3) 在前端导入映射（`DynamoCompiler._ops_map`）中将 Torch Aten/Prims 符号映射到 Buddy Graph 算子类。

### 步骤 1：在 Buddy Graph 中定义算子

文件：`frontend/Python/graph/operation.py`

如果现有类可以复用，跳过此步骤。否则，添加新类并设置算子类型（影响融合/调度）：

```python
class MyNewOp(Op):
    def __init__(self) -> None:
        super().__init__()
        self._op_type = OpType.ElementwiseType  # 或 ReduceType/ReshapeType/...
```

对于卷积/池化，还可以携带布局字段（参见 `Conv2dOp`、`MaxPool2dOp`）。

### 步骤 2：实现降级并注册到 `ops_registry`

在目标方言文件（如 `frontend/Python/ops/tosa.py`）中，实现从 Buddy 算子到 MLIR 算子的转换：

```python
def my_new_op(node: MyNewOp, symbol_table):
    # 1) 从 symbol_table 获取输入（或常量）
    input1 = symbol_table.get((str(node.args[0]), 0), node.args[0])
    # 2) 读取输出形状/数据类型
    output_shape = list(node.tensor_meta["shape"])
    mlir_dtype = mlir_element_type_get(node.tensor_meta["dtype"])  # utils.py
    # 3) 构建 MLIR 类型和算子
    tensor_type = ir.RankedTensorType.get(output_shape, mlir_dtype)
    op = tosa.SomeOp(tensor_type, input1, ...)
    return op

ops_registry = {
    # ...
    "MyNewOp": my_new_op,
}
```

实用技巧：
- 复用 `tosa.py` 中的辅助函数（如 `_gen_arith_binary_op`、`_normalize_binary_operator_args`）。
- 处理广播、数据类型对齐以及必要的 `tosa.CastOp`。
- 对于 reshape/transpose，当形状已匹配时跳过无操作变换（参见 `reshape_op` 优化）。

### 步骤 3：映射 Torch 算子到 Buddy 算子

文件：`frontend/Python/frontend.py`，在 `DynamoCompiler.__init__` 的 `_ops_map` 中：

```python
self._ops_map = {
    # 示例：
    "add.Tensor": AddOp,
    "addmm.default": AddMMOp,
    # 新增：
    "aten_symbol_name": MyNewOp,
}
```

注意：键是 Torch 发出的 FX/Aten 符号（可通过运行导入流程并打印 `gm.graph.print_tabular()` 来查看）；值是 Buddy Graph 算子类。

完成这三个步骤后，使用示例脚本验证算子路径（参见下一节）。

---

## 3. 最小导入与验证（函数 → MLIR）

参见 `examples/BuddyPython/module_gen.py`：

```python
import torch
from torch._inductor.decomposition import decompositions as inductor_decomp
from buddy.compiler.frontend import DynamoCompiler
from buddy.compiler.ops import tosa

def foo(x, y):
    return x * y + x

dynamo_compiler = DynamoCompiler(
    primary_registry=tosa.ops_registry,
    aot_autograd_decomposition=inductor_decomp,
)

graphs = dynamo_compiler.importer(foo, torch.randn(10), torch.randn(10))
graph = graphs[0]
graph.lower_to_top_level_ir()  # 生成高层 MLIR（TOSA/Linalg/…）
print(graph._imported_module)
```

要点：
- `primary_registry` 控制首选方言/注册表（如 TOSA）。如果未找到，导入器会回退到其他合并的注册表（`math`、`linalg`、`func` 等）。
- 设置 `aot_autograd_decomposition` 可将 FX 图预分解为 ATen/Prims，便于映射。

---

## 4. 集成 PyTorch 模型（含参数）

提供两种导入路径：

1) Dynamo 路径（默认）：`DynamoCompiler.importer(model, *args, **kwargs)`
2) Export 路径（保留输入顺序）：`DynamoCompiler.importer_by_export(module, *args, **kwargs)`

示例：`examples/BuddyPython/bert.py`：

```python
from transformers import BertModel, BertTokenizer
from buddy.compiler.frontend import DynamoCompiler
from buddy.compiler.ops import tosa
from torch._inductor.decomposition import decompositions as inductor_decomp

model = BertModel.from_pretrained("bert-base-uncased").eval()
dynamo_compiler = DynamoCompiler(
    primary_registry=tosa.ops_registry,
    aot_autograd_decomposition=inductor_decomp,
)

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
encoded = tokenizer("Replace me by any text.", return_tensors="pt")
graphs = dynamo_compiler.importer(model, **encoded)

graph = graphs[0]
params = dynamo_compiler.imported_params[graph]
graph.lower_to_top_level_ir(do_params_pack=True)
print(graph._imported_module)
print(params)
```

注意：
- `imported_params` 返回模型的缓冲区/权重；`do_params_pack=True` 会在降级时打包它们。
- 若要保留原始模块的输入参数顺序，使用 `importer_by_export`（参见 `frontend.py` 中的注释/实现）。
- 对于复杂模型，请查看 `examples/BuddyLlama/`、`examples/BuddyResNet18/` 等。

### 执行图（可选）

`DynamoCompiler.dynamo_run()` 返回一个 Python 可调用对象（基于 MLIR ExecutionEngine），可以使用张量调用：

```python
runner = dynamo_compiler.dynamo_run()
out_tensors = runner(input_tensor_0, input_tensor_1, ...)
```

注意：确保共享库如 `libmlir_runner_utils`、`libmlir_c_runner_utils` 和 `libomp` 在本地可见（路径在 `frontend.py` 中为 `llvm/build/lib` 组合）。

---

## 5. 调试与常见问题

- 如何找到 Torch → Buddy 的映射键？
  - 在 `DynamoCompiler._compile_fx` 中启用 `verbose=True`，检查 `gm.graph.print_tabular()`（`target`/`op`/`name`）以确定 `_ops_map` 的键。
- 类型/广播问题：
  - 复用 `tosa.py` 中的二元算子包装器（对齐、广播、reshape）。
- 性能/正确性：
  - 在降级时尽量跳过冗余变换（如 `reshape_op` 在形状相同时直接返回）。

---

## 6. 提交前检查清单

- 新的 Buddy Graph 算子类，`OpType` 是否设置正确？
- 对应的降级函数是否：
  - 正确从 `symbol_table` 获取输入并处理数据类型/形状？
  - 使用了合适的 MLIR 方言和算子？
  - 注册到了目标方言的 `ops_registry`？
- `DynamoCompiler._ops_map` 是否更新了 Torch 符号映射？
- 最小/模型示例是否能运行并打印合理的 MLIR 模块？

更多背景和构建说明，请参阅 `docs/PythonEnvironment.md`、`examples/*/README.md` 以及 `ops/*.py` 中的实现。
