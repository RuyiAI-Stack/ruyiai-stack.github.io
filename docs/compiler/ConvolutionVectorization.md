# 卷积向量化

## 卷积优化算法

### 系数广播（Coefficient Broadcasting）算法

系数广播（CB）算法是一种高性能二维卷积实现。
该算法最初通过 intrinsic 编程模型实现，并在 Intel 高级向量扩展平台上进行了评估。[[参考]](https://ieeexplore.ieee.org/abstract/document/8324097)

由于 intrinsic 编程模型与 ISA 扩展紧耦合，向量化实现难以在不同目标间复用。
因此我们尝试用 MLIR 实现 CB 算法，借助 MLIR 与 LLVM IR 的可复用、可扩展特性提高可移植性。

该算法涉及的主要 MLIR 方言与操作包括：

- `affine.for`：按给定上下界与步长执行循环体。
- `affine.vector_load`：从缓冲区（MLIR MemRef）指定切片加载向量。
- `affine.vector_store`：将向量写回缓冲区（MLIR MemRef）指定切片。
- `vector.broadcast`：将标量或向量广播为 n 维结果向量。
- `vector.fma`：执行向量融合乘加（FMA）运算。

![Graph of the Coefficients Broadcasting Algorithm](./Images/CoefficientsBroadcasting.png)

上图展示了算法流程：

- 迭代卷积核元素，并广播到 `vector1`。
- 按当前迭代索引将输入切片加载到 `vector2`。
- 按最外层循环索引将输出切片加载到 `vector3`。
- 对 `vector1`、`vector2`、`vector3` 执行乘加累积。
- 将结果向量写回输出缓冲区对应位置。
