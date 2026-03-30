## 在中端添加 Pass（Add Pass）

本文以 `BatchMatMul` 为例，介绍在 buddy 项目中为特定算子添加优化 Pass 的整体流程。

### 编写并测试 `kernel` 函数文件

1. 从计算图对应的 MLIR 中确定待优化算子，并基于该算子实现 `kernel` 函数，作为示例输入。

   ```mlir
   // linalg-batchmatmul-f32.mlir

   func.func private @printMemrefF32(memref<*xf32>)

   func.func @kernel(%arg0: memref<?x?x?xf32>, %arg1: memref<?x?x?xf32>, %arg2: memref<?x?x?xf32>) {
     linalg.batch_matmul
       ins(%arg0, %arg1 : memref<?x?x?xf32>, memref<?x?x?xf32>)
       outs(%arg2 : memref<?x?x?xf32>)
     %printed_output = memref.cast %arg2 : memref<?x?x?xf32> to memref<*xf32>
     call @printMemrefF32(%printed_output) : (memref<*xf32>) -> ()
     return
   }
   ```

   其中 `@printMemrefF32` 用于打印一维向量。

2. 实现 `main` 函数，调用 `kernel`，并验证其执行正确，作为源文件输入。

   ```mlir
   // linalg-batchmatmul-f32.mlir

   func.func @main(){
     %c0 = arith.constant 0 : index
     %c1 = arith.constant 1 : index
     %c576 = arith.constant 576 : index
     %c1024 = arith.constant 1024 : index
     %c1000 = arith.constant 1000 : index
     %f0 = arith.constant 0.0 : f32
     %f2 = arith.constant 2.0 : f32
     %f3 = arith.constant 3.0 : f32

     %m0 = call @alloc_f32(%c1, %c1, %c576, %f2) : (index, index, index, f32) -> memref<?x?x?xf32>
     %m1 = call @alloc_f32(%c1, %c576, %c1024, %f3) : (index, index, index, f32) -> memref<?x?x?xf32>
     %m2 = call @alloc_f32(%c1, %c1, %c1024, %f0) : (index, index, index, f32) -> memref<?x?x?xf32>

     call @batch_matmul(%m0, %m1, %m2) : (memref<?x?x?xf32>, memref<?x?x?xf32>, memref<?x?x?xf32>) -> ()

     return
   }
   ```

3. 添加构建规则与校验数据，确保 `check-buddy` 能正确通过。

   ```mlir
   // linalg-batchmatmul-f32.mlir

   // RUN: buddy-opt %s \
   // RUN:     -batchmatmul-optimize \
   // RUN:     -convert-linalg-to-affine-loops \
   // RUN:     -lower-affine \
   // RUN:     -convert-vector-to-scf \
   // RUN:     -convert-scf-to-cf \
   // RUN:     -convert-vector-to-llvm \
   // RUN:     -convert-math-to-llvm \
   // RUN:     -convert-math-to-libm \
   // RUN:     -convert-arith-to-llvm \
   // RUN:     -convert-func-to-llvm \
   // RUN:     -expand-strided-metadata \
   // RUN:     -finalize-memref-to-llvm \
   // RUN:     -reconcile-unrealized-casts \
   // RUN: | mlir-cpu-runner -e main -entry-point-result=void \
   // RUN:     -shared-libs=%mlir_runner_utils_dir/libmlir_runner_utils%shlibext \
   // RUN:     -shared-libs=%mlir_runner_utils_dir/libmlir_c_runner_utils%shlibext \
   // RUN: | FileCheck %s

   func.func private @printMemrefF32(memref<*xf32>)

   func.func @kernel(%arg0: memref<?x?x?xf32>, %arg1: memref<?x?x?xf32>, %arg2: memref<?x?x?xf32>) {
   ...
       %m2 = call @alloc_f32(%c1, %c1, %c1024, %f0) : (index, index, index, f32) -> memref<?x?x?xf32>

       // CHECK: Unranked Memref base@ = {{.*}} rank = 3 offset = 0 sizes = [1, 1, 1024] strides = [1024, 1024, 1] data =
       // CHECK-NEXT: [
       // CHECK: [
       // CHECK: [3456{{(, 3456)*}}]
       call @batch_matmul(%m0, %m1, %m2) : (memref<?x?x?xf32>, memref<?x?x?xf32>, memref<?x?x?xf32>) -> ()
   ...
   ```

