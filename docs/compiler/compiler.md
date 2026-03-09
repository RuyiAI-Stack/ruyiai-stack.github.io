#  Ruyi Buddy Compiler

Buddy Compiler 是一个领域特定的编译器基础设施。我们使用"buddy"作为名称，因为我们希望构建一个伙伴系统，帮助用户轻松地设计、实现和评估领域特定编译器。

Buddy Compiler 社区是一个开源社区，我们在这里通过协作探索编译器基础设施的有趣特性并实现创新想法。如果你想参与贡献，请通过[此 Slack 链接](https://join.slack.com/t/buddycompiler/shared_invite/zt-13y6ibj4j-n6MQ8u9yCUPltCCDhLEmXg)加入我们。

Buddy Compiler As A Service（Buddy-CAAS）是一个在线平台，为用户和开发者提供快速、流畅的 Pass 管线配置与多后端演示服务。点击[此处](https://buddy.isrc.ac.cn/)探索和体验我们的在线平台。更多详情请参阅 [Buddy-CAAS 文档](https://github.com/buddy-compiler/buddy-compiler.github.io/blob/main/Pages/Documentation/CAAS.md)。

## 动机

我们的目标是通过提供编译器级别的基础设施 Buddy Compiler，解决领域特定语言（DSL）与领域特定架构（DSA）结合过程中的挑战。Buddy Compiler 构建在 [MLIR](https://mlir.llvm.org/) 和 [RISC-V](https://riscv.org/) 之上，旨在创建一个统一的生态系统，释放更多软硬件协同设计的机会。这样的生态系统可以简化开发流程并加速性能优化，使用户能够轻松开发自己的编译器。

随着对高算力应用需求的快速发展，在摩尔定律逐渐失效的背景下，通用处理器已无法满足计算需求。通过利用 DSL 和 DSA，开发者可以兼顾两者的优势，优化目标领域内计算的性能和效率。然而，将 DSL 和 DSA 结合起来在开发复杂性、性能权衡和工具链支持等方面带来了一些挑战。我们的目标是在编译器层面提供基础设施，探索这些问题的解决方案。

DSL-DSA 联合方案涉及多种软硬件协同设计技术。我们认为统一的生态系统能获得更多协同设计的机会，并特别拥抱 MLIR 和 RISC-V 生态系统。MLIR 是一种革命性的多级中间表示和编译器基础设施，提供可复用和可扩展的机制。RISC-V 是一种开源指令集架构，采用模块化设计支持自定义扩展。MLIR 和 RISC-V 都具有可扩展的概念，以最大化基础部分的复用，非常适合领域特定的设计。Buddy Compiler 基于 MLIR 构建，并对 RISC-V 有专门的支持，特别是在向量化方面。

更多信息请参阅我们的[文档](https://github.com/buddy-compiler/buddy-mlir/tree/main/docs)和[开放项目](https://github.com/buddy-compiler/buddy-compiler.github.io/blob/main/Pages/OpenProjects.md)。

## 概述

目前，Buddy Compiler 包含以下两个模块：

- buddy-mlir（从[这里](https://github.com/buddy-compiler/buddy-mlir)开始）

buddy-mlir 是 Buddy Compiler 的主要框架。我们以 MLIR 为基石，探索如何在其之上构建领域特定编译器。我们在这个框架中的研究包括 DSL 前端支持、IR 级别优化、DSA 后端代码生成、MLIR 相关开发工具等。

- buddy-benchmark（从[这里](https://github.com/buddy-compiler/buddy-benchmark)开始）

buddy-benchmark 是一个用于评估领域特定编译器和库的基准框架。评估是编译器开发中的关键步骤。我们很难找到统一的基准来评估某些领域的编译器或优化。因此，我们提出了一个可扩展的基准框架来收集领域特定的评估用例。

下图展示了 Buddy Compiler 的模块组成。

![概述](./assets/compiler-overview.png)

## 发表论文与演讲

- Compiler Technologies in Deep Learning Co-Design: A Survey - [链接](https://spj.science.org/doi/10.34133/icomputing.0040)
- AutoConfig: A Configuration-Driven Automated Mechanism for Deep Learning Compilation Optimization - [链接](https://www.jos.org.cn/jos/article/abstract/7102)
- COMPASS: An Agent for MLIR Compilation Pass Pipeline Generation - [链接](https://link.springer.com/chapter/10.1007/978-3-031-98208-8_13)
- Buddy Compiler @ CGO C4ML Workshop 2024 - [海报](https://github.com/buddy-compiler/buddy-compiler.github.io/blob/master/Resources/BuddyCompiler%40C4ML2024.pdf) / [链接](https://www.c4ml.org/)
- Buddy Compiler @ EuroLLVM 2023
    - Buddy Compiler: An MLIR-based Compilation Framework for Deep Learning Co-design - [链接](https://www.youtube.com/watch?v=EELBpBA-XCE)
    - RISC-V Vector Extension Support in MLIR: Motivation, Abstraction, and Application - [链接](https://www.youtube.com/watch?v=i9dsjzVOvy8)
    - Image Processing Ops as first class citizens in MLIR: write once, vectorize everywhere! - [链接](https://www.youtube.com/watch?v=0xQ2lDY9RCw)
    - Buddy-CAAS: Compiler As A Service for MLIR - [链接](https://www.youtube.com/watch?v=f7USv-oAtvI)
