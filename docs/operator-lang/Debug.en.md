# Debugging Triton Programs

Triton-shared includes a build option that enables LLVM-sanitizers - AddressSanitizer (ASan) and ThreadSanitizer (TSan) - to help detect memory safety and concurrency issues in Triton programs. These sanitizers dynamically analyze the program during execution, identifying bugs such as buffer overflows and data races respectively. For more details and setup instructions, refer [here](triton-san/README.md).
