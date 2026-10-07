# PyTorch CI on RISC-V: Implementation and Practice

Native RISC-V support is a critical foundation for bringing the PyTorch ecosystem to RISC-V platforms. The RuyiAI team at the Institute of Software, Chinese Academy of Sciences (ISCAS), together with the XuanTie team, the RISE AI/ML Working Group, and broader community partners, has been working to strengthen PyTorch support for RISC-V through native builds, testing on real RISC-V hardware, compatibility validation, continuous integration, and upstream collaboration.

We have established a CI infrastructure for PyTorch on RISC-V and integrated it into the [RuyiAI fork of PyTorch](https://github.com/RuyiAI-Stack/pytorch). The core test suite now runs reliably on RISC-V, while test sharding, blocklist management, and continuous regression testing are progressively expanding coverage across the broader PyTorch test suite. Architecture-specific issues identified through CI are systematically tracked and reported, with corresponding fixes and improvements contributed back to the upstream PyTorch community.

## Background: Why Does RISC-V Need Dedicated PyTorch CI?

PyTorch's official CI infrastructure provides broad coverage across x86, Arm, and mainstream GPU platforms, but validation on physical RISC-V hardware remains limited. As a result, earlier RISC-V enablement efforts relied heavily on cross-compilation and simulator-based testing. While these approaches are valuable for initial bring-up, they cannot fully expose runtime issues that emerge only on real hardware, including problems related to floating-point behavior, atomic operations, timing, complex-number computation, and other architecture-specific execution details.

As RISC-V processors, particularly those supporting RVV 1.0, continue to mature, simply verifying that PyTorch can be successfully compiled for RISC-V is no longer sufficient. Robust ecosystem support requires continuous validation of actual PyTorch workloads on physical RISC-V systems. To address this gap, the RuyiAI team, the XuanTie team, and community partners are building native CI pipelines on real RISC-V hardware to continuously track upstream PyTorch development, detect architecture-specific regressions, identify compatibility issues, and drive corresponding fixes and upstream contributions.

This effort originated from the [RFC for RISC-V support](https://github.com/pytorch/pytorch/issues/171659) initiated by the XuanTie team in the PyTorch community. The RuyiAI team subsequently joined the effort and has been collaborating with the XuanTie team and broader community to advance native RISC-V support. As part of this collaboration, a dedicated [tracking issue](https://github.com/pytorch/pytorch/issues/180975) was established to coordinate ongoing work across native builds, CI infrastructure, operator optimization, compiler support, and other RISC-V-specific enablement efforts.

## PyTorch CI Development in the RuyiAI Community

### 2.1 Enabling Native RISC-V Builds

The first step was to establish a stable and reproducible workflow for building PyTorch natively on riscv64. Our work has focused on three main areas:

1. **Separating the build and test stages:** We adopt a "build once, test on multiple machines" strategy. PyTorch wheels are built on a high-performance RISC-V system and then distributed to multiple RISC-V machines for validation. This avoids redundant builds and allows the same binary artifact to be tested consistently across different hardware platforms.

2. **Standardizing the build environment:** We use Debian Trixie as the baseline operating system, with Python 3.13, GCC 14, and OpenBLAS 0.3.33 as key components of the toolchain. The environment is kept as closely aligned with upstream PyTorch as possible, while remaining dependency differences are being addressed incrementally as RISC-V software support matures.

3. **Improving the availability of RISC-V dependencies:** [RuyiRepo](https://github.com/RuyiRepo/ruyirepo), an open-source software repository for RISC-V, provides riscv64 packages and dependencies required by the PyTorch build and test environments. This reduces the effort required to provision native RISC-V systems and improves the availability and reproducibility of software artifacts across the broader RISC-V ecosystem.

We are also contributing fixes identified during the adaptation of the native build environment back to the upstream PyTorch community, including:

- [https://github.com/pytorch/pytorch/pull/173663](https://github.com/pytorch/pytorch/pull/173663)

- [https://github.com/pytorch/pytorch/pull/178778](https://github.com/pytorch/pytorch/pull/178778)

### 2.2 Building a Continuous Test Pipeline on Physical RISC-V Hardware

With a reproducible native build workflow in place, we established a continuous testing pipeline on physical RISC-V hardware. The pipeline supports both frequent core-test validation and broader full-suite regression testing against upstream PyTorch development.

1. **Parallel sharding of the test suite:** Jenkins distributes PyTorch tests across multiple physical RISC-V nodes and executes them in parallel. A core test run currently takes approximately three hours, while a full test run takes approximately five hours. This makes routine large-scale regression testing on real RISC-V hardware practical.

2. **Dynamic sharding based on historical execution times:** Upstream PyTorch CI uses internal test timing data to balance workloads across workers. Because this data is not directly available to external CI systems, our pipeline automatically derives `test_times.json` from historical RISC-V test runs. Tests are then partitioned according to their observed execution times, reducing load imbalance and minimizing idle time across CI nodes.

3. **Managing known failures through a blocklist:** A unified blocklist explicitly records tests that are currently unsupported or affected by RISC-V ISA behavior, third-party dependencies, or limitations in the runtime environment. New failures are never added automatically. Each failure must first be investigated and classified before being added to the blocklist. This ensures that known limitations remain distinguishable from newly introduced regressions and keeps CI results actionable.

4. **Automatically aggregating failures and test logs:** Each CI run summarizes test outcomes and generates a `failures.log` file containing the failing test cases together with their corresponding raw logs. Test results are [archived centrally](https://community-ci.openruyi.cn/misc/pytorch/), allowing developers to inspect failures, compare regressions across runs, and reproduce issues more efficiently.

5. **Continuously tracking upstream PyTorch `main`:** RuyiAI SyncBots continuously synchronize changes from `pytorch:main` into the RISC-V working branch and automatically trigger core tests. This allows compatibility regressions introduced by upstream development to be detected early, rather than postponing RISC-V adaptation until a release cycle is complete. At present, the RISC-V core test suite is passing consistently.

6. **Contributing test-driven fixes upstream:** When RISC-V-specific issues are uncovered by core or full-suite testing, we first diagnose the root cause, implement a fix, and validate it through regression testing in the RuyiAI PyTorch fork. Once the fix has demonstrated sufficient stability, it is submitted upstream. Through this process, the CI infrastructure serves not only as a validation system, but also as a continuous feedback loop for progressively improving RISC-V support in upstream PyTorch.

**PRs submitted upstream:**

- [https://github.com/pytorch/cpuinfo/pull/388](https://github.com/pytorch/cpuinfo/pull/388)

- [https://github.com/pytorch/pytorch/pull/193334](https://github.com/pytorch/pytorch/pull/193334)

**Work currently under development and validation:**

- RISC-V support for PyTorch quantization engines.

## Positioning, Goals, and Related Work

### 3.1 Positioning and Goals of RuyiAI PyTorch CI

RuyiAI PyTorch CI is intended to provide a stable and reusable validation foundation for RuyiAI's ongoing support of diverse RISC-V processors and accelerator backends. It enables faster iteration as PyTorch is adapted to new hardware platforms, instruction-set extensions, compiler optimizations, and architecture-specific runtime capabilities. Its main goals include:

- **Cross-validation across hardware platforms:** Validate a common PyTorch build artifact and a consistent test baseline across multiple RISC-V platforms, making it easier to identify compatibility differences introduced by processor implementations, instruction-set extensions, toolchains, system software, and runtime environments.

- **Supporting rapid iteration of RISC-V optimizations:** RuyiAI continues to advance operator-level optimizations, compiler enablement, and support for emerging RISC-V instructions and extensions. A unified CI infrastructure provides a stable regression baseline for these efforts, enabling rapid development and continuous validation while preserving functional correctness and compatibility before and after performance-oriented changes.

- **Preparing for emerging RISC-V accelerator hardware:** As RISC-V vector, matrix, and custom AI acceleration capabilities increasingly become available in physical hardware, the existing CI infrastructure can be extended to integrate new hardware backends and continuously validate their correctness, compatibility, and performance benefits. This provides an important foundation for building a unified software framework for RISC-V AI hardware enablement.

In this sense, RuyiAI PyTorch CI is not only a testing system for current RISC-V platforms, but also an infrastructure layer for continuously integrating future RISC-V AI hardware into the PyTorch ecosystem.

### 3.2 Relationship and Collaboration with RISE RISC-V Runners

ISCAS is a member of RISE, and a member of the RuyiAI team serves as Co-Chair of the RISE AI/ML Working Group. Within this broader ecosystem, RISE RISC-V Runners provides general-purpose RISC-V CI runner infrastructure for open-source projects, while RuyiAI PyTorch CI focuses specifically on PyTorch-native builds, test orchestration, regression testing, issue diagnosis, and upstream enablement on RISC-V.

The two efforts are therefore complementary rather than overlapping. RISE RISC-V Runners provides broadly reusable RISC-V CI resources, while RuyiAI PyTorch CI builds the PyTorch-specific validation and engineering workflow on top of physical RISC-V infrastructure. Through coordination of hardware resources, CI capacity, and upstream development efforts, the two initiatives jointly help strengthen PyTorch support for RISC-V and improve collaboration with the wider PyTorch and RISC-V communities.

## Next Steps

Going forward, we will continue to advance two complementary priorities: strengthening RISC-V support in upstream PyTorch and expanding RuyiAI's own hardware enablement and validation capabilities.

- **Strengthening upstream PyTorch RISC-V CI and optimization:** We will continue collaborating with the XuanTie team, RISE, and other community partners to explore a more unified CI capability for RISC-V in upstream PyTorch. In parallel, we will continue contributing architecture enablement, operator optimizations, compatibility fixes, and performance improvements upstream, progressively improving the completeness, stability, and performance of PyTorch on RISC-V.

- **Expanding hardware coverage in RuyiAI PyTorch CI:** We will continue integrating RISC-V hardware platforms from RuyiAI partners and establishing stable workflows for hardware adaptation, validation, and continuous regression testing. This infrastructure will provide long-term support for a growing range of RISC-V processor and accelerator platforms, while also serving as a unified validation foundation for rapid iteration across operators, compilers, runtime components, and hardware backends.

## Contact Us

If you are interested in RuyiAI or would like to contribute to the RISC-V AI ecosystem, please follow our [GitHub repositories](https://github.com/RuyiAI-Stack) and [official website](https://www.ruyiai.org/) for the latest project updates, technical documentation, and community activities.

Building a thriving RISC-V AI software and hardware ecosystem requires broad and sustained collaboration across the community. The RuyiAI team welcomes contributions from developers, researchers, hardware vendors, and ecosystem partners. We also welcome internship applications on an ongoing basis, as well as opportunities for research, engineering, and project collaboration.

For inquiries, please contact Hongbin Zhang at [hongbin2019@iscas.ac.cn](mailto:hongbin2019@iscas.ac.cn).

## Related Links

- [RuyiAI official website](https://www.ruyiai.org/)

- [RFC for PyTorch RISC-V support](https://github.com/pytorch/pytorch/issues/171659)

- [Tracking issue](https://github.com/pytorch/pytorch/issues/180975)

- [RuyiAI-Stack/pytorch fork](https://github.com/RuyiAI-Stack/pytorch)

- [RuyiRepo](https://github.com/RuyiRepo/ruyirepo)

- [Disable CUDA bindings on riscv64](https://github.com/pytorch/pytorch/pull/173663)

- [Restrict MKL to x86](https://github.com/pytorch/pytorch/pull/178778)

- [PyTorch RISC-V CI results archive](https://community-ci.openruyi.cn/misc/pytorch/)

- [Read L1/L2 cache sizes in cpuinfo](https://github.com/pytorch/cpuinfo/pull/388)

- [Improve NaN sign-bit handling](https://github.com/pytorch/pytorch/pull/193334)

- [Add RISC-V blacklist (draft)](https://github.com/pytorch/pytorch/pull/195345)
