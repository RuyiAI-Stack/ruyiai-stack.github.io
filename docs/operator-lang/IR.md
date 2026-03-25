# 中间表示（IR）输出（IR Dumps）

为了便于调试与分析，`triton-shared` 项目现在支持在编译过程中输出所有生成的中间表示（IR）。该功能通过环境变量 `TRITON_SHARED_DUMP_PATH` 进行控制。

## 工作原理

通过设置 `TRITON_SHARED_DUMP_PATH` 环境变量，你可以指定一个目录，用于保存所有中间表示（IR）。Triton 编译器会在编译的不同阶段将 IR dumps 输出到该目录中，从而让开发者能够检查并分析代码在各个转换步骤中的变化。

## 使用方法

先创建一个用于存放 IR dumps 的目录（例如 `/path/to/dump_dir`）。

然后将 `TRITON_SHARED_DUMP_PATH` 设置为该目录路径：

`export TRITON_SHARED_DUMP_PATH=/path/to/dump_dir`

接着按正常方式运行你的 Triton 编译流程，编译器会把 IR dumps 输出到指定目录中。

## 示例

假设你的 dumps 目录为 `/tmp/ir_dumps`。在运行代码之前，先设置环境变量：

```sh
export TRITON_SHARED_DUMP_PATH=/tmp/ir_dumps
```

当编译流程结束后，你可以查看 `/tmp/ir_dumps` 目录以找到所有中间表示文件。

```sh
$ ls /tmp/ir_dumps
ll.ir  ll.mlir  tt.mlir  ttshared.mlir
```
