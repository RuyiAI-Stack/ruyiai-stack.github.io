如果不想看后面的故事，可以直接到仓库去试试

https://github.com/RuyiAI-Stack/triton-riscv

triton-riscv 这个仓库是 Fork 自 triton-shared，由于 triton-shared
不再继续维护了，我们就以 triton-riscv 为名持续支持 RISC-V
平台吧。目前可以在 RISC-V 平台直接跑通测试用例（已在 SG2044
上通过测试，其他 RISC-V 平台还在陆续进行测试）：

![在 RISC-V 上通过测试的截图](./assets/docs:operator_lang:triton_on_riscv:test_pass.jpg)

目前仓库里面的实现为最基础能够跑通的版本，按照 README 走一遍也许还会遇到
RISC-V
的各种依赖问题，流程稍显复杂，我们后续会提供打包的版本以便大家使用，遇到问题也可随时联系我们。此外，我们目前正在把
Buddy Compiler 里面的向量化和高性能 Pass 进行移植与测试，可以期待一波！

同时，推荐大家去看看这个介绍 Triton 用 AOT 交叉编译方法跑在 RISC-V
的文章，可以互作补充：

**Triton 编译器在 RISC-V 上的移植与适配实践**

https://mp.weixin.qq.com/s/GIUEbW4lQb3-c1DjKwucTA





## 移植思路和编译策略

性能可移植的故事先按下不表，本文先讲讲关于移植的故事。

Triton 是 GPU-first 的设计，从编译路径的设计上可以看出，它甚至是
GPU-only 的设计。即使留出了 PLUGIN 的接口，但是它在使用 GPU
依赖时毫不让步，例如：

``` cmake
set(TRITON_LIBRARIES
    ${triton_libs}
    ${triton_plugins}
    ...
    # LLVM
    LLVMPasses
    LLVMNVPTXCodeGen
    LLVMAMDGPUCodeGen
    LLVMAMDGPUAsmParser
    ...
)
```

整个移植的过程有点像一场阑尾炎手术，要保证不需要 GPU
的后端依赖，又不能完全屏蔽掉 GPU 相关的 Target。这是因为构建
`libtriton.so` 的源码中需要 GPU
编译链路，我的想法是先保留这部分代码，因为我们终将拥有 RISC-V 的 NV /
AMD 驱动。

所以，还是留着 GPU Target 吧，总有一天会用上，只要它不挂掉面向 RISC-V
的构建即可。（毕竟我们在做阑尾炎手术，不是截肢手术）




## 目前的编译策略

