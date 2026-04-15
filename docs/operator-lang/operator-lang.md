# RuyiAI 算子编程语言

![RuyiAI 算子编程语言](/docs/operator-lang/operator-lang.png)

RuyiAI 面向高性能算子开发需求，支持基于 **Triton** 和 **TileLang** 的算子编程框架，并构建了面向 RISC-V 平台的 **Triton-RISCV** 与 **TileLang-RISCV**，提供统一的算子开发入口与编译执行基础设施。依托 Python 编程接口，开发者可以使用高层算子语言描述计算逻辑，在兼顾开发效率的同时提升面向特定硬件平台的表达能力与优化空间。

在编译流程上，RuyiAI 将不同语言前端生成的语言级 IR 统一解析到 **MLIR Linalg** 抽象层级，从而在中间表示层实现不同编程语言的统一承载与编译路径收敛。在此基础上，系统进一步依托 **Buddy Compiler** 对 Linalg 级别的 MLIR 进行持续编译下降、优化与目标代码生成，最终完成在 RISC-V 平台上的高效执行。通过这一“算子编程语言—统一中间表示—编译下降—执行部署”的技术路径，RuyiAI 为多语言算子开发提供了统一、开放、可扩展的系统支撑。
