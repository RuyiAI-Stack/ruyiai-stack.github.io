(function () {
  var docItems = {
    overview: {
      title: "总览",
      titleEn: "Overview",
      desc: "Ruyi AI 文档总览",
      descEn: "Ruyi AI documentation overview",
      markdown: "欢迎查阅 Ruyi AI 文档。\n\n（待补充 TBD）",
      markdownEn: "Welcome to Ruyi AI documentation.\n\n(TBD)"
    },
    install: {
      title: "安装方式",
      titleEn: "Install",
      desc: "Ruyi AI 的安装与配置",
      descEn: "Installation and configuration",
      markdownUrl: "docs/install/install.md"
    },
    tutorial: {
      title: "使用教程",
      titleEn: "Tutorial",
      desc: "Ruyi AI 使用教程与示例",
      descEn: "Tutorial and examples",
      markdown: "欢迎查阅 Ruyi AI 使用教程。\n\n（待补充 TBD）",
      markdownEn: "Welcome to Ruyi AI tutorial.\n\n(TBD)"
    },
    "contributor-guide": {
      title: "贡献者指引",
      titleEn: "Contributor Guide",
      desc: "如何参与 Ruyi AI 项目贡献",
      descEn: "How to contribute to Ruyi AI",
      markdown: "欢迎参与 Ruyi AI 贡献。\n\n（待补充 TBD）",
      markdownEn: "Welcome to contribute to Ruyi AI.\n\n(TBD)"
    },
    "code-style": {
      title: "代码规范",
      titleEn: "Code Style",
      desc: "Ruyi AI 项目代码规范与约定",
      descEn: "Code style and conventions",
      markdownUrl: "docs/contributor-guide/code-style.md"
    },
    "git-workflow": {
      title: "Git 开源工作流程",
      titleEn: "Git Workflow",
      desc: "RuyiAI 社区采用 Fork + Pull Request 的工作模式进行开源贡献。",
      descEn: "Fork + Pull Request workflow",
      markdownUrl: "docs/contributor-guide/git-workflow.md"
    },
    compiler: {
      title: "Ruyi AI 编译器",
      titleEn: "Ruyi AI Compiler",
      desc: "基于 MLIR 桥接 PyTorch 和 RISC-V",
      descEn: "MLIR-based bridge between PyTorch and RISC-V",
      markdownUrl: "docs/compiler/compiler.md"
    },
    "rvv-environment": {
      title: "RVV 环境",
      titleEn: "RVV Environment",
      desc: "MLIR 与 RVV 测试实验环境搭建指南",
      descEn: "Environment setup for MLIR and RVV testing",
      markdownUrl: "docs/compiler/RVVEnvironment.md"
    },
    about: {
      title: "关于",
      titleEn: "About",
      desc: "了解 Ruyi AI 项目的背景、愿景与团队。",
      descEn: "About Ruyi AI project and team",
      markdownUrl: "docs/about/about.md"
    },
    "ime-dialect": {
      title: "SpacemiT IME 方言",
      titleEn: "SpacemiT IME Dialect",
      desc: "本文提供在 buddy-mlir 中使用 IME（Integrated Matrix Extension）方言的完整指南。",
      descEn: "This document provides a comprehensive guide for using the IME (Integrated Matrix Extension) dialect in buddy-mlir.",
      markdownUrl: "docs/compiler/IMEDialect.md"
    },
    gemmini: {
      title: "Gemmini",
      titleEn: "Gemmini",
      desc: "Gemmini 相关文档",
      descEn: "Gemmini documentation",
      markdownUrl: "docs/compiler/Gemmini.md"
    },
    "add-pass": {
      title: "添加 Pass",
      titleEn: "Add Pass",
      desc: "以 BatchMatMul 为例，在中端实现并集成优化 Pass 的完整流程。",
      descEn: "End-to-end guide to adding an optimization pass in the midend using BatchMatMul as an example.",
      markdownUrl: "docs/compiler/AddPass.md"
    },
    "build-methods": {
      title: "构建方法",
      titleEn: "Build Methods",
      desc: "除标准方式外的其他构建配置与替代构建方法。",
      descEn: "Additional build configurations and alternative methods for building buddy-mlir.",
      markdownUrl: "docs/compiler/BuildMethods.md"
    },
    "dynamic-vector": {
      title: "动态向量表示",
      titleEn: "Dynamic Vector Representation",
      desc: "为 MLIR Vector Dialect 引入动态向量：类型、操作与语义。",
      descEn: "Dynamic vectors for the MLIR Vector dialect: types, operations, and semantics.",
      markdownUrl: "docs/compiler/DynamicVector.md"
    },
    "conv-opt": {
      title: "卷积优化",
      titleEn: "Convolution Optimization",
      desc: "卷积优化工具 conv-opt：系数广播算法与所需 Vector/affine 操作概览。",
      descEn: "Convolution optimization tool conv-opt: coefficients broadcasting algorithm and required Vector/affine ops.",
      markdownUrl: "docs/compiler/conv-opt.md"
    },
    "adding-operators": {
      title: "增加算子支持",
      titleEn: "Adding Operators",
      desc: "增加算子与模型集成相关文档",
      descEn: "Adding operators and model integration",
      markdownUrl: "docs/compiler/AddingOperatorsAndModelIntegration.md"
    },
    "convolution-vectorization": {
      title: "卷积向量化",
      titleEn: "Convolution Vectorization",
      desc: "卷积向量化相关文档",
      descEn: "Convolution vectorization documentation",
      markdownUrl: "docs/compiler/ConvolutionVectorization.md"
    },
    "triton-on-riscv": {
      title: "Triton 的 RISC-V 适配",
      titleEn: "Triton on RISC-V",
      desc: "Triton 在 RISC-V 平台上的移植与适配实践。",
      descEn: "Porting and adapting Triton for RISC-V",
      markdownUrl: "docs/operator-lang/triton-on-riscv.md"
    },
    debug: {
      title: "调试",
      titleEn: "Debug",
      desc: "使用 ASan/TSan 检测 Triton 程序中的内存安全与并发问题。",
      descEn: "Use ASan/TSan to detect memory safety and concurrency issues in Triton programs.",
      markdownUrl: "docs/operator-lang/Debug.md"
    },
    "ir-output": {
      title: "中间表示输出",
      titleEn: "Intermediate Representation (IR) Output",
      desc: "Triton 共享中间表示（IR）转储：通过环境变量控制输出目录。",
      descEn: "Triton shared IR dumping: control the output directory via environment variables.",
      markdownUrl: "docs/operator-lang/IR.md"
    },
    "triton-riscv-overview": {
      title: "Triton RISC-V 总览",
      titleEn: "Triton RISC-V Overview",
      desc: "Triton 中间层在独立使用、后端集成与参考 CPU 后端方面的整体介绍。",
      descEn: "Overview of Triton middle layer usage in stand-alone mode, backend integration, and reference CPU backend.",
      markdownUrl: "docs/operator-lang/Triton-Risc-V-Overview.md"
    },
    implementation: {
      title: "实现方案",
      titleEn: "Implementation",
      desc: "Triton 到 Linalg 的分析流程与转换策略实现细节。",
      descEn: "Implementation details of analyses and conversion strategy from Triton to Linalg.",
      markdownUrl: "docs/operator-lang/Implementation.md"
    },
    "operator-lang": {
      title: "Ruyi AI 算子编程语言",
      titleEn: "Ruyi AI Operator Language",
      desc: "面向 RISC-V 适配 Triton / TileLang",
      descEn: "Triton / TileLang for RISC-V",
      markdown: "欢迎查阅 Ruyi AI 算子编程语言文档。\n\n（待补充 TBD）",
      markdownEn: "Welcome to Ruyi AI Operator Language documentation.\n\n(TBD)"
    },
    "operator-lib": {
      title: "Ruyi AI 算子库",
      titleEn: "Ruyi AI Operator Library",
      desc: "面向 RISC-V 的原生高性能算子库",
      descEn: "Native high-performance operator library for RISC-V",
      markdown: "欢迎查阅 Ruyi AI 算子库文档。\n\n（待补充 TBD）",
      markdownEn: "Welcome to Ruyi AI Operator Library documentation.\n\n(TBD)"
    },
    runtime: {
      title: "Ruyi AI 运行时环境",
      titleEn: "Ruyi AI Runtime",
      desc: "面向 RISC-V 各类扩展的统一运行时环境",
      descEn: "Unified runtime for RISC-V extensions",
      markdown: "欢迎查阅 Ruyi AI 运行时环境文档。\n\n（待补充 TBD）",
      markdownEn: "Welcome to Ruyi AI Runtime documentation.\n\n(TBD)"
    },
    insights: {
      title: "洞察",
      titleEn: "Insights",
      desc: "了解 Ruyi AI 的愿景与团队",
      descEn: "Ruyi AI insights and team",
      markdown: "欢迎了解 Ruyi AI 洞察与分享。\n\n（待补充 TBD）",
      markdownEn: "Welcome to Ruyi AI insights.\n\n(TBD)"
    },
    C4ML2024: {
      title: "C4ML2024",
      titleEn: "C4ML2024",
      desc: "Buddy Compiler at C4ML 2024",
      descEn: "Buddy Compiler at C4ML 2024",
      markdownUrl: "docs/insights/C4ML2024.md",
      bodyOnly: true
    }
  };

  var defaultDocId = "overview";

  /** 解析文档 URL：相对路径以当前页面地址为基准，与 fetch 默认行为一致 */
  function resolveDocUrl(relativePath) {
    try {
      return new URL(relativePath, window.location.href).href;
    } catch (e) {
      return relativePath;
    }
  }

  function getDocIdFromHash() {
    var hash = window.location.hash.slice(1);
    if (!hash && window.location.href.indexOf("#") !== -1) {
      var parts = window.location.href.split("#");
      hash = (parts[1] || "").split("?")[0];
    }
    return docItems[hash] ? hash : defaultDocId;
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function parseInlineMarkdown(text) {
    var html = escapeHtml(text);
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return html;
  }

  function simpleMarkdownToHtml(md) {
    var lines = String(md || "").replace(/\r\n?/g, "\n").split("\n");
    var out = [];
    var inCode = false;
    var inHtmlComment = false;
    var codeBuf = [];
    var paraBuf = [];
    var listBuf = [];
    var listType = null;

    function flushParagraph() {
      if (!paraBuf.length) return;
      out.push("<p>" + parseInlineMarkdown(paraBuf.join(" ")) + "</p>");
      paraBuf = [];
    }

    function flushList() {
      if (!listBuf.length) return;
      var tag = listType === "ol" ? "ol" : "ul";
      out.push("<" + tag + ">");
      listBuf.forEach(function (item) {
        out.push("<li>" + parseInlineMarkdown(item) + "</li>");
      });
      out.push("</" + tag + ">");
      listBuf = [];
      listType = null;
    }

    function flushCode() {
      if (!inCode) return;
      out.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
      inCode = false;
      codeBuf = [];
    }

    function isTableSeparator(line) {
      return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line || "");
    }

    function parseTableCells(line) {
      var text = String(line || "").trim();
      if (text.startsWith("|")) text = text.slice(1);
      if (text.endsWith("|")) text = text.slice(0, -1);
      return text.split("|").map(function (c) { return c.trim(); });
    }

    function isLikelyTableRow(line) {
      return /^\s*\|.*\|\s*$/.test(line || "");
    }

    function isHtmlStartWithoutClose(line) {
      return /^\s*<[A-Za-z][^>]*$/.test(line || "");
    }

    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i];
      if (!inCode) {
        if (inHtmlComment) {
          if (line.indexOf("-->") !== -1) inHtmlComment = false;
          continue;
        }
        if (line.indexOf("<!--") !== -1) {
          if (line.indexOf("-->") === -1 || line.indexOf("<!--") > line.indexOf("-->")) {
            inHtmlComment = true;
          }
          // Ignore HTML comments in fallback mode.
          continue;
        }
      }

      if (/^\s*```/.test(line)) {
        flushParagraph();
        flushList();
        if (inCode) {
          flushCode();
        } else {
          inCode = true;
          codeBuf = [];
        }
        continue;
      }

      if (inCode) {
        codeBuf.push(line);
        continue;
      }

      var heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        flushParagraph();
        flushList();
        var level = heading[1].length;
        out.push("<h" + level + ">" + parseInlineMarkdown(heading[2]) + "</h" + level + ">");
        continue;
      }

      // Horizontal rules like --- *** ___
      if (/^\s*([-*_]\s*){3,}\s*$/.test(line)) {
        flushParagraph();
        flushList();
        out.push("<hr>");
        continue;
      }

      // Blockquote lines like: > note
      var blockquote = line.match(/^\s*>\s?(.*)$/);
      if (blockquote) {
        flushParagraph();
        flushList();
        out.push("<blockquote><p>" + parseInlineMarkdown(blockquote[1]) + "</p></blockquote>");
        continue;
      }

      // Keep raw HTML blocks (e.g. <img ... />) as-is in fallback mode.
      if (/^\s*<[^>]+>\s*$/.test(line)) {
        flushParagraph();
        flushList();
        out.push(line.trim());
        continue;
      }

      // Keep multi-line raw HTML tags (e.g. <iframe ... \n ... >) in fallback mode.
      if (isHtmlStartWithoutClose(line)) {
        flushParagraph();
        flushList();
        var htmlBuf = [line];
        while (i + 1 < lines.length) {
          i += 1;
          htmlBuf.push(lines[i]);
          if (lines[i].indexOf(">") !== -1) break;
        }
        out.push(htmlBuf.join("\n"));
        continue;
      }

      // GitHub-style markdown table:
      // | h1 | h2 |
      // |----|----|
      // | c1 | c2 |
      if (isLikelyTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
        flushParagraph();
        flushList();
        var headers = parseTableCells(line);
        out.push("<table>");
        out.push("<thead><tr>");
        headers.forEach(function (h) {
          out.push("<th>" + parseInlineMarkdown(h) + "</th>");
        });
        out.push("</tr></thead>");
        out.push("<tbody>");
        i += 2;
        while (i < lines.length && isLikelyTableRow(lines[i])) {
          var cells = parseTableCells(lines[i]);
          out.push("<tr>");
          for (var c = 0; c < headers.length; c += 1) {
            out.push("<td>" + parseInlineMarkdown(cells[c] || "") + "</td>");
          }
          out.push("</tr>");
          i += 1;
        }
        out.push("</tbody></table>");
        i -= 1;
        continue;
      }

      var listItem = line.match(/^\s*[-*+]\s+(.*)$/);
      var orderedItem = line.match(/^\s*\d+\.\s+(.*)$/);
      if (listItem) {
        flushParagraph();
        if (listType && listType !== "ul") flushList();
        listType = "ul";
        listBuf.push(listItem[1]);
        continue;
      }
      if (orderedItem) {
        flushParagraph();
        if (listType && listType !== "ol") flushList();
        listType = "ol";
        listBuf.push(orderedItem[1]);
        continue;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList();
        continue;
      }

      paraBuf.push(line.trim());
    }

    flushParagraph();
    flushList();
    flushCode();
    return out.join("\n");
  }

  function parseMarkdown(md) {
    var raw = (md || "").trim();
    if (!raw) return "";
    if (typeof marked === "undefined") return simpleMarkdownToHtml(raw);
    if (typeof marked.parse === "function") return marked.parse(raw);
    if (typeof marked === "function") return marked(raw);
    return simpleMarkdownToHtml(raw);
  }

  function setBodyHtml(bodyEl, md) {
    if (!bodyEl) return;
    var html = parseMarkdown(md);
    if (html !== null) {
      bodyEl.innerHTML = html;
    } else {
      bodyEl.textContent = md || "";
    }
  }

  function renderDoc(id) {
    var item = docItems[id];
    if (!item) return;
    var titleEl = document.getElementById("docsTitle");
    var descEl = document.getElementById("docsDesc");
    var bodyEl = document.getElementById("docsBody");
    var lang = (typeof window.ruyiaiLang !== "undefined" && window.ruyiaiLang === "en") ? "en" : "zh";
    var title = (lang === "en" && item.titleEn) ? item.titleEn : item.title;
    var desc = (lang === "en" && item.descEn) ? item.descEn : item.desc;
    if (item.bodyOnly) {
      if (titleEl) { titleEl.style.display = "none"; titleEl.textContent = ""; }
      if (descEl) { descEl.style.display = "none"; descEl.textContent = ""; }
    } else {
      if (titleEl) { titleEl.style.display = ""; titleEl.textContent = title; }
      if (descEl) { descEl.style.display = ""; descEl.textContent = desc; }
    }
    var mdInline = (lang === "en" && item.markdownEn != null) ? item.markdownEn : item.markdown;
    var mdUrl = item.markdownUrl || null;
    var mdUrlEn = null;
    if (mdUrl) {
      mdUrlEn = mdUrl.replace(/\.md$/, ".en.md");
    }

    if (mdInline != null && !mdUrl) {
      setBodyHtml(bodyEl, mdInline);
    } else if (mdUrl) {
      setBodyHtml(bodyEl, lang === "en" ? "Loading…" : "加载中…");
      var primaryUrl = (lang === "en" && mdUrlEn) ? mdUrlEn : mdUrl;
      var fallbackUrl = (lang === "en" && mdUrlEn) ? mdUrl : null;
      fetch(resolveDocUrl(primaryUrl), { cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(String(r.status))); })
        .then(function (md) {
          if (getDocIdFromHash() === id) setBodyHtml(bodyEl, md);
        })
        .catch(function () {
          if (fallbackUrl) {
            fetch(resolveDocUrl(fallbackUrl), { cache: "no-store" })
              .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(String(r.status))); })
              .then(function (md) {
                if (getDocIdFromHash() === id) setBodyHtml(bodyEl, md);
              })
              .catch(function () {
                var msg = lang === "en"
                  ? "Unable to load document. Please access via HTTP or the deployed site."
                  : "无法加载文档。请通过 HTTP 访问本页（如本地运行 <code>python3 -m http.server</code> 后打开）或访问已部署的网站。";
                if (getDocIdFromHash() === id) setBodyHtml(bodyEl, "<p>" + msg + "</p>");
              });
          } else {
            var msg = lang === "en"
              ? "Unable to load document. Please access via HTTP or the deployed site."
              : "无法加载文档。请通过 HTTP 访问本页（如本地运行 <code>python3 -m http.server</code> 后打开）或访问已部署的网站。";
            if (getDocIdFromHash() === id) setBodyHtml(bodyEl, "<p>" + msg + "</p>");
          }
        });
    } else {
      setBodyHtml(bodyEl, "");
    }
    document.querySelectorAll(".docs-nav__item[data-doc]").forEach(function (a) {
      a.classList.toggle("docs-nav__item--active", a.getAttribute("data-doc") === id);
    });
    document.querySelectorAll(".docs-nav__child").forEach(function (a) {
      a.classList.toggle("docs-nav__child--active", a.getAttribute("data-doc") === id);
    });
    if (id === "contributor-guide" || id === "code-style" || id === "git-workflow") {
      var contributorBtn = document.getElementById("docsNavContributor");
      var contributorGroup = contributorBtn ? contributorBtn.closest(".docs-nav__group") : null;
      if (contributorGroup && contributorBtn) {
        contributorGroup.classList.add("docs-nav__group--open");
        contributorBtn.setAttribute("aria-expanded", "true");
      }
    }
    if (id === "compiler" || id === "rvv-environment" || id === "ime-dialect" || id === "gemmini" || id === "adding-operators" || id === "convolution-vectorization") {
      var compilerBtn = document.getElementById("docsNavCompiler");
      var compilerGroup = compilerBtn ? compilerBtn.closest(".docs-nav__group") : null;
      if (compilerGroup && compilerBtn) {
        compilerGroup.classList.add("docs-nav__group--open");
        compilerBtn.setAttribute("aria-expanded", "true");
      }
    }
    if (id === "operator-lang" || id === "triton-on-riscv" || id === "triton-riscv-overview" || id === "implementation" || id === "ir-output" || id === "debug") {
      var operatorLangBtn = document.getElementById("docsNavOperatorLang");
      var operatorLangGroup = operatorLangBtn ? operatorLangBtn.closest(".docs-nav__group") : null;
      if (operatorLangGroup && operatorLangBtn) {
        operatorLangGroup.classList.add("docs-nav__group--open");
        operatorLangBtn.setAttribute("aria-expanded", "true");
      }
    }
    if (id === "insights" || id === "C4ML2024") {
      var groups = document.querySelectorAll(".docs-nav__group");
      var insightsBtn = document.getElementById("docsNavInsights");
      var insightsGroup = insightsBtn ? insightsBtn.closest(".docs-nav__group") : null;
      if (insightsGroup && insightsBtn) {
        insightsGroup.classList.add("docs-nav__group--open");
        insightsBtn.setAttribute("aria-expanded", "true");
      }
    }
    window.location.hash = id;
  }

  function closeMobileNav() {
    var layout = document.getElementById("docsLayout");
    if (layout) layout.classList.remove("docs-nav-open");
  }

  function initNav() {
    var contributorBtn = document.getElementById("docsNavContributor");
    if (contributorBtn) {
      contributorBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var group = contributorBtn.closest(".docs-nav__group");
        if (group) {
          var open = group.classList.toggle("docs-nav__group--open");
          contributorBtn.setAttribute("aria-expanded", open);
        }
      });
    }
    var compilerBtn = document.getElementById("docsNavCompiler");
    if (compilerBtn) {
      compilerBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var group = compilerBtn.closest(".docs-nav__group");
        if (group) {
          var open = group.classList.toggle("docs-nav__group--open");
          compilerBtn.setAttribute("aria-expanded", open);
        }
      });
    }
    var operatorLangBtn = document.getElementById("docsNavOperatorLang");
    if (operatorLangBtn) {
      operatorLangBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var group = operatorLangBtn.closest(".docs-nav__group");
        if (group) {
          var open = group.classList.toggle("docs-nav__group--open");
          operatorLangBtn.setAttribute("aria-expanded", open);
        }
      });
    }
    var insightsBtn = document.getElementById("docsNavInsights");
    if (insightsBtn) {
      insightsBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var group = insightsBtn.closest(".docs-nav__group");
        if (group) {
          var open = group.classList.toggle("docs-nav__group--open");
          insightsBtn.setAttribute("aria-expanded", open);
        }
      });
    }
    var docsLayout = document.getElementById("docsLayout");
    var docsNavToggle = document.getElementById("docsNavToggle");
    var docsSidebarOverlay = document.getElementById("docsSidebarOverlay");
    if (docsNavToggle && docsLayout) {
      docsNavToggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        docsLayout.classList.toggle("docs-nav-open");
        if (docsSidebarOverlay) {
          docsSidebarOverlay.setAttribute("aria-hidden", docsLayout.classList.contains("docs-nav-open") ? "false" : "true");
        }
      });
    }
    if (docsSidebarOverlay && docsLayout) {
      docsSidebarOverlay.addEventListener("click", function () {
        docsLayout.classList.remove("docs-nav-open");
        docsSidebarOverlay.setAttribute("aria-hidden", "true");
      });
    }
    document.querySelectorAll(".docs-nav__child").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var id = a.getAttribute("data-doc");
        if (id) renderDoc(id);
        closeMobileNav();
      });
    });
    document.querySelectorAll(".docs-nav__item[data-doc]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var id = a.getAttribute("data-doc");
        if (id) renderDoc(id);
        closeMobileNav();
      });
    });
  }

  function initHash() {
    window.addEventListener("hashchange", function () {
      renderDoc(getDocIdFromHash());
    });
    window.addEventListener("languagechange", function () {
      renderDoc(getDocIdFromHash());
    });
    var id = getDocIdFromHash();
    renderDoc(id);
    window.addEventListener("load", function () {
      var idOnLoad = getDocIdFromHash();
      if (idOnLoad !== id) renderDoc(idOnLoad);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initNav();
      initHash();
    });
  } else {
    initNav();
    initHash();
  }
})();
