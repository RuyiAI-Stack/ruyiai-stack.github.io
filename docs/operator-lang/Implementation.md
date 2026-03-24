# 实现方案细节

虽然一个合法的 triton 程序可以在任意内存位置执行 load/store，但当前原型仅支持 lowering 具有结构化内存访问模式的程序。

## 分析阶段

在转换流程中，有三项关键分析：

1. Pointer analysis（指针分析）：
    + 该分析负责在 `triton` 程序的 load/store 过程中提取结构化内存访问模式。它会遍历 IR 并访问相关指令，在 `memref` dialect 中构建步幅访问（strided access）表示。当前该分析仍处于早期阶段，尚未覆盖全部场景。

2. Use analysis（使用分析）：
    + 在完成指针分析后，参与地址计算的部分指令在 triton 程序中不再必要，因为其语义已经被表示步幅内存访问的 `memref` 操作捕获。为了安全删除这些指令，我们执行 `Use analysis`，标记哪些指令仅用于地址计算（称为 `MetaUse`），哪些同时用于地址计算和数据处理（称为 `MixedUse`）。对于 `MixedUse` 指令，会先克隆并调整其使用者，目的是将 `MetaUse` 操作拆分出来，再安全删除。

3. Mask analysis（掩码分析）：
    + 该分析负责处理带 mask 的 load/store。

## 转换策略

我们引入 `TritonToLinalg` pass，将 `triton` dialect 转换到基于 *tensor* 的 `linalg` dialect。这样生成的 IR 可直接兼容 `linalg` 的 tiling 与 fusion 等转换 pass。正如 Pointer analysis 所述，load/store 边界仍需处理 memref 指令，并通过 `bufferization.to_tensor` 转回 tensor。下面给出一个简化示例：

```mlir
tt.func @kernel(%afloat : !tt.ptr<bf16>, %res : !tt.ptr<bf16>) {
  %0 = tt.make_range {end = 128 : i32, start = 0 : i32} : tensor<128xi32>
  %1 = tt.splat %afloat : (!tt.ptr<bf16>) -> tensor<128x!tt.ptr<bf16>>
  %2 = tt.addptr %1, %0 : tensor<128x!tt.ptr<bf16>>, tensor<128xi32>
  %afm = tt.load %2 : tensor<128x!tt.ptr<bf16>>
  %3 = "tt.reduce"(%afm) ({
  ^bb0(%arg5: bf16, %arg6: bf16):
    %21 = arith.addf %arg5, %arg6 : bf16
    tt.reduce.return %21 : bf16
  }) {axis = 0 : i32} : (tensor<128xbf16>) -> bf16
  tt.store %res, %3 : !tt.ptr<bf16>
  tt.return
}
```

转换后：

```mlir
func.func @kernel(%arg0: memref<*xbf16>, %arg1: memref<*xbf16>, %arg2: i32, %arg3: i32, %arg4: i32) {
    %cst = arith.constant 0.000000e+00 : f32
    %reinterpret_cast = memref.reinterpret_cast %arg0 to offset: [0], sizes: [128], strides: [1] :
        memref<*xbf16> to memref<128xbf16, strided<[1]>>
    %alloc = memref.alloc() : memref<128xbf16>
    memref.copy %reinterpret_cast, %alloc : memref<128xbf16, strided<[1]>> to memref<128xbf16>
    %0 = bufferization.to_tensor %alloc restrict writable : memref<128xbf16>
    %1 = bufferization.alloc_tensor() : tensor<f32>
    %inserted = tensor.insert %cst into %1[] : tensor<f32>
    %reduced = linalg.reduce ins(%0 : tensor<128xbf16>) outs(%inserted : tensor<f32>) dimensions = [0]
      (%in: bf16, %init: f32) {
        %3 = arith.extf %in : bf16 to f32
        %4 = arith.addf %3, %init : f32
        linalg.yield %4 : f32
      }
    %extracted = tensor.extract %reduced[] : tensor<f32>
    %2 = arith.truncf %extracted : f32 to bf16
    %reinterpret_cast_0 = memref.reinterpret_cast %arg1 to offset: [0], sizes: [1], strides: [1] :
        memref<*xbf16> to memref<1xbf16, strided<[1]>>
    affine.store %2, %reinterpret_cast_0[0] : memref<1xbf16, strided<[1]>>
    return

}
```

需要注意的实现细节：

+ `tt.load` (together with all of its related address calculation instructions such as `tt.addptr` and `tt.splat`) are lowered to a combination of `memref.reinterpret_cast`, `memref.alloc`, and `memref.copy`. After the initialization of the local buffer, we convert the memref back to a tensor using `bufferization.to_tensor`; this op is automatically removed during bufferization.

+ `tt.store` lowers to a combination of `memref.reinterpret_cast` and either `affine.store` or `memref.tensor_store`:

```
%reinterpret_cast = memref.reinterpret_cast %arg2 to offset: [...] memref<*xf32> to memref<1024xf32>
%extracted_slice = tensor.extract_slice %15[0] [%21] [1] : tensor<1024xf32> to tensor<?xf32>
%subview = memref.subview %reinterpret_cast[0] [%21] [1] : memref<1024xf32> to memref<?xf32>
bufferization.materialize_in_destination %extracted_slice in writable %subview
```

+ element-wise `arith` and `math` operators are converted to their corresponding `linalg.generic` version.
+ `tt.dot` becomes `linalg.matmul`.
+ `tt.reduce` becomes `linalg.reduce`; known limitation: only support `addf` and `maxf` reduction in the reduction body for now.

## 测试

原型已在以下 triton kernel 示例上进行测试：

1. [vector addition](./python/examples/test_vec_add.py)
2. [fused softmax](./python/examples/test_softmax.py)
3. [matrix multiplication](./python/examples/test_matmul.py)
4. layer normalization
5. fused attention

Python 测试基于 Pytest，运行前需设置以下环境变量：
```
export BUDDY_MLIR_BINARY_DIR=<path-to-buddy-mlir-build/bin>
export LLVM_BINARY_DIR=<path-to-llvm-binaries>
export TRITON_SHARED_OPT_PATH=$TRITON_PLUGIN_DIRS/triton/build/<your-cmake-directory>/third_party/triton_shared/tools/triton-shared-opt/triton-shared-opt

pytest <path-to-triton-shared>/python/examples
```
除教程中的 kernel 外，还包含大量覆盖不同场景的 lit 测试。
