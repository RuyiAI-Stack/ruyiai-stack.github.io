# 卷积优化工具 conv-opt

## 卷积优化算法

### 系数广播（Coefficient Broadcasting）算法

系数广播（Coefficients Broadcasting, CB）算法是一种高性能的二维卷积实现方式。  
该算法最初基于 intrinsic 编程模型实现，并在 Intel 的高级向量扩展上进行了性能评估。[[参考]](https://ieeexplore.ieee.org/abstract/document/8324097)  
然而，intrinsic 编程模型强烈依赖具体 ISA 扩展，这意味着其他目标架构难以复用同样的向量化实现。

因此，我们尝试基于 MLIR 实现 CB 算法，  
从而充分利用 MLIR 与 LLVM IR 在可复用性与可扩展性方面的优势。

在介绍算法细节之前，先简要列出算法所依赖的一些 MLIR 方言与算子：

- `affine.for`：带上下界与步长的循环结构，用于执行多重循环。
- `affine.vector_load`：从缓冲区（MLIR `memref`）的指定切片中读取一个向量。
- `affine.vector_store`：将一个向量写入缓冲区的指定切片。
- `vector.broadcast`：将标量或向量广播为 n 维结果向量。
- `vector.fma`：在向量类型上执行融合乘加（FMA）运算。

![Graph of the Coefficients Broadcasting Algorithm](/docs/compiler/conv-opt-CoefficientsBroadcasting.png)

上图展示了系数广播算法的大致执行流程：
- 遍历卷积核中的每个元素，并将其广播到向量 `vector1`；
- 按当前迭代索引，从输入特征图中加载一段切片到 `vector2`；
- 按最外层循环索引，从输出特征图中加载一段切片到 `vector3`；
- 对 `vector1`、`vector2` 和 `vector3` 进行乘加累积；
- 将结果向量写回到输出缓冲区对应的位置。
