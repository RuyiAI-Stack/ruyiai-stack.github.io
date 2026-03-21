# 总览

## 1. 独立使用（Stand-Alone）
中间层可作为独立组件，将 Triton dialect 转换为中间层 dialect。主要用于测试与验证；也可在将 IR 交给其他 MLIR 编译器之前先经过该转换。

独立使用示例：
```
triton-shared-opt --triton-to-linalg %file
```

## 2. 后端组件（Backend Component）
Triton 中间层的设计目标之一是作为 Triton 后端中的组件使用。可将该层生成的 CMake 目标及其头文件集成到对应后端中。示例后端将在后续发布。

## 3. 参考 CPU 后端（Reference CPU backend）
我们还提供一个实验性的参考 CPU 后端，复用现有 `mlir` pass。构建完成后，可通过设置 `triton` 的活跃驱动来使用该 CPU 后端：

```python

import triton
from triton.backends.triton_shared.driver import CPUDriver

triton.runtime.driver.set_active(CPUDriver())
```

更多示例请参考 `python/examples`。
