# 动态向量表示（Dynamic Vector Representation）

更多讨论可参考该 RFC 贴：<https://discourse.llvm.org/t/rfc-dynamic-vector-semantics-for-the-mlir-vector-dialect/75704>。

## 简要概述

该提案为 MLIR 的 Vector dialect 引入“动态向量”（dynamic vector）的概念：即向量长度可在运行期任意变化的向量。提案定义了动态向量类型（例如 `vector<?xf32>`），以及两类用于操控动态向量的操作：`vector.get_vl` 与 `vector.set_vl`。

本提案的重点在于给出动态向量的**语义定义**。文中给出三个通用用例用于说明可适用的场景，但这些用例不应限制其用途。同时，我们也展示了 RVV（RISC-V Vector Extensions）及其向量长度无关（VLA, Vector Length Agnostic）模型作为一个端到端的示例应用；未来我们也期望动态向量能被扩展到更多目标架构，并针对不同后端提供自定义 lowering。

动态向量表示能够与现有 Vector dialect 特性无缝集成，例如 scalable vector、vector masking、以及基于 Linalg 的分块（tiling）向量化等。

此外，我们引入了一个初始版本的 RVV dialect，用于与 `vector.get_vl`/`vector.set_vl` 交互，帮助在 LLVM 中完成对 RVV 的 lowering。我们复用 LLVM Vector Predication（VP）相关操作来建模 RVV 的特定能力，同时也为未来其他目标复用打下基础。

## 背景与动机

例如某些 RISC-V 变体这样的向量处理器，可以在运行期动态改变向量长度。但目前的 Vector dialect 缺少用于建模这类动态行为的必要语义。以往的一些尝试存在不足：

- **Scalable Vector Type**：该类型支持 VLA 向量化，但无法表达“向量长度在运行时可能任意改变”的语义。
- **RVV Dialect Proposal**：虽然能为 RVV 支持动态向量计算，但其抽象局限在特定架构上。缺少 Vector dialect 中的通用抽象会导致 RVV dialect 变成“孤岛式”方案，难以融入更广泛的向量生态。

缺少通用的动态向量抽象，会限制 Vector dialect 对动态向量计算的表达与处理能力。本提案旨在补齐这一缺口：在 Vector dialect 内引入一种灵活、与硬件无关的动态向量抽象。

## 提案内容

### 动态向量类型

我们将动态向量类型定义为：其长度在运行期确定，并可能在程序执行过程中任意变化的向量。使用符号 “?” 表示某个向量维度为动态。示例如下：

```
// 1-D vector type with one dynamic dimension and `i32` element type.
vector<?xi32>

// 2-D vector type with one dynamic dimension and `f32` element type.
vector<8x?xf32>
```

为简化起见，我们目前将动态维度数量限制为 1 个。后续将利用 `ShapedType` 中已有的动态形状基础设施，在 `VectorType` 中支持动态维度。

### 动态向量操作

我们引入两个关键操作 `vector.get_vl` 与 `vector.set_vl` 来管理动态向量长度。

`vector.get_vl` 用于获取某个配置下硬件所支持的**最大向量长度**（以向量元素个数计）。配置包括向量元素类型，以及一个可选的常量倍率，用于对硬件物理向量长度进行缩放。

```
// Syntax
%vl = vector.get_vl $element_type [, $multiplier] : index

// Examples:

// Element type `i32` and length multiplier `4`.
%vl = vector.get_vl i32, 4 : index

// Element type `i32` without length multiplier.
%vl = vector.get_vl i32 : index

```

在 VLA 向量化中，`vector.get_vl` 会在运行期动态获取硬件支持的最大向量长度。例如：若目标硬件的最大向量长度为 128-bit，则 `%vl = vector.get_vl i32, 4 : index` 将返回 16；若最大向量长度为 512-bit，则返回 64。

`vector.set_vl` 用于在某个 region 内设置动态向量的向量长度。它以“元素个数”为单位接收期望长度，并将该长度应用到 region 内的所有动态向量操作。`vector.set_vl` 还可以从 region 中返回值，包括动态向量；这些动态向量会在离开 region 后仍保留其向量长度。关于在不同 `vector.set_vl` region 之间传递动态向量的更多语义，将结合未来真实场景进一步定义。

