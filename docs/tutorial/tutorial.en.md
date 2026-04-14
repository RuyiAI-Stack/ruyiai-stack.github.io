# Tutorial

## End-to-end model inference

RuyiAI currently provides an end-to-end flow from toolchain build, model generation, to inference execution. The process is divided into three steps:

1. Build the toolchain
2. Build the RAX model
3. Run the model with `buddy-cli`

These capabilities are still under active development and improvement. More convenient direct-install packages will be provided gradually to lower deployment and usage barriers.

### 1. Build the toolchain

RuyiAI currently relies on the underlying compiler toolchain for model compilation and execution support, and Buddy Compiler is the AI compiler core in this flow. Before use, first get the source code and initialize submodules:

```bash
$ git clone git@github.com:buddy-compiler/buddy-mlir.git
$ cd buddy-mlir
$ git submodule update --init llvm
```

Then build foundational components such as LLVM/MLIR/Clang. A basic build flow is:

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

After LLVM/MLIR is built, continue to build Buddy Compiler:

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

After this stage, you will have the foundational compiler capabilities required by RuyiAI, which prepares the environment for subsequent model generation and execution.

### 2. Build the model into RAX format

After the toolchain is ready, the next step is to compile the input model with Buddy Compiler and generate a RAX model. RAX is the model format used in the RuyiAI end-to-end execution flow. It carries the compiled execution representation and serves as the input for later inference execution.

In the examples from the buddy-mlir README, you can build a model with:

```bash
cd buddy-mlir
python3 tools/buddy-codegen/build_model.py \
  --spec models/deepseek_r1/specs/f32.json \
  --build-dir build
```

If model weights are in a local HuggingFace-style directory, you can also specify a local path with `--local-model`:

```bash
python3 tools/buddy-codegen/build_model.py \
  --spec models/deepseek_r1/specs/f32.json \
  --build-dir build \
  --local-model /path/to/DeepSeek-R1-Distill-Qwen-1.5B
```

From the RuyiAI process perspective, this step is: **input model -> compile with Buddy Compiler -> generate RAX model**.

### 3. Run the model with buddy-cli

After the RAX model is generated, you can load it with `buddy-cli` and run inference. A basic execution example from the README is:

```bash
./build/bin/buddy-cli \
  --model ./build/models/deepseek_r1/deepseek_r1.rax \
  --prompt "Tell me a joke in 200 words."
```

If you need to bind NUMA nodes and CPU cores:

```bash
# Equivalent to: numactl --cpunodebind=0,1,2,3 --interleave=0,1,2,3 taskset -c 0-47
./build/bin/buddy-cli \
  --numa 0,1,2,3 \
  --cpus 0-47 \
  --model ./build/models/deepseek_r1/deepseek_r1.rax \
  --prompt "Tell me a joke in 200 words."
```

In short, the current basic usage flow of RuyiAI is clear: Buddy Compiler compiles models and generates RAX, while `buddy-cli` loads RAX and performs inference execution.
