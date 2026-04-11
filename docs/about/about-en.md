# About RuyiAI

## Project Background

**RuyiAI** (**R**ISC-V **U**nified **Y**ottascale **I**nfrastructure for **AI**) is a next-generation open-source AI system software stack designed for the RISC-V architecture.

Against the backdrop of the explosive growth in the RISC-V hardware ecosystem, RuyiAI is dedicated to addressing the core pain point of AI software stack fragmentation. By providing a unified hardware abstraction layer, high-performance compilers, and a runtime environment, we break down the barriers between underlying hardware differences and upper-layer AI frameworks. This enables mainstream Large Language Models (LLMs) like DeepSeek, Llama, and Qwen to run efficiently and seamlessly on diverse RISC-V platforms, while deeply integrating with top-tier global open-source communities such as PyTorch and LLVM/MLIR.

## Vision & Mission

RuyiAI's vision is to build an open, efficient, and unified RISC-V AI software ecosystem, bridging the gap between software and hardware.

*   **Unified**: Shielding heterogeneous hardware differences to provide developers with a unified programming interface and deployment experience, lowering the barrier for RISC-V AI development.
*   **Efficient**: Fully unleashing the ultimate performance of RISC-V hardware in AI scenarios through compiler optimizations and high-performance operator libraries.
*   **Open**: Leveraging the open nature of RISC-V to connect chip vendors, system software developers, and algorithm developers, jointly prospering the AI software ecosystem.

## Core Capabilities

RuyiAI provides full-stack technical support ranging from underlying hardware adaptation to upper-layer framework integration, covering the following core areas:

*   **RuyiAI Compiler**: A high-performance AI compiler based on MLIR. It encompasses RVV environment setup, IME Dialect extensions, Gemmini support, and various Pass developments (such as dynamic vector representation and convolution vectorization), providing deep compilation optimization capabilities for the RISC-V backend.
*   **RuyiAI Operator Programming Language**: Provides Triton's RISC-V adaptation and TileLang support. Through custom intermediate representation output and debugging tools, it enhances the programmability and flexibility of operator development.
*   **RuyiAI Operator Library & Runtime**: Constructs a high-performance operator library (Ruyi DNN) and a unified runtime environment. It handles hardware abstraction, memory management, and scheduled execution, ensuring the efficient operation of the software stack on heterogeneous hardware.

## Organization & Team

RuyiAI is initiated and led by the **Intelligent Software Research Center, Institute of Software, Chinese Academy of Sciences (ISCAS)**.

Relying on ISCAS's profound heritage in system software and compilers, we have assembled a core team composed of senior system architects, compiler experts, and AI engineers. The team possesses solid accumulation and rich experience in AI compilation technology, high-performance computing, and open-source ecosystem construction, with full-stack R&D capabilities ranging from underlying toolchain development to upper-layer system optimization.

Upholding the philosophy of open collaboration, we are committed to working with global developers and industry partners to jointly promote the prosperous development of the RISC-V AI software ecosystem.