```
// Syntax
($return_value =)? vector.set_vl $vector_length : index { $op* }


// Examples: Initialize a region with a dynamic vector length specified by %vl.

// Without return value.
func.func @vector_add(%in1: memref<?xi32>, %in2: memref<?xi32>, %out: memref<?xi32>) {
  %c0 = arith.constant 0 : index  
  %dim_size = memref.dim %in1, %c0 : memref<?xi32>
  vector.set_vl %dim_size : index {
    %vec_input1 = vector.load %in1[%c0] : memref<?xi32>, vector<?xi32>
    %vec_input2 = vector.load %in2[%c0] : memref<?xi32>, vector<?xi32>
    %vec_output = arith.addi %vec_input1, %vec_input2 : vector<?xi32>
    vector.store %vec_output %out[%c0] : memref<?xi32>, vector<?xi32>
 }
}

// With return value.
func.func @vector_add(%in1: memref<?xi32>, %in2: memref<?xi32>) -> vector<?xi32> {
  %c0 = arith.constant 0 : index  
  %dim_size = memref.dim %in1, %c0 : memref<?xi32>
  %vec_ret = vector.set_vl %dim_size : index {
    %vec_input1 = vector.load %in1[%c0] : memref<?xi32>, vector<?xi32>
    %vec_input2 = vector.load %in2[%c0] : memref<?xi32>, vector<?xi32>
    %vec_output = arith.addi %vec_input1, %vec_input2 : vector<?xi32>
    return %vec_output : vector<?xi32>
  } -> vector<?xi32>
  return %vec_ret : vector<?xi32>
}

```

`vector.get_vl` 与 `vector.set_vl` 的组合，使我们能够在支持 VLA 的多样硬件实现上动态调整向量长度，以获得更优的性能。

我们有意为嵌套的 `vector.set_vl` region 保留开放设计空间。这种灵活性可支持“同一次计算内部需要改变向量长度”的场景，例如某些 bitcast 操作或控制流向量化等。虽然当前实践中尚未遇到太多此类用例，我们仍计划在相关场景出现后再评估并完善对嵌套 region 的支持。

### 潜在用法

本节展示动态向量的 `vector.get_vl` 与 `vector.set_vl` 可以如何应用于不同场景，甚至跨越不同抽象层级。

```
// Skeleton of driving example.

#map = affine_map<(d0)[s0, s1] -> (s0, -d0 + s1)>

func.func @vector_add(%input1: memref<?xi32>, %input2: memref<?xi32>, %output: memref<?xi32>) {
  %c0 = arith.constant 0 : index
  // Get the dimension of the workload.
  %dim_size = memref.dim %input1, %c0 : memref<?xi32>
  // Perform dynamic vector addition.
  [ ... see use cases below ...]
}
```

**用例 1 - Linalg 向量化：每次循环迭代设置一次向量长度**

在该用例中，`vector.set_vl` 会在循环体内动态调整。除最后一次迭代外，其向量长度被设置为 `vector.get_vl` 返回值；最后一次迭代可能会更短。

```
// Returns four times the physical vl for element type i32.
%vl = vector.get_vl i32, 4 : index

scf.for %idx = %c0 to %dim_size step %vl { // Tiling
  %it_vl = affine.min #map(%idx)[%vl, %dim_size]
  vector.set_vl %it_vl : index {
    %vec_input1 = vector.load %input1[%idx] : memref<?xi32>, vector<?xi32>
    %vec_input2 = vector.load %input2[%idx] : memref<?xi32>, vector<?xi32>
    %vec_output = arith.addi %vec_input1, %vec_input2 : vector<?xi32>
    vector.store %vec_output %output[%idx] : memref<?xi32>, vector<?xi32>
  }
}
```

**用例 2 - Linalg 向量化：主向量循环设置一次，尾部（epilogue）循环再设置一次**

该用例展示在主向量循环开始时设置一次向量长度，用于高效处理主体数据；并在尾部循环中再次设置向量长度，用于处理主循环未覆盖的剩余元素。

