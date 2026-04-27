Gemmini 项目正在开发一个全系统、全栈的深度神经网络硬件探索与评估平台。Gemmini 使架构师能够深入了解系统和软件栈的不同组件（不仅仅是加速器本身）如何交互影响整体 DNN 性能。

Gemmini 是 [Chipyard](https://github.com/ucb-bar/chipyard) 生态系统的一部分，使用 [Chisel](https://www.chisel-lang.org/) 硬件描述语言开发。本文档旨在为想在 [buddy-mlir](https://github.com/buddy-compiler/buddy-mlir) 项目中尝试 Gemmini 的初学者提供信息。我们从以下几个方面进行介绍：

- Gemmini 架构
- Chipyard 中的 Gemmini
- buddy-mlir 中的 Gemmini

### Gemmini 架构

<img src="/docs/compiler/gemmini-arch.png" style="zoom: 67%;" />

Gemmini 作为 RoCC 加速器实现，使用非标准的 RISC-V 自定义指令。Gemmini 单元使用 Rocket 或 BOOM *tile* 的 RoCC 端口，默认通过系统总线（即直接连接到 L2 缓存）接入存储系统。

加速器的核心是一个执行矩阵乘法的脉动阵列。默认情况下，矩阵乘法支持*输出固定*和*权重固定*两种数据流，程序员可以在运行时选择。不过，数据流也可以在设计生成时固化。

脉动阵列的输入和输出存储在一个显式管理的暂存器中，由分块 SRAM 组成。DMA 引擎负责在主存（对主机 CPU 可见）和暂存器之间传输数据。

由于权重固定数据流需要在脉动阵列外部有一个累加器，我们添加了一个最终的 SRAM 块，配备了加法器单元，可以在概念上视为暂存器内存空间的扩展。脉动阵列可以将结果存储到累加器的任意地址，也可以从累加器的任意地址读取新输入。DMA 引擎也可以在累加器和主存之间直接传输数据，这在加载偏置时经常需要。

Gemmini 还包括外围电路，可选择性地应用激活函数（如 ReLU 或 ReLU6）、按 2 的幂次缩放结果以支持量化工作负载，或在将矩阵送入脉动阵列之前进行转置以支持输出固定数据流。

**架构和 ISA 的详细信息请参阅** **[gemmini](https://github.com/ucb-bar/gemmini#architecture)** **项目。**

### Chipyard 中的 Gemmini

#### 三个仓库

- [gemmini：Berkeley 的空间阵列生成器](https://github.com/ucb-bar/gemmini)

  - [gemmini-rocc-tests](https://github.com/ucb-bar/gemmini-rocc-tests)（gemmini 的子模块）

     Fork 自 seldridge/rocket-rocc-examples，包含基于脉动阵列的矩阵乘法加速器测试

  - [libgemmini：Gemmini 的 Spike 扩展](https://github.com/ucb-bar/libgemmini)（gemmini 的子模块）

      此仓库构建 libgemmini.so，可以动态链接到 Spike 以支持执行自定义 Gemmini 指令。

由于 `gemmini-rocc-tests` 和 `libgemmini` 都是 gemmini 的子模块，我们以 `gemmini` 作为根目录。

在 `scripts/build-spike.sh` 中，有以下逻辑：

```shell
# scripts/build-spike.sh

cp software/gemmini-rocc-tests/include/gemmini_params.h software/libgemmini/gemmini_params.h
make -C software/libgemmini clean
make -C software/libgemmini install
```

此脚本确保 `libgemmini/gemmini_params.h` 和 `gemmini-rocc-tests/include/gemmini.h` 始终一致，并重新编译 `spike` 所依赖的 `libgemmini.so`。因此，我们只需关注仓库 `gemmini-rocc-tests`。该仓库中有两个重要的头文件：

- `gemmini.h`

  - 此头文件是一个 C 库，将自定义 Gemmini 指令的调用封装为常见的 DNN 算子，如矩阵乘法、卷积（带或不带池化）、矩阵加法等。请注意，DNN 测试依赖于这个常见 DNN 算子的 C 库。它们很少直接调用 Gemmini ISA 指令，主要调用 C 库中的封装函数。

- `gemmini_params.h`

  - Gemmini 生成器在运行 `build-spike.sh` 时根据生成器参数生成一个 C 头文件（`gemmini_params.h`）。此头文件与 C 库一起编译以调优库性能。

    ```shell
    # scripts/build-spike.sh

    cd ../../sims/verilator/
    echo Generating new gemmini_params.h file...
    make verilog CONFIG=CustomGemminiSoCConfig &> build.log
    ```

#### 构建模拟器和 C 库

对于 `gemmini` 项目，完整的构建逻辑如下：

1. 运行 `scripts/setup-paths.sh` 脚本，完成配置文件的复制（符号链接），然后我们就有了 `configs` 文件夹。共有四个配置文件会被复制到新目录。

   1. `src/main/scala/gemmini/Configs.scala`
      1.    -> `configs/GemminiDefaultConfigs.scala`
   2. `src/main/scala/gemmini/CustomConfigs.scala`
      1.   -> `configs/GemminiCustomConfigs.scala`
   3. `src/main/scala/gemmini/CustomCPUConfigs.scala`
      1.   -> `configs/CPUConfigs.scala`
   4. `src/main/scala/gemmini/CustomSoCConfigs.scala`
      1.   -> `configs/SoCConfigs.scala`

   对应的脚本代码如下。命令 `sed '1,1d; $d'` 用于删除源文件开头和末尾的注释标签。

   ```shell
   if [ ! -f configs/GemminiDefaultConfigs.scala ]; then
       ln -s $PWD/src/main/scala/gemmini/Configs.scala configs/GemminiDefaultConfigs.scala
   fi

   if [ ! -f configs/GemminiCustomConfigs.scala ]; then
       ln -s $PWD/src/main/scala/gemmini/CustomConfigs.scala configs/GemminiCustomConfigs.scala
   fi

   if [ ! -f configs/CPUConfigs.scala ]; then
       sed '1,1d; $d' $PWD/src/main/scala/gemmini/CustomCPUConfigs.scala > ../chipyard/src/main/scala/config/GemminiCPUConfigs.scala
       ln -s $PWD/../chipyard/src/main/scala/config/GemminiCPUConfigs.scala configs/CPUConfigs.scala
   fi

   if [ ! -f configs/SoCConfigs.scala ]; then
       sed '1,1d; $d' $PWD/src/main/scala/gemmini/CustomSoCConfigs.scala > ../chipyard/src/main/scala/config/GemminiSoCConfigs.scala
       ln -s $PWD/../chipyard/src/main/scala/config/GemminiSoCConfigs.scala configs/SoCConfigs.scala
   fi
   ```

2. 运行 `scripts/build-verilator.sh` 和 `scripts/build-spike.sh`，这两个脚本最终都会进入 `../../sims/verilator` 目录，使用指定参数 `CONFIG=CustomGemminiSoCConfig` 执行 `make` 命令。

   ```shell
   # build-spike.sh

   cd ../../sims/verilator/
   echo Generating new gemmini_params.h file...
   make verilog CONFIG=CustomGemminiSoCConfig &> build.log

   cd -
   cp software/gemmini-rocc-tests/include/gemmini_params.h software/libgemmini/gemmini_params.h
   make -C software/libgemmini clean
   make -C software/libgemmini install

   # ----------------------------------------------------------------------------------

   # build-verilator.sh

   cd ../../sims/verilator/
   make -j$j ${debug} CONFIG=CustomGemminiSoCConfig
   ```

   这里提到的 `CustomGemminiSoCConfig` 出现在上面的配置文件 `configs/SoCConfigs.scala` 中。此外，我们注意到这两个脚本中的 `help()` 函数：

   ```shell
   # build-verilator.sh
   help () {
     echo "Build a cycle-accurate Verilator simulator for RISCV Gemmini programs,"
     echo 'matching `customConfig` in `configs/GemminiCustomConfigs.scala`.'
     ......
   }

   # build-spike.sh
   help () {
     echo "Build a functional simulator for RISCV Gemmini programs, matching"
     echo '`customConfig` in `configs/GemminiCustomConfigs.scala`.'
     ......
   }
   ```

   它们都表明在编译时，我们匹配的是 `configs/GemminiCustomConfigs.scala` 中的 `customConfig`。当我们后续需要修改 Gemmini 配置时，应该：

   1. 将新配置赋给 `customConfig`。
   2. 重新运行 `build-spike.sh` 使其生效。

### buddy-mlir 中的 Gemmini

[Buddy-mlir](https://github.com/buddy-compiler/buddy-mlir) 是一个基于 MLIR 的编译器框架，旨在从 DSL（领域特定语言）到 DSA（领域特定架构）的协同设计生态系统。

#### Gemmini 方言

Gemmini 方言是面向 RISC-V Gemmini 扩展的基础方言。

##### 操作定义

我们在文件 `midend/include/Dialect/Gemmini/Gemmini.td` 中定义 `gemmini` 方言的操作。

- `flush`
- `config_st`、`config_ld`、`config_ex`、`config_norm`
- `mvin`、`mvin2`、`mvin3`、`mvout`
- `print`
- `preload_zeros`、`preload`、`compute_preloaded`、`compute_accumulated`
- `tile_matmul`、`tile_conv`

|      **算子名称**       |                   **描述**                    |
| :---------------------: | :-------------------------------------------: |
|        **flush**        |      **Flush 操作刷新 TLB。**                 |
|      **config_st**      |           **配置存储操作**                     |
|      **config_ld**      |            **配置加载操作**                    |
|      **config_ex**      | **ConfigExOp 配置执行流水线。**               |
|     **config_norm**     | **ConfigNormOp 配置归一化流水线**             |
|        **mvin**         |  **从主存移动数据到暂存器**                   |
|        **mvin2**        |  **从主存移动数据到暂存器**                   |
|        **mvin3**        |  **从主存移动数据到暂存器**                   |
|        **mvout**        |    **从暂存器移动数据到 L2/DRAM**             |
|        **print**        |             **打印 memref 值。**              |
|    **preload_zeros**    |         **在暂存器中预加载零值**              |
|       **preload**       |        **在暂存器中预加载矩阵**              |
|  **compute_preloaded**  |            **显式预加载计算**                 |
| **compute_accumulated** |           **累加计算操作**                    |
|     **tile_matmul**     |          **执行矩阵乘法。**                  |
|      **tile_conv**      |             **执行卷积。**                    |

构建完成后，可以在 `build/midend/include/Dialect/Gemmini/*` 文件夹中找到 TableGen 生成的文件。

##### 内置操作定义

我们在文件 `midend/include/Dialect/Gemmini/Gemmini.td` 中定义 `gemmini` 方言的内置操作。

- `flush`
- `config_st`、`config_ld`、`config_ex`、`config_norm`
- `mvin`、`mvin2`、`mvin3`、`mvout`
- `preload`、`compute_preloaded`、`compute_accumulated`
- `loop_ws_config_bounds`、`loop_ws_config_addrs_ab`、`loop_ws_config_addrs_dc`、`loop_ws_config_strides_ab`、`loop_ws_config_strides_dc`
- `loop_ws`、`loop_conv_ws`
- `loop_conv_ws_config1`、`loop_conv_ws_config2`、`loop_conv_ws_config3`、`loop_conv_ws_config4`、`loop_conv_ws_config5`、`loop_conv_ws_config6`

逻辑位于 `midend/include/Dialect/Gemmini/CMakeLists.txt`

```shell
add_mlir_dialect(Gemmini gemmini)
add_mlir_doc(Gemmini Gemmini Dialects/ -gen-dialect-doc)

set(LLVM_TARGET_DEFINITIONS Gemmini.td)
mlir_tablegen(GemminiConversions.inc -gen-llvmir-conversions)
add_public_tablegen_target(BuddyGemminiConversionsIncGen)
```

我们使用 `tablegen` 生成相关文件，同时还会生成 `GemminiConversions.inc`。此文件指导前述 Intrinsic 操作的转换。以下是一个示例，完整代码请参阅文件 `build/midend/include/Dialect/Gemmini/GemminiConversions.inc`。

```c++
if (auto op = dyn_cast<::buddy::gemmini::ComputeAccumulated_IntrOp>(opInst)) {

    llvm::Module *module = builder.GetInsertBlock()->getModule();
    llvm::Function *fn = llvm::Intrinsic::getDeclaration(
        module,
        llvm::Intrinsic::riscv_compute_accumulated,
        {
        });
    auto operands = moduleTranslation.lookupValues(opInst.getOperands());

    auto *inst = builder.CreateCall(fn, operands);
    (void) inst;

  return success();
}
```

可以清楚看到，如果 `opInst` 的类型是 `::buddy::gemmini::ComputeAccumulated_IntrOp`，那么我们会尝试将其替换为 `llvm::Intrinsic::riscv_compute_accumulated`。实际上，在文件 `backend/include/llvm/IR/IntrinsicsRISCVBuddyExt.td` 中，我们定义了 `RISC-V buddy 扩展`。构建完成后，可以在 `build/backend/include/llvm/IR/IntrinsicsRISCV.h` 中找到扩展的 RISC-V 指令集，其中包含我们之前定义的自定义指令。

```c++
namespace llvm {
namespace Intrinsic {
enum RISCVIntrinsics : unsigned {
// 内置函数枚举值
//  ......
    riscv_compute_accumulated,                 // llvm.riscv.compute.accumulated
    riscv_compute_preloaded,                   // llvm.riscv.compute.preloaded
    riscv_config_ex,                           // llvm.riscv.config.ex
    riscv_config_ld,                           // llvm.riscv.config.ld
    riscv_config_norm,                         // llvm.riscv.config.norm
    riscv_config_st,                           // llvm.riscv.config.st
    riscv_flush,                               // llvm.riscv.flush
    riscv_loop_conv_ws,                        // llvm.riscv.loop.conv.ws
    riscv_loop_conv_ws_config1,                // llvm.riscv.loop.conv.ws.config1
    riscv_loop_conv_ws_config2,                // llvm.riscv.loop.conv.ws.config2
    riscv_loop_conv_ws_config3,                // llvm.riscv.loop.conv.ws.config3
    riscv_loop_conv_ws_config4,                // llvm.riscv.loop.conv.ws.config4
    riscv_loop_conv_ws_config5,                // llvm.riscv.loop.conv.ws.config5
    riscv_loop_conv_ws_config6,                // llvm.riscv.loop.conv.ws.config6
    riscv_loop_ws,                             // llvm.riscv.loop.ws
    riscv_loop_ws_config_addrs_ab,             // llvm.riscv.loop.ws.config.addrs.ab
    riscv_loop_ws_config_addrs_dc,             // llvm.riscv.loop.ws.config.addrs.dc
    riscv_loop_ws_config_bounds,               // llvm.riscv.loop.ws.config.bounds
    riscv_loop_ws_config_strides_ab,           // llvm.riscv.loop.ws.config.strides.ab
    riscv_loop_ws_config_strides_dc,           // llvm.riscv.loop.ws.config.strides.dc
    // ......
    }; // enum
} // namespace Intrinsic
} // namespace llvm
```

#### Pass

##### Linalg 降级

主要逻辑在 `midend/lib/Conversion/LowerLinalgToGemmini/LowerLinalgToGemmini.cpp` 中。此文件定义了从 `linalg` 方言到 `gemmini` 方言的降级逻辑。

主要包括以下算子的降级（由于 gemmini 的脉动阵列架构适合矩阵乘法，这些常见算子被降级到 gemmini）：

- `linalg::MatmulOp - MatmulLowering`
  - 使用 `gemmini::TileMatMulOp` 替换。
- `linalg::Conv2DNchwFchwOp - Conv2DNchwFchwLowering`
  - 将输入从 NCHW 转换为 NHWC，权重从 FCHW 转换为 CHWF，输出从 NCHW 转换为 NHWC。
  - 使用 `gemmini::TileConvOp` 替换。
- `linalg::Conv2DNhwcHwcfOp - Conv2DNhwcHwcfLowering`
  - 布局转换。
  - 使用 `gemmini::TileConvOp` 替换。
- `linalg::BatchMatmulOp - BatchMatMulOpLowering`
  - 提取 batch 维度并遍历 `linalg::MatmulOp`。

具体实现请查看上述文件，此处不再赘述。

##### Gemmini 降级

主要逻辑在 `midend/lib/Dialect/Gemmini/Transforms/LegalizeForLLVMExport.cpp` 中。此文件定义了所有 `gemmini 操作` 的降级逻辑，将 `gemmini 操作` 替换为 `gemmini 内置操作`。具体实现请查看此文件。这里我们重点关注最后两个函数：

- `configureGemminiLegalizeForExportTarget`
  - 此函数说明降级后，所有 `gemmini 操作` 都是非法的，而 `gemmini 内置操作` 是合法的。
  - 这表明完成所有降级后，只会保留 `gemmini 内置操作`，`gemmini 操作` 将不再出现。
- `populateGemminiLegalizeForLLVMExportPatterns`
  - 此函数定义降级模式，将所有 `gemmini 操作` 的降级添加到模式中。

```c++
void mlir::configureGemminiLegalizeForExportTarget(
    LLVMConversionTarget &target) {
  target.addLegalOp<
      Flush_IntrOp, ConfigSt_IntrOp, ConifgLd_IntrOp, ConfigEX_IntrOp,
      Mvin_IntrOp, Mvin2_IntrOp, Mvin3_IntrOp, Mvout_IntrOp, Preload_IntrOp, ComputePreloaded_IntrOp,
      ComputeAccumulated_IntrOp, LoopWsConfigBounds_IntrOp,
      LoopWsConfigAddrsAB_IntrOp, LoopWsConfigAddrsDC_IntrOp,
      LoopWsConfigStridesAB_IntrOp, LoopWsConfigStridesDC_IntrOp, LoopWs_IntrOp,
      LoopConvWsConfig1_IntrOp, LoopConvWsConfig2_IntrOp,
      LoopConvWsConfig3_IntrOp, LoopConvWsConfig4_IntrOp,
      LoopConvWsConfig5_IntrOp, LoopConvWsConfig6_IntrOp, LoopConvWs_IntrOp, ConfigNorm_IntrOp>();
  target.addIllegalOp<FlushOp, ConfigStOp, ConfigLdOp, ConfigExOp, MvinOp, Mvin2Op, Mvin3Op,
                      MvoutOp, PrintOp, PreloadZerosOp, PreloadOp,
                      ComputePreloadedOp, ComputeAccumulatedOp, TileMatMulOp,
                      TileConvOp, ConfigNormOp>();
}

void mlir::populateGemminiLegalizeForLLVMExportPatterns(
    LLVMTypeConverter &converter, RewritePatternSet &patterns, int64_t dim,
    int64_t addrLen, size_t sizeOfElemT, size_t sizeOfAccT) {
  patterns
      .add<ForwardOperands<func::CallOp>, ForwardOperands<func::CallIndirectOp>,
           ForwardOperands<func::ReturnOp>>(converter, &converter.getContext());
  patterns.add<GemminiFlushLowering>(converter);
  patterns.add<GemminiConfigStLowering>(converter);
  patterns.add<GemminiConfigLdLowering>(converter);
  patterns.add<GemminiMvinLowering>(converter, addrLen);
  patterns.add<GemminiMvin2Lowering>(converter, addrLen);
  patterns.add<GemminiMvin3Lowering>(converter, addrLen);
  patterns.add<GemminiMvoutLowering>(converter, addrLen);
  patterns.add<GemminiConfigExLowering>(converter);
  patterns.add<GemminiConfigNormLowering>(converter);
  patterns.add<GemminiPreloadZerosLowering>(converter, dim, addrLen);
  patterns.add<GemminiPreloadLowering>(converter, addrLen);
  patterns.add<GemminiComputePreloadedLowering>(converter, addrLen);
  patterns.add<GemminiComputeAccumulatedLowering>(converter, addrLen);
  patterns.add<GemminiTileMatMulLowering>(converter, dim, addrLen, sizeOfElemT,
                                          sizeOfAccT);
  patterns.add<GemminiTileConvLowering>(converter, dim, addrLen, sizeOfElemT,
                                        sizeOfAccT);
}
```

同时，我们注意到前面的 `print` 没有对应的 `lowering` 函数，上述文件中也没有 `runOnOperation` 函数。最终，我们在 `midend/lib/Conversion/LowerGemmini/LowerGemminiPass.cpp` 文件中找到了这些缺失的部分（**实际上，我认为这两个文件应该合并为一个**）。

```c++
void LowerGemminiToLLVMPass::runOnOperation() {
  MLIRContext *context = &getContext();
  ModuleOp module = getOperation();
  // 默认的 elem_t 是 int8_t，
  // 因此默认的 elem_t 大小为 1 字节。
  size_t sizeOfElemT = sizeof(int8_t);
  if (elemType == "f32")
    sizeOfElemT = sizeof(float);
  // 默认的 acc_t 是 int32_t，
  // 因此默认的 acc_t 大小为 4 字节。
  size_t sizeOfAccT = sizeof(int32_t);
  if (accType == "f32")
    sizeOfAccT = sizeof(float);
  LLVMTypeConverter converter(context);
  RewritePatternSet patterns(context);
  LLVMConversionTarget target(*context);
  configureGemminiLegalizeForExportTarget(target);
  populateGemminiLegalizeForLLVMExportPatterns(
      converter, patterns, dim, addrLen, sizeOfElemT, sizeOfAccT);
  populateAffineToStdConversionPatterns(patterns);
  populateSCFToControlFlowConversionPatterns(patterns);
  mlir::arith::populateArithToLLVMConversionPatterns(converter, patterns);
  populateFinalizeMemRefToLLVMConversionPatterns(converter, patterns);
  cf::populateControlFlowToLLVMConversionPatterns(converter, patterns);
  populateFuncToLLVMConversionPatterns(converter, patterns);
  patterns.add<PrintOpLowering>(&getContext());
  if (failed(applyPartialConversion(module, target, std::move(patterns))))
    signalPassFailure();
}
```

#### Translation（翻译）

主要逻辑在 `midend/lib/Target/LLVMIR/Dialect/Gemmini/GemminiToLLVMIRTranslation.cpp` 中。此文件实现了从 `Gemmini 方言` 到 `LLVM IR` 的翻译接口。由于代码量较少，我们直接列出：

```c++
namespace {
/// 实现方言接口，将属于 Gemmini 方言的操作转换为 LLVM IR。
class GemminiDialectLLVMIRTranslationInterface
    : public LLVMTranslationDialectInterface {
public:
  using LLVMTranslationDialectInterface::LLVMTranslationDialectInterface;

  /// 使用提供的 IR 构建器将给定操作翻译为 LLVM IR，
  /// 并在 moduleTranslation 中保存状态。
  LogicalResult
  convertOperation(Operation *op, llvm::IRBuilderBase &builder,
                   LLVM::ModuleTranslation &moduleTranslation) const final {
    Operation &opInst = *op;
#include "Gemmini/GemminiConversions.inc"

    return failure();
  }
};
} // end namespace

void buddy::registerGemminiDialectTranslation(DialectRegistry &registry) {
  registry.insert<gemmini::GemminiDialect>();
  registry.addExtension(
      +[](MLIRContext *ctx, gemmini::GemminiDialect *dialect) {
        dialect->addInterfaces<GemminiDialectLLVMIRTranslationInterface>();
      });
}

void buddy::registerGemminiDialectTranslation(MLIRContext &context) {
  DialectRegistry registry;
  registerGemminiDialectTranslation(registry);
  context.appendDialectRegistry(registry);
}
```

我们发现下面有两个 `registration` 函数，实际的转换逻辑在 `convertOperation()` 函数中。这里，我们再次遇到了熟悉的 `Gemmini/GemminiConversions.inc`。如前所述，此文件指导如何转换 `gemmini 内置操作`。有趣的是，在 gemmini 降级过程中，`gemmini 操作` 被消除了，但 `gemmini 内置操作` 仍然存在。在这个阶段，我们将它们完全转换为 `LLVM IR`。

#### 执行

有三种方式与 `gemmini 方言` 交互。我们在下面演示三个典型示例，可以在 `examples/GemminiDialect/` 中找到它们：

- `performance-test.c`

  调用 `gemmini-rocc-tests/include/gemmini.h` 中的函数。这直接调用 gemmini 封装的接口，与 MLIR 无关。

  ```makefile
  c-matmul-32x32-gemmini-run:
      @riscv64-unknown-linux-gnu-gcc performance-test.c \
      -I${RISCV}/../../generators/gemmini/software/gemmini-rocc-tests/include \
      -I${RISCV}/../../generators/gemmini/software/gemmini-rocc-tests  \
      -DMATMUL=1 -O2 -static
      @spike --extension=gemmini pk a.out
  ```

- `performance-test.cpp`

  通过 MLIR 编写接口函数，降级生成共享库，然后在 CPP 文件中调用链接库中的函数。

  ```makefile
  linalg-matmul-32x32-cpu-run:
      @${BUDDY_OPT} ./ciface.mlir \
      -llvm-request-c-wrappers \
      -convert-linalg-to-loops \
      -lower-affine -convert-scf-to-cf \
      -convert-vector-to-llvm -finalize-memref-to-llvm \
      -convert-arith-to-llvm \
      -lower-gemmini \
      -convert-func-to-llvm -reconcile-unrealized-casts | \
      ${BUDDY_TRANSLATE} -buddy-to-llvmir | \
      ${BUDDY_LLC} -filetype=obj -mtriple=riscv64 \
          -mattr=+buddyext,+D -float-abi=hard \
          -o log.o
      @riscv64-unknown-linux-gnu-g++ log.o -DMATMUL=1 \
      -DDIALECT=1 performance-test.cpp \
      -O2 -static -o a.out -I${INTERFACES}
      @spike --extension=gemmini pk a.out
  ```

- `batch_matmul.mlir`

  直接使用 MLIR 编写 `main` 函数，无需与 C/C++ 代码交互。

  ```makefile
  gemmini-linalg-batch-matmul-run:
      @${BUDDY_OPT} ./batch_matmul.mlir \
          -convert-linalg-to-gemmini \
          -expand-strided-metadata\
          -convert-linalg-to-loops \
          -lower-gemmini | \
      ${BUDDY_TRANSLATE} -buddy-to-llvmir | \
      ${BUDDY_LLC} -filetype=obj -mtriple=riscv64 \
          -mattr=+buddyext,+D -float-abi=hard \
          -o log.o
      @riscv64-unknown-linux-gnu-gcc log.o -O2 -static -o a.out
      @spike --extension=gemmini pk a.out
  ```
