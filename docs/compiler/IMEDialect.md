<!-- # SpacemiT IME Dialect

本文档提供了在 buddy-mlir 中使用 IME（集成矩阵扩展）方言的全面指南。 -->

## 目录

1. [文件结构](#file-structure)
2. [简介](#introduction)
3. [快速开始](#quick-start)
4. [参考资料](#reference)

### 文件结构

IMEDialect 示例文件夹包含以下关键文件：

**MLIR 源文件：**
- **`vmadot.mlir`、`vmadotu.mlir`、`vmadotsu.mlir`、`vmadotus.mlir`、`vfmadot.mlir`**：演示每个 IME 操作的最小 MLIR 文件。用于验证汇编代码生成。
- **`vmadot_print_test.mlir`、`vmadotu_print_test.mlir` 等**：扩展测试 MLIR 文件，包含在硬件上打印输入/输出矩阵的附加代码。用于带有可见结果的硬件验证。

**运行时和构建文件：**
- **`runtime_*.c`**：C 运行时文件，提供 `main()` 入口点、矩阵初始化和硬件测试的结果验证。
- **`makefile`**：构建自动化，用于生成降级后的 MLIR、LLVM IR 和汇编代码。
- **`build_all_tests.sh`**：一次性构建所有硬件测试可执行文件的便捷脚本。

## 简介

IME 方言提供了映射到 SpacemiT 的 RISC-V 智能矩阵扩展的 MLIR 操作。

### 矩阵操作

所有 IME 指令执行以下核心矩阵乘累加操作：

```
C (M×N) += A (M×K) × B (K×N)
```

其中：
- **M、N、K**：矩阵维度（由 VLEN 配置决定）
- **A (vs1)**：左操作数矩阵（int8/int4/int16 或 fp16/fp8/fp4/bfp16）
- **B (vs2)**：右操作数矩阵（int8/int4/int16 或 fp16/fp8/fp4/bfp16）
- **C (vd)**：累加器/结果矩阵（整数操作为 int32，浮点操作为 fp16/bfp16）

### 按配置划分的矩阵维度

IME 操作的固定分块大小由 VLEN（向量寄存器长度）决定：

| VLEN | 数据类型 | M | K | N | 描述 |
|------|----------|---|---|---|------|
| 256 | int8 | 4 | 8 | 4 | 4×8 × 8×4 → 4×4 |
| 256 | fp16 | 4 | 4 | 4 | 4×4 × 4×4 → 4×4 |
| 128 | int8 | 4 | 4 | 4 | 4×4 × 4×4 → 4×4 |
| 128 | fp16 | 4 | 2 | 4 | 4×2 × 2×4 → 4×4 |


## 快速开始

### 前置条件

开始之前，请确保已安装以下前置条件：

```bash
# 下载并设置 SpacemiT 交叉编译工具链
wget https://archive.spacemit.com/toolchain/spacemit-toolchain-linux-glibc-x86_64-v1.1.2.tar.xz
tar -xvf spacemit-toolchain-linux-glibc-x86_64-v1.1.2.tar.xz
export PATH=$PWD/spacemit-toolchain-linux-glibc-x86_64-v1.1.2/bin:$PATH
```

### 1. 构建支持 IME 的 buddy-mlir

在开始尝试 IR 级别的示例之前，请确保已完成[入门部分](../../README.md)。


### 2. 构建和测试 IME 示例

进入 IME 方言示例目录：

```bash
cd buddy-mlir/examples/IMEDialect
```

#### 选项 A：验证汇编生成（快速测试）

使用此选项验证 IME 操作是否正确降级为 RISC-V 汇编。这使用最小的 `*.mlir` 文件。

**生成降级后的 MLIR：**
```bash
make vmadot-lower
```
这将生成包含降级表示的 `log.mlir`。

**生成 LLVM IR：**
```bash
make vmadot-translate
```
这将生成包含 LLVM IR 代码的 `log.ll`。

**生成汇编：**
```bash
make vmadot-asm
```
这将生成包含 RISC-V 汇编的 `log.s`。您可以检查此文件以验证 IME 指令生成是否正确。

#### 选项 B：构建硬件测试可执行文件（完整测试）

使用此选项构建可在 SpacemiT 硬件上运行的可执行文件，带有打印输出用于验证。这使用包含矩阵打印功能的 `*_print_test.mlir` 文件。

**构建单个测试可执行文件：**
```bash
export PATH=$PWD/spacemit-toolchain-linux-glibc-x86_64-v1.1.2/bin:$PATH
make vmadot-run    # 生成 vmadot.s 和 vmadot_test 可执行文件
make vmadotu-run   # 生成 vmadotu.s 和 vmadotu_test 可执行文件
make vmadotsu-run  # 生成 vmadotsu.s 和 vmadotsu_test 可执行文件
make vmadotus-run  # 生成 vmadotus.s 和 vmadotus_test 可执行文件
```

**一次性构建所有测试可执行文件：**
```bash
./build_all_tests.sh
```

这将生成可执行二进制文件：`vmadot_test`、`vmadotu_test`、`vmadotsu_test`、`vmadotus_test`

> **注意**：`-run` 目标需要 SpacemiT 交叉编译器（`riscv64-unknown-linux-gnu-gcc`）在您的 PATH 中。

---

## 在硬件上运行

编译测试可执行文件后，您可以在 SpacemiT 硬件上运行它们：

**步骤 1：将文件传输到硬件**

```bash
scp vmadot_test vmadotu_test vmadotsu_test vmadotus_test \
    user@spacemit-hardware:/path/to/test_dir/
```

**步骤 2：在硬件上执行**

```bash
# SSH 连接到 SpacemiT 硬件
ssh user@spacemit-hardware

# 进入测试目录并运行测试
cd /path/to/test_dir/
./vmadot_test
./vmadotu_test
./vmadotsu_test
./vmadotus_test
```

每个测试将输出：
- 输入矩阵 A 和 B
- 预期结果和计算结果
- 验证状态（通过/失败）

**注意**：`vfmadot` 浮点指令测试目前还不能作为独立二进制文件执行，仅可用于汇编生成和检查。



## 参考资料
- [SpacemiT IME 扩展规范](https://github.com/spacemit-com/riscv-ime-extension-spec)

---

## 操作参考

本节提供每种 IME 操作类型的详细信息以及如何在 MLIR 中使用它们。

### 指令分类

IME 指令分为两大类：

#### 1. 整数矩阵乘累加指令

这些指令执行有符号或无符号整数矩阵操作：

| 指令 | 操作数 A 类型 | 操作数 B 类型 | 累加器类型 | 描述 |
|------|--------------|--------------|-----------|------|
| `vmadot` | int4/int8/int16 | int4/int8/int16 | int32 | 有符号 × 有符号 |
| `vmadotu` | uint4/uint8/uint16 | uint4/uint8/uint16 | int32 | 无符号 × 无符号 |
| `vmadotsu` | int4/int8/int16 | uint4/uint8/uint16 | int32 | 有符号 × 无符号 |
| `vmadotus` | uint4/uint8/uint16 | int4/int8/int16 | int32 | 无符号 × 有符号 |

**汇编格式**：
```assembly
vmadot   vd, vs1, vs2    # vd(C) += vs1(A) × vs2(B)
vmadotu  vd, vs1, vs2
vmadotsu vd, vs1, vs2
vmadotus vd, vs1, vs2
```

**寄存器约束**：
- `vd`（目的）：结果矩阵 C 的目标寄存器，**索引必须为偶数**
- `vs1`（源 1）：输入矩阵 A
- `vs2`（源 2）：输入矩阵 B
- 结果存储在两个连续寄存器中（vd 和 vd+1）

#### 2. 浮点矩阵乘累加指令

此指令执行浮点矩阵操作：

| 指令 | 操作数 A 类型 | 操作数 B 类型 | 累加器类型 | 描述 |
|------|--------------|--------------|-----------|------|
| `vfmadot` | fp4/fp8/fp16/bfp16 | fp4/fp8/fp16/bfp16 | fp16/bfp16 | 浮点矩阵乘法 |

**汇编格式**：
```assembly
vfmadot vd, vs1, vs2    # vd(C) += vs1(A) × vs2(B)
```

**寄存器约束**：
- `vd`（目的）：结果矩阵 C 的目标寄存器
- `vs1`（源 1）：输入矩阵 A
- `vs2`（源 2）：输入矩阵 B
- 结果存储在单个寄存器中（与整数指令不同）

### MLIR 操作语法

MLIR 中所有 IME 操作遵循以下模式：

```mlir
ime.vmadot %accumulator, %matrix_a, %matrix_b : memref<...>, memref<...>, memref<...>
```

其中：
- `%accumulator`：目的 memref（二维，元素类型与结果类型匹配）
- `%matrix_a`：左操作数矩阵 A 的 memref（二维）
- `%matrix_b`：右操作数矩阵 B 的 memref（二维）

### MLIR 代码示例

展示 IME 操作的完整 MLIR 示例：

```mlir
func.func @vmadot_example(%arg0: memref<4x4xi32>, %arg1: memref<4x8xi8>, %arg2: memref<8x4xi8>) {
  // 执行矩阵乘累加：arg0 += arg1 × arg2
  ime.vmadot %arg0, %arg1, %arg2 : memref<4x4xi32>, memref<4x8xi8>, memref<8x4xi8>
  return
}

func.func @vmadotu_example(%arg0: memref<4x4xi32>, %arg1: memref<4x8xui8>, %arg2: memref<8x4xui8>) {
  // 无符号整数版本
  ime.vmadotu %arg0, %arg1, %arg2 : memref<4x4xi32>, memref<4x8xui8>, memref<8x4xui8>
  return
}

func.func @vfmadot_example(%arg0: memref<4x4xf16>, %arg1: memref<4x4xf16>, %arg2: memref<4x4xf16>) {
  // 浮点版本
  ime.vfmadot %arg0, %arg1, %arg2 : memref<4x4xf16>, memref<4x4xf16>, memref<4x4xf16>
  return
}
```