4. 在 makefile 中添加构建源 MLIR 文件（`linalg-batchmatmul-f32.mlir`）的规则。

   ```makefile

   linalg-batchmatmul-f32-lower:
   	@${BUDDY_OPT} ./linalg-batchmatmul-f32.mlir \
   		-convert-linalg-to-affine-loops \
   		-affine-parallelize \
   		-lower-affine \
   		-convert-scf-to-openmp \
   		-convert-vector-to-scf \
   		-expand-strided-metadata \
   		-convert-vector-to-llvm \
   		-memref-expand \
   		-arith-expand \
   		-convert-arith-to-llvm \
   		-finalize-memref-to-llvm  \
   		-convert-scf-to-cf \
   		-convert-openmp-to-llvm \
   		-convert-math-to-llvm \
   		-convert-math-to-libm  \
   		-convert-func-to-llvm \
   		-reconcile-unrealized-casts  \
   		-o log.mlir

   linalg-batchmatmul-f32-run:
   	@${BUDDY_OPT} ./linalg-batchmatmul-f32.mlir \
   		-convert-linalg-to-affine-loops \
   		-affine-parallelize \
   		-lower-affine \
   		-convert-scf-to-openmp \
   		-convert-vector-to-scf \
   		-expand-strided-metadata \
   		-convert-vector-to-llvm \
   		-memref-expand \
   		-arith-expand \
   		-convert-arith-to-llvm \
   		-finalize-memref-to-llvm  \
   		-convert-scf-to-cf \
   		-convert-openmp-to-llvm \
   		-convert-math-to-llvm \
   		-convert-math-to-libm  \
   		-convert-func-to-llvm \
   		-reconcile-unrealized-casts | \
   	${MLIR_CPU_RUNNER} ${OPT_FLAG} -e main -entry-point-result=void \
   		-shared-libs=${MLIR_RUNNER_UTILS} -shared-libs=${MLIR_C_RUNNER_UTILS} \
   		-shared-libs=${LIB_OMP}

   linalg-batchmatmul-f32-aot:
   	@${BUDDY_OPT} ./linalg-batchmatmul-f32.mlir \
   		-convert-linalg-to-affine-loops \
   		-affine-parallelize \
   		-lower-affine \
   		-convert-scf-to-openmp \
   		-convert-vector-to-scf \
   		-expand-strided-metadata \
   		-convert-vector-to-llvm \
   		-memref-expand \
   		-arith-expand \
   		-convert-arith-to-llvm \
   		-finalize-memref-to-llvm  \
   		-convert-scf-to-cf \
   		-convert-openmp-to-llvm \
   		-convert-math-to-llvm \
   		-convert-math-to-libm  \
   		-convert-func-to-llvm \
   		-reconcile-unrealized-casts | \
   	${MLIR_TRANSLATE} -mlir-to-llvmir -o log.ll
   	${CLANG} log.ll -O3 \
   		-L${MLIR_LIB} -lmlir_runner_utils -lmlir_c_runner_utils \
   		-o a.out
   	@LD_LIBRARY_PATH=${MLIR_LIB} ./a.out
   ```

   - `linalg-batchmatmul-f32-lower`: Build linalg-batchmatmul-f32.mlir to get the compiled mlir file, stored in log.mlir.
   - `linalg-batchmatmul-f32-run`: Build and execute linalg-batchmatmul-f32.mlir via JIT.
   - `linalg-batchmatmul-f32-aot`: Build linalg-batchmatmul-f32.mlir to get the corresponding AOT file.