```
// Returns four times the physical vl for element type i32.
%vl = vector.get_vl i32, 4 : index
%steps = arith.floordivsi %dim_size, %vl : index
%main_ub = arith.multi %steps, %vl : index
vector.set_vl %vl : index {
  scf.for %idx = %c0 to %main_ub step %vl {
    %vec_input1 = vector.load %input1[%idx] : memref<?xi32>, vector<?xi32>
    %vec_input2 = vector.load %input2[%idx] : memref<?xi32>, vector<?xi32>
    %vec_output = arith.addi %vec_input1, %vec_input2 : vector<?xi32>
    vector.store %vec_output %output[%idx] : memref<?xi32>, vector<?xi32>
  }
}

%rem_ub = %dim_size - %main_ub
%cond = arith.cmpi sgt, %rem_ub, %c0 : index
scf.if %cond {
  vector.set_vl %rem_ub : index {
    %vec_input1 = vector.load %input1[%rem_idx] : memref<?xi32>, vector<?xi32>
    %vec_input2 = vector.load %input2[%rem_idx] : memref<?xi32>, vector<?xi32>
    %vec_output = arith.addi %vec_input1, %vec_input2 : vector<?xi32>
    vector.store %vec_output %output[%rem_idx] : memref<?xi32>, vector<?xi32>
  }
}
```

**用例 3：将向量长度设置为整个维度大小**

在该用例中，向量长度被设置为与数据维度整体大小一致，从而在整个数据集上应用向量操作。这展示了 `vector.set_vl` 在更高层抽象上如何有效表达一个“向量循环”。

```
// The `dim_size` represents the whole size of the workload.
vector.set_vl %dim_size : index {
  %vec_input1 = vector.load %input1[%c0] : memref<?xi32>, vector<?xi32>
  %vec_input2 = vector.load %input2[%c0] : memref<?xi32>, vector<?xi32>
  %vec_output = arith.addi %vec_input1, %vec_input2 : vector<?xi32>
  vector.store %vec_output %output[%c0] : memref<?xi32>, vector<?xi32>
}
```

该用例仅用于说明概念；完整的设计与实现会带来超出当前工作范围的潜在挑战。

### 初始版本的 RVV Dialect

要在 LLVM 中将动态向量有效 lowering 到 RISC-V 后端，需要在通用表示与 MLIR 中 RVV 特有能力之间建立桥梁。我们提出一个尽量精简的 RVV dialect：当前阶段仅包含 `rvv.set_vl` 操作，用于辅助对 `vector.get_vl` 与 `vector.set_vl` 的 lowering。我们计划利用 LLVM dialect 中定义的 VP intrinsic 来表示动态向量计算与内存操作，并在未来加入更多 RVV 专用操作以增强 RVV 支持。

**RVV Lowering 示例**

从通用动态向量 lowering 到 RVV 的过程包含几个关键步骤：

- 将 `vector.get_vl` / `vector.set_vl` lowering 到 `rvv.set_vl`；
- 将向量计算 lowering 到 VP 操作；
- 按照 RVV 的 LLVM 约定，将动态向量类型转换为 scalable vector 类型。

下面给出对用例 1 中向量加法示例的 lowering：

```
%vlmax = rvv.set_vl %max, i32, 4 : index
scf.for $idx = %c0 to %dim_size step %vlmax { // Tiling
  %it_vl = affine.min #map(%idx)[%vlmax, %dim_size]
  %vl = rvv.set_vl %it_vl, i32, 4 : index
  %mask = vector.create_mask %vl : vector<[8]xi1>
  %iptr_1 = ... ... // Resolve the input1 memref pointer
  %iptr_2 = ... ... // Resolve the input2 memref pointer
  %iptr_out = ... ... // Resolve the output memref pointer
  %vec_1 = "llvm.intr.vp.load" (%iptr_1, %mask, %vl) :
        (!llvm.ptr<i32>, vector<[8]xi1>, i32) -> vector<[8]xf32>
  %vec_2 = "llvm.intr.vp.load" (%iptr_2, %mask, %vl) :
        (!llvm.ptr<i32>, vector<[8]xi1>, i32) -> vector<[8]xf32>
  %res = "llvm.intr.vp.add" (%vec1, %vec2, %mask, %vl) :
        (vector<[8]xi32>, vector<[8]xi32>, vector<[8]xi1>, i32) -> vector<[8]xi32>
  "llvm.intr.vp.store" (%res, %iptr_out, %mask, %vl) :
        (vector<[8]xf32>, !llvm.ptr<f32>, vector<[8]xi1>, i32) -> ()
}
```
