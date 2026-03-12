## Overview

The `buddy-mlir` pre-built releases provide two types of packages:

- **Python wheel**: Provides Python API, `buddy_mlir` bindings, and command-line tools such as `buddy-opt`.
- **C++ archive**: Provides Buddy/LLVM/MLIR toolchain, headers, and static libraries.

## Install Python Support

### Prerequisites

It is recommended to create a virtual environment first:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

PyTorch must be installed before using the Buddy frontend to import PyTorch models. Please refer to the official installation page: https://pytorch.org/get-started/locally/

The simplest CPU installation is as follows:

```bash
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
```

For RISC-V, since PyTorch does not officially support RISC-V yet, you can build from source or use third-party builds: https://community-ci.openruyi.cn/pypi/riscv64/dev/+simple/torch/

Then visit the [release](https://github.com/buddy-compiler/buddy-mlir/releases) page to install the wheel that matches your Python version and system architecture.

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

After installation, you can verify the installation with the following commands:

```bash
python -c "import buddy; import buddy_mlir; print('python packages: ok')"
python -c "from buddy_mlir import ir; print('mlir ok')"
buddy-opt --version
```

## Install C++ Support

If you want to use Buddy's headers, static libraries, or toolchain in your C++ project, you can use the `buddy-<version>-<python-tag>-<platform>.tar.gz` distributed under Releases.

Verify DAP Dialect and CMake Integration

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

Build:

```bash
cmake -S . -B build -G Ninja
cmake --build build
./build/biquad_demo
```