完整源码请参考 [batchmatmul-f32.mlir](../examples/BuddyMatmul/linalg-batchmatmul-f32.mlir) 和 [makefile](../examples/BuddyMatmul/makefile)。

### 编写手工优化后的 MLIR 文件

1. 基于 `kernel` 中算子的计算特征，通过多种优化策略，使用 MLIR 语法手工实现优化后的 MLIR 代码。

   ```mlir
   // batchmatmul-vectorization.mlir

   // CMK * CKN -> CMN
   func.func @kernel(%arg0: memref<?x?x?xf32>, %arg1: memref<?x?x?xf32>, %arg2: memref<?x?x?xf32>) {
     %c0 = arith.constant 0 : index
     %c1 = arith.constant 1 : index
     %c2 = arith.constant 2 : index
     %vl_step = arith.constant 32 : index
     %cst = arith.constant 0.000000e+00 : f32
     %0 = vector.splat %cst : vector<32xf32>
     %dim = memref.dim %arg0, %c0 : memref<?x?x?xf32>
     %dim_1 = memref.dim %arg0, %c1 : memref<?x?x?xf32>
     %dim_2 = memref.dim %arg1, %c1 : memref<?x?x?xf32>
     %dim_3 = memref.dim %arg1, %c2 : memref<?x?x?xf32>

     // Calculate the upper bound for vectorized processing
     // - Subtract `vl_step` is to avoid overflow at the vectorization tail.
     // - Add 1 to ensure the final loop runs when the workload length
     //   is divisible by the vector size.
     %dim_3_upbound_tmp = arith.subi %dim_3, %vl_step : index
     %dim_3_upbound = arith.addi %dim_3_upbound_tmp, %c1 : index

     affine.for %arg3 = %c0 to %dim {                                      // C
       affine.prefetch %arg0[%arg3, %dim_1, %dim_2], read, locality<3>, data : memref<?x?x?xf32>
       affine.for %arg4 = %c0 to %dim_1 {                                  // M
         // Perform the vectorization body.
         %iter_idx = scf.for %arg5 = %c0 to %dim_3_upbound
               step %vl_step iter_args(%iter_init = %c0) -> (index) {      // N
           %1 = vector.load %arg2[%arg3, %arg4, %arg5] : memref<?x?x?xf32>, vector<32xf32>
           %iter_vec = scf.for %arg6 = %c0 to %dim_2 step %c1
               iter_args(%iter_vec0 = %1) -> (vector<32xf32>) {            // K
             %5 = memref.load %arg0[%arg3, %arg4, %arg6] : memref<?x?x?xf32>
             %6 = vector.broadcast %5 : f32 to vector<32xf32>
             %4 = vector.load %arg1[%arg3, %arg6, %arg5] : memref<?x?x?xf32>, vector<32xf32>
             %8 = vector.fma %6, %4, %iter_vec0  : vector<32xf32>
             scf.yield %8 : vector<32xf32>
           }
           vector.store %iter_vec, %arg2[%arg3, %arg4, %arg5] : memref<?x?x?xf32>, vector<32xf32>
           %arg5_next = arith.addi %arg5, %vl_step : index
           scf.yield %arg5_next : index
         }
         // Compute the tail size and Process the remaining elements
         // using masked vector operations.
         ...
       }
     }
   return
   }
   ```

