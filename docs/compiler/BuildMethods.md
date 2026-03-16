# 其他构建方式

本文介绍在主要 README 所述标准流程之外，`buddy-mlir` 的额外构建配置与替代构建方法。

## 目录

- [启用图像处理库构建](#启用图像处理库构建)
- [一步构建策略](#一步构建策略)
- [使用 Nix 构建](#使用-nix-构建)
- [工具](#工具)

## 启用图像处理库构建

若需在构建中启用图像处理相关库，请在 cmake 配置时加入以下选项：

```bash
$ cd buddy-mlir/build
$ cmake -G Ninja .. \
    -DMLIR_DIR=$PWD/../llvm/build/lib/cmake/mlir \
    -DLLVM_DIR=$PWD/../llvm/build/lib/cmake/llvm \
    -DLLVM_ENABLE_ASSERTIONS=ON \
    -DCMAKE_BUILD_TYPE=RELEASE \
    -DBUDDY_MLIR_ENABLE_DIP_LIB=ON \
    -DBUDDY_ENABLE_PNG=ON
$ ninja
$ ninja check-buddy
```

**配置说明：**

- `BUDDY_MLIR_ENABLE_DIP_LIB=ON`：启用数字图像处理（DIP）库
- `BUDDY_ENABLE_PNG=ON`：启用 PNG 格式支持

## 一步构建策略

若希望更方便地在自己的项目中使用 `buddy-mlir` 工具，可采用一步构建策略：将 LLVM、MLIR 与 `buddy-mlir` 作为 LLVM 外部项目一并构建。

```bash
$ cd buddy-mlir
$ cmake -G Ninja -Bbuild \
    -DCMAKE_BUILD_TYPE=RELEASE \
    -DLLVM_ENABLE_PROJECTS="mlir;clang" \
    -DLLVM_TARGETS_TO_BUILD="host;RISCV" \
    -DLLVM_EXTERNAL_PROJECTS="buddy-mlir" \
    -DLLVM_EXTERNAL_BUDDY_MLIR_SOURCE_DIR="$PWD" \
    -DLLVM_ENABLE_ASSERTIONS=ON \
    llvm/llvm
$ cd build
$ ninja check-mlir check-clang
$ ninja
$ ninja check-buddy
```

## 使用 Nix 构建

本仓库支持通过 Nix flake 进行可复现构建。请先按 [Nix 安装说明](https://nixos.org/manual/nix/stable/installation/installation.html) 安装 Nix，并启用 [flake 功能](https://nixos.wiki/wiki/Flakes#Other_Distros.2C_without_Home-Manager)。

### 开发环境

若要参与本项目开发，可进入开发 shell：

```bash
$ nix develop .
```

该命令会启动一个已配置好 `clang`、`ccls`、`cmake`、`ninja` 等依赖的 bash 环境，便于从源码构建 `buddy-mlir`。

### 二进制工具

若仅需使用 `buddy-mlir` 的二进制工具：

```bash
$ nix build .#buddy-mlir
$ ./result/bin/buddy-opt --version
```

此方式在隔离、可复现的环境中生成产物，不影响系统其余配置。

## 工具

### buddy-opt

`buddy-opt` 是 `buddy-mlir` 的优化驱动，与 LLVM 中的 `mlir-opt` 类似，用于运行项目中定义的所有方言与优化 Pass。

**用法：**

```bash
$ buddy-opt [options] <input-file>
```

**常用选项：**
- `--help`：显示可用 Pass 与选项
- `--pass-pipeline`：指定自定义 Pass 管道
- `--mlir-print-ir-after-all`：在每个 Pass 后打印 IR

**示例：**

```bash
$ buddy-opt --lower-affine --convert-linalg-to-loops input.mlir
```

### buddy-lsp-server

`buddy-lsp-server` 可替代 `mlir-lsp-server`，为 `buddy-mlir` 中定义的所有方言提供 LSP（Language Server Protocol）支持。

**功能：**
- 自定义方言（`rvv`、`gemmini`、`dip` 等）的代码补全
- 实时错误诊断
- 悬停信息与符号跳转
- 语法高亮

**在 VSCode 中配置：**

在 VSCode 设置中修改 MLIR LSP 服务器路径：

```json
{
    "mlir.server_path": "/path/to/buddy-mlir/build/bin/buddy-lsp-server"
}
```
