# 调试 Triton 程序

`triton-shared` 提供了一个构建选项，可启用 LLVM sanitizers（AddressSanitizer, ASan 和 ThreadSanitizer, TSan），用于帮助检测 Triton 程序中的内存安全与并发问题。这些 sanitizer 会在程序运行时进行动态分析，分别用于识别缓冲区溢出、数据竞争等问题。更多细节与配置方法请参考[这里](triton-san/README.md)。
