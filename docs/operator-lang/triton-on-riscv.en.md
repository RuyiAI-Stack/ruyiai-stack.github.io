# Triton RISC-V Adaptation

## TL;DR

If you'd rather skip the story behind it, go ahead and try the repository directly:

https://github.com/RuyiAI-Stack/triton-riscv

The triton-riscv repository is forked from triton-shared. Since triton-shared is no longer actively maintained, we continue to support the RISC-V platform under the name triton-riscv. Currently, test cases can be run directly on RISC-V platforms (tested and passing on SG2044; testing on other RISC-V platforms is ongoing):

![Test passing on RISC-V screenshot](./assets/docs:operator_lang:triton_on_riscv:test_pass.jpg)

The current implementation in the repository is the most basic version that can run through. Following the README might still lead to various RISC-V dependency issues, and the process is somewhat complex. We will provide a packaged version later for easier use — feel free to contact us if you encounter any problems. Additionally, we are currently porting and testing the vectorization and high-performance passes from Buddy Compiler — stay tuned!

We also recommend checking out this article about running Triton on RISC-V using AOT cross-compilation, which complements our work:

**Triton Compiler Porting and Adaptation on RISC-V**

https://mp.weixin.qq.com/s/GIUEbW4lQb3-c1DjKwucTA

------------------------------------------------------------------------

## Porting Strategy and Compilation Approach

Let's set aside the story of performance portability for now and focus on the porting story.

Triton has a GPU-first design. From its compilation path design, it's even a GPU-only design. Even though it provides a PLUGIN interface, it makes no concessions when it comes to GPU dependencies, for example:

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

The entire porting process is somewhat like an appendectomy — we need to ensure we don't require GPU backend dependencies, yet we can't completely remove GPU-related targets. This is because the source code for building `libtriton.so` needs the GPU compilation path. My approach is to keep this code for now, because we will eventually have RISC-V drivers for NV / AMD.

So let's keep the GPU targets — they'll be useful someday — as long as they don't break the RISC-V build. (After all, we're performing an appendectomy, not an amputation.)

------------------------------------------------------------------------

## Current Compilation Strategy

- Python @triton.jit
- TTIR (Triton repo handles compilation from AST to TTIR)
- Linalg MLIR (triton-shared-opt converts TTIR to Linalg Dialect-level IR)
- LLVM MLIR (buddy-opt / mlir-opt converts Linalg Dialect-level IR to LLVM Dialect-level IR)
- LLVM IR (mlir-translate converts LLVM Dialect-level IR to LLVM IR)
- Object File (LLVM toolchain generates the target object file)

------------------------------------------------------------------------

## A Minor Surgery

## Python Build Script (`setup.py`)

Change the default "built-in nvidia + amd + external backends" to use only external backends:

``` python
# Original: backends = [*BackendInstaller.copy(["nvidia", "amd"]), *BackendInstaller.copy_externals()]

backends = [*BackendInstaller.copy_externals()]
```

Only download third-party dependencies when the NVIDIA backend is present, otherwise it keeps looking for RISC-V NV dependencies (looking forward to NV supporting RISC-V):

**Nvidia to bring CUDA platform support to the RISC-V**

https://riscv.org/blog/nvidia-to-bring-cuda-platform-support-to-the-risc-v/

``` python
if any(b.name == "nvidia" for b in backends):
    download_and_copy_dependencies()
```

Additionally, the CMake variables `TRITON_BUILD_UT` and `TRITON_BUILD_PROTON`, which are strongly tied to GPU backends, are set to `OFF` by default.

------------------------------------------------------------------------

## Don't Remove Everything

Targets like NVGPUIR, NVWSIR, and NVWSTransforms don't depend on NVIDIA proprietary libraries themselves, but are unconditionally referenced by Triton core transforms (such as TritonInstrumentToLLVM and TritonGPU transforms). When the NV backend is not enabled, the full `third_party/nvidia/` won't be pulled, so we need to include the header files and a small number of Dialects in the build separately:

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

In a RISC-V-only build, the core IR and transforms can still compile without requiring the full NVIDIA backend.

------------------------------------------------------------------------

## Conditionally Link LLVM Targets and Host Architecture

- **NVPTX**: Only link `LLVMNVPTXCodeGen` when `LLVM_TARGETS_TO_BUILD` includes NVPTX.

- **AMDGPU**: Only link when AMDGPU is included:

  - LLVMAMDGPUCodeGen
  - LLVMAMDGPUAsmParser

- **RISC-V**: When `LLVM_TARGETS_TO_BUILD` includes RISCV, link:

  - LLVMRISCVCodeGen
  - LLVMRISCVAsmParser
  - LLVMRISCVDesc
  - LLVMRISCVDisassembler
  - LLVMRISCVInfo

This way, Triton can correctly link LLVM's RISC-V code generation libraries. Additionally, when selecting the host architecture's LLVM libraries based on `CMAKE_SYSTEM_PROCESSOR`, we add support for `riscv64`:

``` cmake
elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "riscv64")
  list(APPEND TRITON_LIBRARIES
    LLVMRISCVCodeGen
    LLVMRISCVAsmParser
  )
```

When building on a RISC-V host, this links the RISC-V CodeGen/AsmParser for generating native code.

------------------------------------------------------------------------

## Changes to the Triton Main Repository

Other changes won't be elaborated here. A rough summary:

| File | Key Changes |
|------|-------------|
| CMakeLists.txt | NVWS/NVGPU still participate in build without NV backend; conditionally link NVPTX/AMDGPU/RISCV based on LLVM targets and host arch; add libraries for riscv64; TRITON_ENABLE_* macros; Proton/bin/test built based on backend availability |
| bin/CMakeLists.txt | TritonAMDGPUTestAnalysis conditionally linked based on AMD backend |
| bin/RegisterTritonDialects.h | NVIDIA/AMD related includes and dialect registration use TRITON_ENABLE_* conditional compilation |
| lib/Dialect/TritonGPU/Transforms/CMakeLists.txt | NVWSIR/NVWSTransforms dependency order adjustment |
| python/src/gluon_ir.cc | AMD-specific types and APIs wrapped with TRITON_ENABLE_AMD |
| setup.py | Use only external backends; download dependencies only for nvidia; TRITON_BUILD_UT / TRITON_BUILD_PROTON toggled by built-in backend switch |
| third_party/proton/CMakeLists.txt | Proton test only included when TRITON_BUILD_UT is ON |
| third_party/proton/Dialect/CMakeLists.txt | Proton plugins and NV/AMD libraries conditionally built and linked based on TRITON_CODEGEN_BACKENDS |
| third_party/proton/Dialect/lib/ProtonGPUToLLVM/CMakeLists.txt | Proton NVIDIA/AMD subdirectories conditionally added based on backend |

Finishing the Triton main repository changes doesn't mean everything is done — the compilation path for the RISC-V platform still needs to be integrated via the PLUGIN approach.

We'll leave that for the next installment.

------------------------------------------------------------------------

## Summary

To run Triton on the RISC-V platform, a series of modifications to Triton itself are needed, combined with the PLUGIN compilation path. The core idea is to decouple the build and runtime dependencies that were originally tightly coupled to NVIDIA/AMD GPUs, supporting a zero-GPU-backend build approach. This enables successful compilation and linking of the Triton library in environments with only a RISC-V LLVM toolchain, laying the foundation for connecting RISC-V code generation later.
