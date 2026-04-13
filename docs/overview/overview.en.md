# Overview

# Background

AI infrastructure is rapidly entering an inference-centric development phase. AI models represented by large language models are being deployed quickly across cloud, edge, and endpoint scenarios, which raises higher requirements for compute-platform adaptation efficiency, deployment efficiency, and programmability. RISC-V, with its open, modular, and extensible ISA characteristics, is well suited to support AI computing needs for custom instruction sets, hardware-software co-design, and continuous ecosystem evolution. In recent years, RISC-V hardware capabilities have continued to improve, making it an important direction for AI computing platforms.

At the same time, RISC-V platforms still face clear software-fragmentation challenges in AI deployment. Different hardware platforms provide diverse implementations for Vector, Matrix, and heterogeneous acceleration, which often makes AI model deployment and optimization rely on platform-specific manual porting and tuning. When model structures or hardware platforms change, existing methods usually require redesigning compilation and optimization flows, resulting in long adaptation cycles and low deployment efficiency. This makes it difficult to meet the fast evolution requirements of AI models and hardware platforms. Therefore, building a unified, efficient, and extensible system software stack for RISC-V has become a critical foundation for AI application deployment.

# What We Build

The RuyiAI system software stack is oriented to RISC-V hardware platforms and is committed to building unified foundational AI system software capabilities. On the one hand, RuyiAI follows the "Ruyi-native" path, carrying out systematic design and optimization with RISC-V as the primary target architecture to form a native software stack for AI computing. On the other hand, RuyiAI also supports the "Ruyi-adaptation" path for mainstream AI software ecosystems, enabling efficient migration, adaptation, and execution on RISC-V platforms, thereby supporting continuous landing and evolution of AI applications in different scenarios.

![RuyiAI system stack construction scope](/docs/overview/overview-1.png)

At the overall architecture level, RuyiAI is built on mainstream AI development ecosystems and open compilation infrastructure. Centered on PyTorch and LLVM/MLIR, it builds a native AI software stack for RISC-V, providing systematic capabilities that cover model onboarding, graph and tensor representations, multi-level compilation optimization, programming languages, operator libraries, runtime, and unified hardware abstraction. This enables efficient deployment, execution, and continuous evolution of AI models on RISC-V platforms.

![RuyiAI system stack overall architecture](/docs/overview/overview-2.png)

# Objectives

Driven by real application requirements, the RuyiAI system software stack targets AI model deployment, execution, and optimization on RISC-V platforms, and forms a continuous iteration and continuous validation mechanism. By closely aligning with real scenarios and typical workloads, it continuously drives the co-evolution of system software capabilities and hardware platform capabilities, improving end-to-end efficiency from adaptation to deployment.

RuyiAI will continue to improve key components such as inference frameworks, AI compilers, AI operator libraries, AI programming languages, and runtime systems. It aims to build a system software capability framework that covers mainstream RISC-V hardware platforms and typical AI application scenarios, and gradually form a unified, efficient, and extensible AI system software ecosystem.