2. 按照「[编写并测试 `kernel` 函数文件](#编写并测试-kernel-函数文件)」中的方式补全目标 MLIR 文件（`batchmatmul-vectorization.mlir`）其余部分，并添加对应构建规则。

3. 验证手工优化后 MLIR 文件的正确性。

   *通常通过对比优化前后两个文件输出的数据来验证。*

完整源码请参考 [batchmatmul-vectorization.mlir](../examples/BuddyMatmul/batchmatmul-vectorization.mlir) 和 [makefile](../examples/BuddyMatmul/makefile)。

### 实现 Pass

1. 根据「[编写手工优化后的 MLIR 文件](#编写手工优化后的-mlir-文件)」中实现的优化版 MLIR，使用 MLIR 提供的 C++ 接口完成从源 Op 到目标 Op 的 lowering Pass。

   ```Cpp
   // BatchMatMulOptimize.cpp

   namespace {

   class BatchMatMulOptimizePattern : public ConversionPattern {
   public:
     explicit BatchMatMulOptimizePattern(MLIRContext *context,
                                         int64_t vecSizeParam)
         : ConversionPattern(linalg::BatchMatmulOp::getOperationName(), 1,
                             context) {
       vecSize = vecSizeParam;
     }

     LogicalResult
     matchAndRewrite(Operation *op, ArrayRef<Value> /*operands*/,
                     ConversionPatternRewriter &rewriter) const override {
       ... // Optimized Implementation Code
     }

   private:
     int64_t vecSize;
   };
   } // end anonymous namespace

   //===----------------------------------------------------------------------===//
   // BatchMatMulOptimizePass
   //===----------------------------------------------------------------------===//
   namespace {
   class BatchMatMulOptimizePass
       : public PassWrapper<BatchMatMulOptimizePass, OperationPass<ModuleOp>> {
   public:
     MLIR_DEFINE_EXPLICIT_INTERNAL_INLINE_TYPE_ID(BatchMatMulOptimizePass)
     StringRef getArgument() const final { return "batchmatmul-optimize"; }
     StringRef getDescription() const final { return "BatchMatMul Optimization."; }
     BatchMatMulOptimizePass() = default;
     BatchMatMulOptimizePass(const BatchMatMulOptimizePass &) {}
     explicit BatchMatMulOptimizePass(int64_t vecSizeParam) {
       vecSize = vecSizeParam;
     }

     void runOnOperation() override;

     void getDependentDialects(DialectRegistry &registry) const override {
       registry.insert<linalg::LinalgDialect, scf::SCFDialect,
                       affine::AffineDialect, VectorDialect>();
     }

     Option<int64_t> vecSize{*this, "vector-size",
                             llvm::cl::desc("Affine Vector size."),
                             llvm::cl::init(64)};
   };
   } // end anonymous namespace.

   void BatchMatMulOptimizePass::runOnOperation() {
     MLIRContext *context = &getContext();
     ModuleOp module = getOperation();

     ConversionTarget target(*context);
     target
         .addLegalDialect<arith::ArithDialect, affine::AffineDialect,
                          scf::SCFDialect, memref::MemRefDialect, VectorDialect>();
     target.addLegalOp<ModuleOp, func::FuncOp, func::ReturnOp>();
     target.addLegalOp<linalg::FillOp>();

     RewritePatternSet patterns(context);
     patterns.add<BatchMatMulOptimizePattern>(context, vecSize);

     if (failed(applyPartialConversion(module, target, std::move(patterns))))
       signalPassFailure();
   }

   namespace mlir {
   namespace buddy {
   void registerBatchMatMulOptimizePass() {
     PassRegistration<BatchMatMulOptimizePass>();
   }
   } // namespace buddy
   } // namespace mlir
   ```

2. 在当前目录的 `CMakeLists.txt` 中，将源文件添加到对应库目标中。

   ```cmake
   // CMakeLists.txt

   add_mlir_library(MatMulOptimization
   ...
     BatchMatMulOptimize.cpp
   ...
     LINK_LIBS PUBLIC
     BuddyUtils
   )
   ```

3. 在 `buddy-opt` 中注册已实现的 Pass。

   ```cpp
   // buddy-opt.cpp

   namespace mlir {
   namespace buddy {
   ...
   void registerBatchMatMulOptimizePass();
   ...
   } // namespace buddy
   } // namespace mlir

   int main(int argc, char **argv) {
     ...
     mlir::buddy::registerBatchMatMulOptimizePass();
     ...

     return mlir::failed(
         mlir::MlirOptMain(argc, argv, "buddy-mlir optimizer driver", registry));
   }
   ```

完整源码请参考 [BatchMatMulOptimize.cpp](../midend/lib/Conversion/MatMulOptimization/BatchMatMulOptimize.cpp)、[CMakeLists.txt](../midend/lib/Conversion/MatMulOptimization/CMakeLists.txt) 与 [buddy-opt.cpp](../tools/buddy-opt/buddy-opt.cpp)。

### 测试 Pass

在 makefile 中，将 `BatchMatMulOptimize.cpp` 对应的 pass（`-batchmatmul-optimize`）加入源 MLIR 文件（`linalg-batchmatmul-f32.mlir`）的构建规则，执行后验证 Pass 的正确性。

```makefile
linalg-batchmatmul-f32-run:
	@${BUDDY_OPT} ./linalg-batchmatmul-f32.mlir \
		-batchmatmul-optimize \
		-convert-linalg-to-affine-loops \
		-affine-parallelize \
		-lower-affine \
		-convert-scf-to-openmp \
		-convert-vector-to-scf \
		-expand-strided-metadata \
		-convert-vector-to-llvm \
		-memref-expand \
		-arith-expand \
		-convert-arith-to-llvm \
		-finalize-memref-to-llvm  \
		-convert-scf-to-cf \
		-convert-openmp-to-llvm \
		-convert-math-to-llvm \
		-convert-math-to-libm  \
		-convert-func-to-llvm \
		-reconcile-unrealized-casts | \
	${MLIR_CPU_RUNNER} ${OPT_FLAG} -e main -entry-point-result=void \
		-shared-libs=${MLIR_RUNNER_UTILS} -shared-libs=${MLIR_C_RUNNER_UTILS} \
		-shared-libs=${LIB_OMP}
```

### 实现 Benchmark 性能测试

#### 在现有 Op Benchmark 中增加新的 Pass 测试

1. 在 `CMakeLists.txt` 中添加自定义编译命令（`add_custom_command`）生成目标文件，编译 MLIR 源码，并将生成结果封装为静态库（`add_library`）后链接到可执行目标。

   ```cmake
   // CMakeLists.txt

   add_custom_command(OUTPUT batch_matmul_vectorization.o
     COMMAND cat ${BUDDY_SOURCE_DIR}/benchmarks/DeepLearning/Ops/BatchMatMulOp/BatchMatMul.mlir |
             sed 's/@batch_matmul/@batch_matmul_vectorization/' |
             ${BUDDY_MLIR_BUILD_DIR}/bin/buddy-opt
             -batchmatmul-optimize
             -convert-linalg-to-loops
             -expand-strided-metadata
             -lower-affine
             -convert-scf-to-cf
             -convert-math-to-llvm
             -convert-vector-to-llvm
             -finalize-memref-to-llvm
             -llvm-request-c-wrappers
             -convert-func-to-llvm
             -reconcile-unrealized-casts|
             ${BUDDY_MLIR_BUILD_DIR}/bin/buddy-translate --buddy-to-llvmir -o batch_matmul_vectorization.ll
     COMMAND ${LLVM_MLIR_BINARY_DIR}/clang -O3 ${CLANG_FLAGS_LIST} batch_matmul_vectorization.ll
             -c -save-temps -o ${CMAKE_CURRENT_BINARY_DIR}/batch_matmul_vectorization.o
   )
   add_library(batch_matmul_vectorization STATIC batch_matmul_vectorization.o)
   set_target_properties(batch_matmul_vectorization PROPERTIES LINKER_LANGUAGE CXX)
   target_link_libraries(dl-op-linalg-batch-matmul-benchmark
     batch_matmul_vectorization
   )

   add_custom_command(OUTPUT batch_matmul_vectorization0.o
     COMMAND cat ${BUDDY_SOURCE_DIR}/benchmarks/DeepLearning/Ops/BatchMatMulOp/BatchMatMulVec.mlir |
             sed 's/@batch_matmul/@batch_matmul_vectorization0/' |
             ${BUDDY_MLIR_BUILD_DIR}/bin/buddy-opt
             -convert-linalg-to-loops
             -expand-strided-metadata
             -lower-affine
             -convert-scf-to-cf
             -convert-math-to-llvm
             -convert-vector-to-llvm
             -finalize-memref-to-llvm
             -llvm-request-c-wrappers
             -convert-func-to-llvm
             -reconcile-unrealized-casts|
             ${BUDDY_MLIR_BUILD_DIR}/bin/buddy-translate --buddy-to-llvmir -o batch_matmul_vectorization0.ll
     COMMAND ${LLVM_MLIR_BINARY_DIR}/clang -O3 ${CLANG_FLAGS_LIST} batch_matmul_vectorization0.ll
             -c -save-temps -o ${CMAKE_CURRENT_BINARY_DIR}/batch_matmul_vectorization0.o
   )
   add_library(batch_matmul_vectorization0 STATIC batch_matmul_vectorization0.o)
   set_target_properties(batch_matmul_vectorization0 PROPERTIES LINKER_LANGUAGE CXX)
   target_link_libraries(dl-op-linalg-batch-matmul-benchmark
     batch_matmul_vectorization0
   )
   ```

   以上两种实现本质上接近：`batch_matmul_vectorization` 通过在源 MLIR 上添加 `-batchmatmul-optimize` pass 得到；而 `batch_matmul_vectorization0` 则不使用该 pass，直接编译目标 MLIR 文件（这需要先手写实现优化版 MLIR）。

2. 在主文件中通过 `extern "C"` 声明编译后 MLIR 函数接口，以自动向量化（仅使用 MLIR 核心 pass 并开启 `-O3`）作为基线，并使用 Google Benchmark 完成 Pass 的正确性验证与性能测试。

   ```cpp
   // main.cpp

   ...

   // -----------------------------------------------------------------------------
   // MLIR Benchmark. You can compare your new method with other methods here.
   // -----------------------------------------------------------------------------

   extern "C" {
   ...
   void _mlir_ciface_batch_matmul_auto_vectorization(MemRef<float, 3> *A,
                                                     MemRef<float, 3> *B,
                                                     MemRef<float, 3> *C);
   void _mlir_ciface_batch_matmul_vectorization(MemRef<float, 3> *A,
                                                MemRef<float, 3> *B,
                                                MemRef<float, 3> *C);
   ...
   /// [Step 1] Add function of your new method.
   }

   ...
   BENCHMARK_CAPTURE(DL_OPS_BATCH_MATMUL, AutoVectorization,
                     _mlir_ciface_batch_matmul_auto_vectorization)
       ->Unit(benchmark::kMillisecond)
       ->Iterations(_NUM_ITER);
   BENCHMARK_CAPTURE(DL_OPS_BATCH_MATMUL, Vectorization,
                     _mlir_ciface_batch_matmul_vectorization)
       ->Unit(benchmark::kMillisecond)
       ->Iterations(_NUM_ITER);
   ...
   /// [Step 2] Call GoogleBenchmark function to run your new method.

   // -----------------------------------------------------------------------------
   // Main Function. You can verify the correctness of your new method here.
   // -----------------------------------------------------------------------------

   int main(int argc, char **argv) {
     ...
     std::cout << "\033[34m---------- Verification ----------\033[0m" << std::endl;
     // Attain scalar output results as expected output results in verification.
     MemRef<float, 3> outputMemrefAutoVectorization(sizesOutput, 0);
     _mlir_ciface_batch_matmul_auto_vectorization(&input1MemRef, &input2MemRef,
                                      &outputMemrefScalar);
     float *outputExpected = outputMemrefAutoVectorization.getData();

     MLIRVerification(outputExpected, _mlir_ciface_batch_matmul_vectorization, "Vectorization");
     ...
     /// [Step 3] Add your new method for verification.

     delete[] input1;
     delete[] input2;
     return 0;
   }
   ```

#### 新增 Op Benchmark 测试

1. 先补全 `kernel` 函数，此时可不再需要 `main` 函数。

   ```mlir
   // BatchMatMul.mlir

   // RUN: mlir-opt %s --convert-linalg-to-loops --convert-scf-to-cf --lower-affine --finalize-memref-to-llvm --llvm-request-c-wrappers --convert-func-to-llvm --reconcile-unrealized-casts | mlir-translate --mlir-to-llvmir | llc -O3 -filetype=obj -o %t.o

   func.func @batch_matmul(%arg0: memref<?x?x?xf32>, %arg1: memref<?x?x?xf32>, %arg2: memref<?x?x?xf32>) {
     linalg.batch_matmul
       ins(%arg0, %arg1: memref<?x?x?xf32>, memref<?x?x?xf32>)
       outs(%arg2: memref<?x?x?xf32>)
     return
   }
   ```

2. 创建并补全 `CMakeLists.txt` 与 `main.cpp`。

3. 实现辅助工具函数，主要用于数据初始化、内存分配与结果正确性校验。

   ```hpp
   // Utils.hpp

   #ifndef BATCH_MATMUL_UTILS_HPP
   #define BATCH_MATMUL_UTILS_HPP

   #include <benchmark/benchmark.h>
   #include <cmath>
   #include <cstdlib>
   #include <ctime>
   #include <iostream>

   namespace batch_matmul {

   // Allocates a 1D array with dimensions `rows * cols` and fills it with random
   // values between 0 and 99.
   template <typename DATA_TYPE> DATA_TYPE *allocArray(int rows, int cols) {
     // Initialize the random number generator.
     std::srand(static_cast<unsigned int>(std::time(0)));
     // Allocate memory for the array
     DATA_TYPE *array = new DATA_TYPE[rows * cols];
     // Fill the array with random numbers between 0 and 99
     for (int i = 0; i < rows; i++) {
       for (int j = 0; j < cols; j++) {
         array[i * cols + j] = static_cast<DATA_TYPE>(std::rand() % 100);
       }
     }
     return array;
   }

   // 在指定误差范围内验证两个数组是否一致。
   template <typename DATA_TYPE>
   void verify(DATA_TYPE *A, DATA_TYPE *B, int batch, int size,
               const std::string &name) {
     const std::string PASS = "\033[32mPASS\033[0m";
     const std::string FAIL = "\033[31mFAIL\033[0m";
     const double epsilon = 1e-6; // Tolerance for floating point comparison

     std::cout << name << " ";
     if (!A || !B) {
       std::cout << FAIL << " (Null pointer detected)" << std::endl;
       return;
     }

     bool isPass = true;
     for (int i = 0; i < batch; ++i) {
       for (int j = 0; j < size; ++j) {
         int k = i * size + j;
         if (std::fabs(A[k] - B[k]) > epsilon) {
           std::cout << FAIL << std::endl;
           std::cout << "Batch=" << i << " Index=" << j << ":\tA[k]=" << A[k]
                     << " B[k]=" << B[k] << std::endl;
           isPass = false;
           break;
         }
       }
       if (!isPass) {
         break;
       }
     }
     if (isPass) {
       std::cout << PASS << std::endl;
     }
   }

   } // namespace batch_matmul

   #endif // BATCH_MATMUL_UTILS_HPP
   ```

4. 在父目录的 `CMakeLists.txt` 中添加子目录，并在 `DeepLearning` 目录的 `README.md` 中增加对应 Op 的用例说明。

   ```cmake
   // CMakeLists.txt

   ...
   add_subdirectory(BatchMatMulOp)
   ...
   ```

   ```markdown
   // README.md

   ...
   ### 算子级 Benchmark

   下表列出了算子级别的 benchmark 用例。

   | Name  | Build Target | 说明 |
   | -------------- | ------------- | ------------- |
   ...
   | Linalg Batch Matmul Benchmark | `ninja dl-op-linalg-batch-matmul-benchmark`  | 该 benchmark 对 `batch matmul` 的多种优化策略进行对比。可在 [此文件](./Ops/BatchMatMulOp/Main.cpp) 调整测试规模。 |
   ...
   ```
