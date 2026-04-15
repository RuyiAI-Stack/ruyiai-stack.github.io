# 使用教程

## 模型端到端推理

RuyiAI 当前提供了一条从工具链构建、模型生成到推理执行的端到端流程。整体分为三个步骤：

1. 构建工具链
2. 构建 RAX 模型
3. 使用 `buddy-cli` 执行模型

当前相关能力仍在持续建设和完善中，将逐步提供更便捷的直接安装版本，以降低部署和使用门槛。

### 1. 构建工具链

RuyiAI 当前依赖底层编译工具链完成模型编译和执行支持，而 Buddy Compiler 则是这一流程中的 AI 编译器核心。使用前，首先需要获取源码并初始化子模块：

```bash
$ git clone git@github.com:buddy-compiler/buddy-mlir.git
$ cd buddy-mlir
$ git submodule update --init llvm
```

随后，需要先构建 LLVM/MLIR/Clang 等基础组件。基础构建方式如下：

```bash
$ cd buddy-mlir
$ mkdir llvm/build
$ cd llvm/build
$ cmake -G Ninja ../llvm \
    -DLLVM_ENABLE_PROJECTS="mlir;clang;openmp" \
    -DLLVM_TARGETS_TO_BUILD="host;RISCV" \
    -DLLVM_ENABLE_ASSERTIONS=ON \
    -DOPENMP_ENABLE_LIBOMPTARGET=OFF \
    -DCMAKE_BUILD_TYPE=RELEASE \
    -DMLIR_ENABLE_BINDINGS_PYTHON=ON \
    -DPython3_EXECUTABLE=$(which python3)
$ ninja check-clang check-mlir omp
```

在完成 LLVM/MLIR 构建后，继续构建 Buddy Compiler：

```bash
$ cd buddy-mlir
$ mkdir build
$ cd build
$ cmake -G Ninja .. \
    -DMLIR_DIR=$PWD/../llvm/build/lib/cmake/mlir \
    -DLLVM_DIR=$PWD/../llvm/build/lib/cmake/llvm \
    -DLLVM_ENABLE_ASSERTIONS=ON \
    -DCMAKE_BUILD_TYPE=RELEASE \
    -DBUDDY_MLIR_ENABLE_PYTHON_PACKAGES=ON \
    -DPython3_EXECUTABLE=$(which python3)
$ ninja
$ ninja check-buddy
$ export BUDDY_MLIR_BUILD_DIR=$PWD
$ export LLVM_MLIR_BUILD_DIR=$PWD/../llvm/build
$ export PYTHONPATH=${BUDDY_MLIR_BUILD_DIR}/python_packages:${PYTHONPATH}
```

这一阶段完成后，即可获得 RuyiAI 所需的基础编译工具能力，并为后续模型生成和执行打下基础。

### 2. 将模型构建为 RAX 格式

在工具链构建完成后，下一步是使用 Buddy Compiler 将输入模型编译并生成 RAX 模型。RAX 是 RuyiAI 端到端执行流程中的模型格式，用于承载模型经过编译后的执行表示，并作为后续推理执行的输入。

在 buddy-mlir README 的示例中，可以通过如下命令构建模型：

```bash
cd buddy-mlir
python3 tools/buddy-codegen/build_model.py \
  --spec models/deepseek_r1/specs/f32.json \
  --build-dir build
```

如果模型权重位于本地 HuggingFace 风格目录中，也可以通过 `--local-model` 指定本地模型路径。

```bash
python3 tools/buddy-codegen/build_model.py \
  --spec models/deepseek_r1/specs/f32.json \
  --build-dir build \
  --local-model /path/to/DeepSeek-R1-Distill-Qwen-1.5B
```

从 RuyiAI 的流程角度看，这一步对应的是：**输入模型 → Buddy Compiler 编译 → 生成 RAX 模型**

### 3. 使用 buddy-cli 执行模型

在生成 RAX 模型之后，即可通过 `buddy-cli` 加载模型并执行推理。README 中给出的基础执行示例如下：

```bash
./build/bin/buddy-cli \
  --model ./build/models/deepseek_r1/deepseek_r1.rax \
  --prompt "Tell me a joke in 200 words."
```

如果需要绑定 NUMA 节点和 CPU 核心：

```bash
# Equivalent to: numactl --cpunodebind=0,1,2,3 --interleave=0,1,2,3 taskset -c 0-47
./build/bin/buddy-cli \
  --numa 0,1,2,3 \
  --cpus 0-47 \
  --model ./build/models/deepseek_r1/deepseek_r1.rax \
  --prompt "Tell me a joke in 200 words."
```

RuyiAI 当前的基本使用方式可以明确概括 Buddy Compiler 负责模型编译并生成 RAX，`buddy-cli` 负责加载 RAX 并完成推理执行。
