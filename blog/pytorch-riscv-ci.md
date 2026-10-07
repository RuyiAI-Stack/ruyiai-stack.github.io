# PyTorch RISC‑V CI 实践

RISC-V 原生适配是推动 PyTorch 生态在 RISC-V 平台落地的重要基础。中国科学院软件研究所 RuyiAI 团队联合玄铁团队、RISE AI/ML 工作组及社区伙伴，持续推进 PyTorch 在 RISC-V 架构上的原生构建、真机测试、兼容性验证与上游社区协作。

目前，我们已搭建面向 RISC-V 的 PyTorch CI 基础设施，应用于 [RuyiAI fork 的 PyTorch 仓库](https://github.com/RuyiAI-Stack/pytorch)，实现核心测试集的稳定运行，并通过测试分片、Blocklist 管理和持续回归机制逐步扩大全量测试覆盖范围。同时，CI 过程中发现的架构适配问题、构建环境问题及相关修复，也在持续反馈并贡献至 PyTorch 上游社区。

## 背景：为什么要搭建 RISC‑V 专属 PyTorch CI

PyTorch 官方 CI 已覆盖 x86、ARM 及主流 GPU 平台，但长期缺少 RISC-V 真机测试能力。此前 RISC-V 主要依赖交叉编译进行适配验证，虽然能够发现编译问题，却难以暴露真实运行环境中的浮点精度、计时、原子操作以及高精度复数算子等兼容性问题。

随着支持 RVV 1.0 的 RISC-V 处理器逐步成熟，仅验证“能否编译”已无法满足 PyTorch 生态适配需求。为此，RuyiAI 联合玄铁团队及社区伙伴，重点推进 riscv64 原生构建与真机测试、持续跟随上游的 CI 流水线，以及基于测试结果的问题修复与上游贡献。

相关工作始于玄铁团队在 PyTorch 社区发起的 [RISC-V 支持 RFC](https://github.com/pytorch/pytorch/issues/171659)。RuyiAI 团队随后积极参与讨论与协作，并与玄铁团队共同建立 [Tracking Issue](https://github.com/pytorch/pytorch/issues/180975)，持续跟踪和推进 RISC-V 原生构建、CI、算子优化及编译器等相关工作。

## 如意社区 PyTorch CI 核心工作

### 打通 RISC‑V 原生构建能力

此前 PyTorch 在 riscv64 上主要依赖交叉编译，缺少稳定的原生构建与测试流程。针对这一问题，我们逐步完善构建环境与依赖体系，打通 PyTorch 在 RISC-V 真机上的原生构建流程：

1. **构建与测试解耦**：采用“一次构建、多机测试”方案，在高性能 RISC-V 设备上完成 Wheel 构建，并将同一安装包分发至多款 RISC-V 真机执行测试，实现原生构建、原生测试。
2. **标准化构建环境**：以 Debian Trixie 为基线，统一 Python 3.13、GCC 14、OpenBLAS 0.3.33 等核心依赖。目前主要构建环境已基本与上游对齐，并持续推进其他依赖版本的适配。
3. **完善 RISC-V 依赖供给**：依托 RISC-V 开源制品仓库 [RuyiRepo](https://github.com/RuyiRepo/ruyirepo) 提供 PyTorch 构建与测试所需的 riscv64 软件包和依赖，持续完善 RISC-V 生态的软件制品供给。

与此同时，我们也持续将构建环境适配过程中形成的修复贡献至上游社区，包括：

- https://github.com/pytorch/pytorch/pull/173663
- https://github.com/pytorch/pytorch/pull/178778

### 搭建可持续迭代的真机测试流水线

在完成原生构建后，我们进一步搭建面向 RISC-V 真机的持续测试流水线，使 PyTorch 上游代码能够在 RISC-V 平台上持续进行核心测试和全量回归。

1. **全量测试并行分片**：基于 Jenkins 将 PyTorch 测试集拆分到多个 RISC-V 节点并行执行。目前核心测试约 3 小时完成一轮，全量测试约 5 小时完成一轮，使真机全量回归能够进入常态化运行。
2. **基于历史耗时动态分片**：PyTorch 上游 CI 使用内部测试耗时数据进行任务均衡。针对外部 CI 无法直接复用这一数据的问题，我们根据历史运行结果自动生成 `test_times.json`，按照各测试用例实际耗时进行分片，减少不同节点之间因任务量不均造成的等待。
3. **Blocklist 管理已知失败**：对于当前尚未支持或受 RISC-V ISA、第三方依赖及运行环境影响的测试用例，通过统一 Blocklist 明确管理。新增失败不会被自动忽略，必须完成原因确认后才能进入 Blocklist，从而区分“已知问题”和“新增回归”，保证测试结果具有明确含义。
4. **自动汇总失败与测试日志**：每轮 CI 自动统计测试结果并生成 `failures.log`，记录具体失败用例及对应原始日志，相关结果进行 [统一归档](https://community-ci.openruyi.cn/misc/pytorch/)，便于开发者直接定位和复现问题。
5. **持续跟踪 PyTorch 上游主干**：通过 RuyiAI SyncBots 持续将 `pytorch:main` 同步至 RISC-V 工作分支，并自动触发核心测试。这样，上游代码变化导致的 RISC-V 兼容性问题可以在主干演进过程中及时发现，而不是等到版本发布后再集中适配。目前 RISC-V core 测试已保持稳定通过。
6. **推动测试问题修复上游化**：对于核心测试和全量测试中发现的 RISC-V 专项问题，我们首先在 RuyiAI 的 PyTorch fork 中完成定位、修复和回归验证，确认稳定后再向上游提交 PR，逐步将 RISC-V 适配能力合入 PyTorch 主线。

已提交上游的 PR：

- https://github.com/pytorch/cpuinfo/pull/388
- https://github.com/pytorch/pytorch/pull/193334

正在开发与验证：

- PyTorch 量化引擎的 RISC-V 支持

## RuyiAI PyTorch CI 的定位与目标

RuyiAI PyTorch CI 的核心定位，是为 RuyiAI 持续支持不同类型的 RISC-V 加速硬件后端提供稳定的验证基础，使 PyTorch 在新硬件、新指令扩展和新优化能力上的适配能够快速迭代。主要目标包括：

- **多硬件交叉验证**：在多款 RISC-V 硬件上使用统一的 PyTorch 构建产物和测试基线进行验证，快速发现不同处理器、指令扩展、工具链和运行环境之间的兼容性差异。
- **支撑 RISC-V 优化快速迭代**：RuyiAI 在持续推进算子优化、编译器适配和新指令支持。统一 CI 可以为这些改动提供稳定的回归基线，使优化能够快速验证、持续迭代，同时通过持续验证保障性能优化前后的功能正确性和兼容性。
- **为定制 RISC-V 加速硬件接入做准备**：随着更多 RISC-V 向量、矩阵及定制 AI 加速能力进入实际硬件，RuyiAI PyTorch 可以在现有 CI 基础上快速接入新的硬件后端，对其功能正确性、兼容性和优化效果进行持续验证，为后续形成统一的 RISC-V AI 硬件支持体系奠定基础。

## 与 RISE RISC-V Runners 的关系与合作

中国科学院软件研究所是 RISE 的成员单位，RuyiAI 团队成员在 RISE AI/ML WG 中担任 Co-Chair。RISE RISC-V Runners 面向开源社区提供通用的 RISC-V CI Runner 服务，RuyiAI PyTorch CI 聚焦 PyTorch 在 RISC-V 平台上的专项构建、测试与持续回归。双方通过硬件资源和 CI 能力协同，共同推进 PyTorch RISC-V 支持与上游社区衔接。

## 后续规划

后续，我们将围绕 PyTorch RISC-V 上游生态建设和 RuyiAI 自身硬件支持能力两条主线持续推进：

- **推进 PyTorch RISC-V 上游 CI 与优化能力建设**：持续与玄铁团队、RISE 及其他社区合作伙伴协作，探索建设面向 PyTorch 上游的统一 RISC-V CI 能力，并推动 RISC-V 架构适配、算子优化和性能优化成果持续贡献至上游社区，逐步完善 PyTorch 对 RISC-V 的原生支持。
- **扩展 RuyiAI PyTorch CI 硬件覆盖**：持续接入 RuyiAI 合作伙伴的 RISC-V 硬件平台，建立稳定的适配、验证与持续回归机制，为不同 RISC-V 加速硬件提供长期支持，同时为 RuyiAI 在算子、编译器和硬件后端等方向的优化与快速迭代提供统一的测试基础。

## 联系我们

对 RuyiAI 生态建设感兴趣的伙伴们，可关注我们的 GitHub 仓库或官方主页获取最新的技术文档与项目进展。

RISC-V AI 软硬件生态的繁荣离不开广泛合作，RuyiAI 团队长期开放实习岗位，并诚挚欢迎各类项目合作，联系邮箱：hongbin2019@iscas.ac.cn（张洪滨）

## 参考链接

1. [RuyiAI 官方主页](https://www.ruyiai.org/)
2. [PyTorch RISC-V 支持 RFC](https://github.com/pytorch/pytorch/issues/171659)
3. [Tracking Issue](https://github.com/pytorch/pytorch/issues/180975)
4. [RuyiAI-Stack/pytorch fork](https://github.com/RuyiAI-Stack/pytorch)
5. [RuyiRepo](https://github.com/RuyiRepo/ruyirepo)
6. [禁用 riscv64 的 cuda 绑定](https://github.com/pytorch/pytorch/pull/173663)
7. [mkl 仅用于 x86](https://github.com/pytorch/pytorch/pull/178778)
8. [PyTorch RISC-V CI 结果归档](https://community-ci.openruyi.cn/misc/pytorch/)
9. [cpuinfo 读 L1/L2 cache size](https://github.com/pytorch/cpuinfo/pull/388)
10. [优化 NaN 符号位处理](https://github.com/pytorch/pytorch/pull/193334)
11. [Add RISC-V blacklist (draft)](https://github.com/pytorch/pytorch/pull/195345)