- Python @triton.jit
- TTIR (Triton 仓库负责从 AST 编译到 TTIR）
- Linalg MLIR (triton-shared-opt 负责将 TTIR 转换到 Linalg Dialect 层级 IR）
- LLVM MLIR（buddy-opt / mlir-opt 负责将 Linalg Dialect 层级 IR 转换到 LLVM DIalect 层级 IR）
- LLVM IR (mlir-translate 负责将 LLVM Dialect 层级 IR 转换成 LLVM IR)
- Object File（LLVM 工具链进而生成目标文件）




## 一场小手术

## Python 构建脚本（`setup.py`）

将默认的"内建 nvidia + amd + 外部后端"改为仅使用外部后端：

``` python
# 原：backends = [*BackendInstaller.copy(["nvidia", "amd"]), *BackendInstaller.copy_externals()]

backends = [*BackendInstaller.copy_externals()]
```

有 NVIDIA 后端再下载第三方依赖，不然会一直找 RISC-V 的 NV 依赖（期待 NV
适配 RISC-V）

**Nvidia to bring CUDA platform support to the RISC-V**

https://riscv.org/blog/nvidia-to-bring-cuda-platform-support-to-the-risc-v/

``` python
if any(b.name == "nvidia" for b in backends):
    download_and_copy_dependencies()
```

另外，和 GPU 后端强相关的 `TRITON_BUILD_UT` 和 `TRITON_BUILD_PROTON` 的
CMake 变量默认置为 `OFF` 关闭状态。




## 不要赶尽杀绝

NVGPUIR、NVWSIR、NVWSTransforms 等 Target 本身不依赖 NVIDIA 闭源库，但被
Triton 核心变换（如 TritonInstrumentToLLVM、TritonGPU
变换）无条件引用。在未启用 NV 后端时，不会拉取完整
`third_party/nvidia/`，因此需要单独把头文件和少量 Dialect 纳入构建：

``` cmake
if (NOT "nvidia" IN_LIST TRITON_CODEGEN_BACKENDS)
  include_directories(${PROJECT_SOURCE_DIR}/third_party/nvidia/include)
  include_directories(${PROJECT_BINARY_DIR}/third_party/nvidia/include)
  add_subdirectory(third_party/nvidia/include/Dialect/NVGPU)
  add_subdirectory(third_party/nvidia/lib/Dialect/NVGPU)
  add_subdirectory(third_party/nvidia/include/Dialect/NVWS)
  add_subdirectory(third_party/nvidia/lib/Dialect/NVWS)
endif()
```

在 RISC-V-only 构建时，核心 IR 与变换仍能编译通过，而不需要完整 NVIDIA
后端。




## 按需链接 LLVM 目标与主机架构

- **NVPTX**：仅当 `LLVM_TARGETS_TO_BUILD` 包含 NVPTX 时链接
`LLVMNVPTXCodeGen`。

- **AMDGPU**：仅当包含 AMDGPU 时链接：

  - LLVMAMDGPUCodeGen
  - LLVMAMDGPUAsmParser

- **RISC-V**：当 `LLVM_TARGETS_TO_BUILD` 包含 RISCV 时链接：

  - LLVMRISCVCodeGen
  - LLVMRISCVAsmParser
  - LLVMRISCVDesc
  - LLVMRISCVDisassembler
  - LLVMRISCVInfo

这样一来，Triton 能正确链接 LLVM 的 RISC-V 代码生成的库。此外，在按 `CMAKE_SYSTEM_PROCESSOR` 选择本机架构对应的 LLVM 库时，增加对
`riscv64` 的支持：

``` cmake
elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "riscv64")
  list(APPEND TRITON_LIBRARIES
    LLVMRISCVCodeGen
    LLVMRISCVAsmParser
  )
```

在 RISC-V 主机上构建时，链接 RISC-V 的
CodeGen/AsmParser，用于生成当前机器的代码。



## Triton 主仓库的修改

其他修改就不赘述了，大概总结如此：

  ---------------------------------------------------------------------------------------------------
| 文件 | 改动要点 |
|------|----------|
| CMakeLists.txt | NVWS/NVGPU 在无 NV 后端时仍参与构建；按 LLVM 目标与主机架构条件链接 NVPTX/AMDGPU/RISCV；为 riscv64 增加库；TRITON_ENABLE_* 宏；Proton/bin/test 按后端存在与否决定是否构建 |
| bin/CMakeLists.txt | TritonAMDGPUTestAnalysis 按 AMD 后端条件链接 |
| bin/RegisterTritonDialects.h | NVIDIA/AMD 相关 include 与 dialect 注册用 TRITON_ENABLE_* 条件编译 |
| lib/Dialect/TritonGPU/Transforms/CMakeLists.txt | NVWSIR/NVWSTransforms 依赖顺序调整 |
| python/src/gluon_ir.cc | AMD 专用类型与 API 用 TRITON_ENABLE_AMD 包裹 |
| setup.py | 仅使用外部后端；仅 nvidia 时下载依赖；TRITON_BUILD_UT / TRITON_BUILD_PROTON 按内建后端开关 |
| third_party/proton/CMakeLists.txt | Proton test 仅在 TRITON_BUILD_UT 时加入 |
| third_party/proton/Dialect/CMakeLists.txt | Proton 插件及 NV/AMD 库按 TRITON_CODEGEN_BACKENDS 条件构建与链接 |
| third_party/proton/Dialect/lib/ProtonGPUToLLVM/CMakeLists.txt | Proton NVIDIA/AMD 子目录按后端条件添加 |
  ---------------------------------------------------------------------------------------------------

改完 Triton 主仓库也并非万事大吉，面向 RISC-V 平台的编译通路还需要使用
PLUGIN 的方式集成进来。

这部分拴个扣子，且听下回分解。



## 总结一下

为了在 RISC-V 平台上运行 Triton，需要对 Triton
本身进行一系列修改，再搭配 PLUGIN 的编译通路。核心思路是把原先强依赖
NVIDIA/AMD GPU 的构建与运行时依赖拆开，支持零 GPU
后端的构建方式，从而在仅带 RISC-V LLVM 工具链的环境里也能成功编译并链接
Triton 库，为后续接上 RISC-V 代码生成打下基础。