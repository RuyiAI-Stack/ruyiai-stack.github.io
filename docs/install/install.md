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

使用 Buddy 前端导入 PyTorch 模型需要先安装 PyTorch。请以 PyTorch 官方安装页为准：https://pytorch.org/get-started/locally/

最简单的 CPU 版本安装方式如下：

```bash
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
```

然后请前往 [release](https://github.com/buddy-compiler/buddy-mlir/releases) 页面，安装与您的 Python 版本和系统架构匹配的 wheel。

wheel 文件名通常类似：

```text
buddy-<version>-cp310-cp310-manylinux_2_28_x86_64.whl
```

例如，`x86_64 + Python 3.10`：

```bash
python -m pip install \
  https://github.com/buddy-compiler/buddy-mlir/releases/download/v0.0.1/buddy-0.0.1-cp310-cp310-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl
```

例如，`riscv64 + Python 3.12`：

```bash
python -m pip install \
  https://github.com/buddy-compiler/buddy-mlir/releases/download/v0.0.1/buddy-0.0.1-cp312-cp312-manylinux_2_39_riscv64.whl
```

安装完成后，可以通过下面的命令检测是否安装成功。

```bash
python -c "import buddy; import buddy_mlir; print('python packages: ok')"
python -c "from buddy_mlir import ir; print('mlir ok')"
buddy-opt --version
```

## 安装 C++ 支持库

如果您要在 C++ 工程中使用 Buddy 的头文件、静态库或编译工具链，可以使用 Release 下分发的
`buddy-<version>-<python-tag>-<platform>.tar.gz`。

验证 DAP Dialect 和 CMake 集成

`CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.24)
project(buddy_biquad_demo LANGUAGES CXX)

include(FetchContent)

FetchContent_Declare(
  buddy
  URL "https://github.com/buddy-compiler/buddy-mlir/releases/download/v0.0.1/buddy-0.0.1-cp310-cp310-manylinux_2_28_x86_64.tar.gz"
)

FetchContent_MakeAvailable(buddy)

add_executable(biquad_demo main.cpp)
target_include_directories(biquad_demo PRIVATE
  "${buddy_SOURCE_DIR}/include/buddy-mlir"
)
```

`main.cpp`

```cpp
#include <buddy/Core/Container.h>
#include <buddy/DAP/DSP/Biquad.h>
#include <iostream>

int main() {
  intptr_t sizes[1] = {6};
  MemRef<float, 1> kernel(sizes);
  dap::biquadLowpass<float, 1>(kernel, 0.2f, 0.707f);

  for (intptr_t i = 0; i < sizes[0]; ++i)
    std::cout << kernel[i] << (i + 1 == sizes[0] ? '\n' : ' ');
  return 0;
}
```

构建：

```bash
cmake -S . -B build -G Ninja
cmake --build build
./build/biquad_demo
```
