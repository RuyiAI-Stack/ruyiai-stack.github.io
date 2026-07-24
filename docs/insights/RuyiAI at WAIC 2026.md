# RuyiAI at WAIC 2026 \| Building a RISC\-V Native AI System Software Stack

From July 17 to 20, 2026, the World Artificial Intelligence Conference, WAIC 2026, was held in Shanghai under the theme “Intelligent Partners, Co\-creating the Future\.” As part of the conference, the RISC\-V and AI Integration Development Forum brought together researchers, developers, and industry partners to discuss the growing intersection of RISC\-V and AI\.

![image\.png](图片和附件/image.png)

At the forum, we presented the latest progress of RuyiAI, an AI system software stack for the RISC\-V architecture developed by the Intelligent Software Research Center of the Institute of Software, Chinese Academy of Sciences \(ISCAS\)\. RuyiAI is designed as a RISC\-V\-native AI system software stack, providing foundational software support for AI applications, frameworks, and diverse computing platforms\.

## Architecture and Design Principles of RuyiAI

RuyiAI is dedicated to building a unified, efficient, and scalable AI system software stack for the RISC\-V ecosystem\. It provides deployment and optimization support for AI workloads, including large language models, computer vision, audio processing, scientific computing, retrieval and matching, and other emerging AI applications\.

![RuyiAI\-Goal\-EN\.png](图片和附件/RuyiAI-Goal-EN.png)

RuyiAI takes PyTorch and MLIR as its two major ecosystem foundations, focusing on key components including AI compilers \(Buddy Compiler\), AI programming language support \(Triton\-RISCV and TileLang\-RISCV\), AI operator libraries, and AI runtime environments\. It supports RVV, AME, IME, and high\-performance custom extensions, providing unified software support across computing platforms, including AI SoCs, AI accelerators, and AI host servers\. RuyiAI aims to become a public open\-source platform for the RISC\-V AI ecosystem and collaborate with industry partners to accelerate its development\.

![RuyiAI\-EN\.png](图片和附件/RuyiAI-EN.png)

RuyiAI has developed CI infrastructure \(RVCI\) and version synchronization agents \(SyncBots\) around PyTorch and MLIR for RISC\-V\. To better support the RISC\-V community, RuyiAI maintains long\-term forks of PyTorch and LLVM Project under the RuyiAI GitHub organization, contributes fixes for common issues upstream, and provides continuous maintenance for RISC\-V\-specific extensions\.

![G5\.png](图片和附件/G5.png)

## RuyiAI Community

As AI workloads continue to evolve, the RuyiAI team has continuously advanced AI system software and multi\-level compiler technologies through upstream contributions to MLIR, the development of the Buddy Compiler community, and the implementation of the RuyiAI system software stack\.

![TimeLine\-EN\.png](图片和附件/TimeLine-EN.png)

The RuyiAI team is actively engaged in leading international organizations and open\-source communities, with team members serving in key roles, including RISC\-V International TSC members, RISE AI/ML Working Group Co\-Chair, CHIPS Alliance Board Member, and XiangShan Community Partner\. Through continued open\-source collaboration, RuyiAI aims to foster stronger connections among the RISC\-V, AI/ML, and system software communities\.

![Community\.png](图片和附件/Community.png)

As RISC\-V and AI continue to converge, RuyiAI is committed to enabling AI applications on RISC\-V while building native AI software capabilities for the era of large models, AI agents, and heterogeneous computing\. Moving forward, RuyiAI will continue to evolve with industry needs, strengthen key software ecosystems, optimize core components, and advance hardware\-software co\-design with ecosystem partners to build an open and collaborative RISC\-V AI ecosystem\.

## More Information

- RuyiAI article: https://mp\.weixin\.qq\.com/s/JwEvzRm9WFIp7wyAWbMAhw

- RuyiAI website: https://www\.ruyiai\.org/

- RuyiAI Buddy Compiler repository: https://github\.com/buddy\-compiler/buddy\-mlir

- RuyiAI Triton\-RISCV repository: https://github\.com/RuyiAI\-Stack/triton\-riscv

- RuyiAI TileLang\-RISCV repository: https://github\.com/RuyiAI\-Stack/tilelang\-riscv

- RISC\-V Europe Summit Poster: https://www\.ruyiai\.org/docs\.html\#RISC\-V\-EU\-2026

- EuroLLVM technical talk: https://www\.youtube\.com/watch?v=EELBpBA\-XCE

- CGO C4ML technical talk: https://www\.ruyiai\.org/docs\.html\#C4ML2024
