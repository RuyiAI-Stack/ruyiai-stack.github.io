(function () {
  var docItems = {
    overview: {
      title: "总览",
      titleEn: "Overview",
      desc: "RuyiAI 文档总览",
      descEn: "RuyiAI documentation overview",
      markdownUrl: "docs/overview/overview.md",
      bodyOnly: true
    },
    install: {
      title: "安装方式",
      titleEn: "Install",
      desc: "RuyiAI 的安装与配置",
      descEn: "Installation and configuration",
      markdownUrl: "docs/install/install.md"
    },
    tutorial: {
      title: "使用教程",
      titleEn: "Tutorial",
      desc: "RuyiAI 使用教程与示例",
      descEn: "Tutorial and examples",
      markdownUrl: "docs/tutorial/tutorial.md",
      bodyOnly: true
    },
    "contributor-guide": {
      title: "贡献者指引",
      titleEn: "Contributor Guide",
      desc: "如何参与 RuyiAI 项目贡献",
      descEn: "How to contribute to RuyiAI",
      markdownUrl: "docs/contributor-guide/contributor-guide.md",
      useFirstHeadingAsTitle: true
    },
    "code-style": {
      title: "代码规范",
      titleEn: "Code Style",
      desc: "RuyiAI 项目代码规范与约定",
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
      title: "RuyiAI 编译器",
      titleEn: "RuyiAI Compiler",
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
      desc: "",
      descEn: "",
      markdownUrl: "docs/about/about.md",
      useFirstHeadingAsTitle: true,
      bodyOnly: true
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
      markdownUrl: "docs/compiler/DynamicVector.md",
      bodyOnly: true
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
      markdownUrl: "docs/compiler/ConvolutionVectorization.md",
      bodyOnly: true
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
      title: "RuyiAI 算子编程语言",
      titleEn: "RuyiAI Operator Language",
      desc: "面向 RISC-V 适配 Triton / TileLang",
      descEn: "Triton / TileLang for RISC-V",
      markdownUrl: "docs/operator-lang/operator-lang.md",
      bodyOnly: true
    },
    "operator-lib": {
      title: "RuyiAI 算子库",
      titleEn: "RuyiAI Operator Library",
      desc: "面向 RISC-V 的原生高性能算子库",
      descEn: "Native high-performance operator library for RISC-V",
      markdownUrl: "docs/operator-lib/operator-lib.md",
      bodyOnly: true
    },
    runtime: {
      title: "RuyiAI 运行时环境",
      titleEn: "RuyiAI Runtime",
      desc: "面向 RISC-V 各类扩展的统一运行时环境",
      descEn: "Unified runtime for RISC-V extensions",
      markdown: "欢迎查阅 RuyiAI 运行时环境文档。\n\n（待补充 TBD）",
      markdownEn: "Welcome to RuyiAI Runtime documentation.\n\n(TBD)"
    },
    insights: {
      title: "洞察",
      titleEn: "Insights",
      desc: "了解 RuyiAI 的愿景与团队",
      descEn: "RuyiAI insights and team",
      markdownUrl: "docs/insights/insights.md",
      bodyOnly: true
    },
    C4ML2024: {
      title: "C4ML2024",
      titleEn: "C4ML2024",
      desc: "Buddy Compiler at C4ML 2024",
      descEn: "Buddy Compiler at C4ML 2024",
      markdownUrl: "docs/insights/C4ML2024.md",
      bodyOnly: true
    },
    EuroLLVM2023: {
      title: "EuroLLVM2023",
      titleEn: "EuroLLVM2023",
      desc: "EuroLLVM 2023 演讲视频",
      descEn: "EuroLLVM 2023 talk video",
      markdownUrl: "docs/insights/EuroLLVM2023.md",
      bodyOnly: true
    },
    "RISC-V-EU-2026": {
      title: "RISC-V Summit Europe 2026",
      titleEn: "RISC-V Summit Europe 2026",
      desc: "RISC-V Summit Europe 2026 演示材料",
      descEn: "RISC-V Summit Europe 2026 presentation materials",
      markdownUrl: "docs/insights/RISC-V-EU-2026.md",
      bodyOnly: true
    },
    RuyiAI2026: {
      title: "RuyiAI2026",
      titleEn: "RuyiAI2026",
      desc: "RuyiAI：面向 RISC-V 架构的人工智能系统软件栈",
      descEn: "RuyiAI: AI System Software Stack for RISC-V Architecture",
      markdownUrl: "docs/insights/RuyiAI2026.md",
      bodyOnly: true
    }
  };

  var defaultDocId = "overview";
  var searchState = {
    indexByLang: { zh: null, en: null },
    buildingByLang: { zh: null, en: null }
  };

  var inPageTocScrollCleanup = null;

  /** 解析文档 URL：相对路径以当前页面地址为基准，与 fetch 默认行为一致 */
  function resolveDocUrl(relativePath) {
    try {
      return new URL(relativePath, window.location.href).href;
    } catch (e) {
      return relativePath;
    }
  }

  function getEnglishDocUrlCandidates(mdUrl) {
    if (!mdUrl || !/\.md$/i.test(mdUrl)) return [];
    var a = mdUrl.replace(/\.md$/i, ".en.md");
    var b = mdUrl.replace(/\.md$/i, "-en.md");
    return a === b ? [a] : [a, b];
  }

  function getDocIdFromHash() {
    var hash = window.location.hash.slice(1);
    if (!hash && window.location.href.indexOf("#") !== -1) {
      var parts = window.location.href.split("#");
      hash = (parts[1] || "").split("?")[0];
    }
    return docItems[hash] ? hash : defaultDocId;
  }

  function getCurrentLang() {
    return (typeof window.ruyiaiLang !== "undefined" && window.ruyiaiLang === "en") ? "en" : "zh";
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
    refreshInPageToc();
  }

  function promoteBodyHeadingToPageTitle(item, titleEl, bodyEl) {
    if (!item || !item.useFirstHeadingAsTitle || !titleEl || !bodyEl) return;
    var heading = bodyEl.querySelector("h1, h2, h3, h4, h5, h6");
    if (!heading) return;
    var text = (heading.textContent || "").trim();
    if (!text) return;
    titleEl.textContent = text;
    heading.remove();
    refreshInPageToc();
  }

  function slugifyHeadingId(text) {
    var s = String(text || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\u4e00-\u9fff_-]+/g, "");
    if (!s) s = "section";
    if (s.length > 80) s = s.slice(0, 80);
    return s;
  }

  function ensureHeadingIds(bodyEl) {
    if (!bodyEl) return;
    var used = {};
    var headings = bodyEl.querySelectorAll("h1, h2, h3, h4, h5, h6");
    for (var i = 0; i < headings.length; i += 1) {
      var h = headings[i];
      if (h.id) {
        used[h.id] = true;
        continue;
      }
      var base = slugifyHeadingId(h.textContent || "");
      var id = base;
      var n = 0;
      while (used[id] || document.getElementById(id)) {
        n += 1;
        id = base + "-" + n;
      }
      used[id] = true;
      h.id = id;
    }
  }

  function scrollToDocHeading(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pruneEmptyTocLists(ul) {
    Array.prototype.forEach.call(ul.children, function (li) {
      var nested = null;
      for (var j = 0; j < li.children.length; j += 1) {
        if (li.children[j].tagName === "UL") {
          nested = li.children[j];
          break;
        }
      }
      if (nested) {
        pruneEmptyTocLists(nested);
        if (!nested.children.length) nested.remove();
      }
    });
  }

  function refreshInPageToc() {
    var bodyEl = document.getElementById("docsBody");
    var tocAside = document.getElementById("docsToc");
    var tocNav = document.getElementById("docsTocNav");
    if (!bodyEl || !tocAside || !tocNav) return;

    if (typeof window.ruyiaiGetText === "function") {
      tocAside.setAttribute("aria-label", window.ruyiaiGetText("doc.onThisPage"));
    }

    if (inPageTocScrollCleanup) {
      inPageTocScrollCleanup();
      inPageTocScrollCleanup = null;
    }

    ensureHeadingIds(bodyEl);
    var headings = Array.prototype.slice.call(bodyEl.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    if (!headings.length) {
      tocNav.innerHTML = "";
      tocAside.hidden = true;
      return;
    }

    var rootUl = document.createElement("ul");
    rootUl.className = "docs-toc__list";
    var stack = [{ level: 0, ul: rootUl }];

    headings.forEach(function (h) {
      var level = parseInt(h.tagName.slice(1), 10);
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      var parentUl = stack[stack.length - 1].ul;
      var li = document.createElement("li");
      li.className = "docs-toc__item";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "docs-toc__link docs-toc__link--depth-" + level;
      btn.textContent = (h.textContent || "").trim();
      btn.setAttribute("data-toc-target", h.id);
      (function (hid) {
        btn.addEventListener("click", function () {
          scrollToDocHeading(hid);
        });
      })(h.id);
      li.appendChild(btn);
      parentUl.appendChild(li);
      var subUl = document.createElement("ul");
      subUl.className = "docs-toc__list docs-toc__list--nested";
      li.appendChild(subUl);
      stack.push({ level: level, ul: subUl });
    });

    pruneEmptyTocLists(rootUl);
    tocNav.innerHTML = "";
    tocNav.appendChild(rootUl);
    tocAside.hidden = false;

    var links = tocNav.querySelectorAll("button.docs-toc__link");
    var offset = 88;
    function updateActiveHeading() {
      var activeId = null;
      for (var i = headings.length - 1; i >= 0; i -= 1) {
        var top = headings[i].getBoundingClientRect().top;
        if (top <= offset) {
          activeId = headings[i].id;
          break;
        }
      }
      if (!activeId && headings.length) activeId = headings[0].id;
      links.forEach(function (a) {
        a.classList.toggle("docs-toc__link--active", a.getAttribute("data-toc-target") === activeId);
      });
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateActiveHeading();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateActiveHeading();
    inPageTocScrollCleanup = function () {
      window.removeEventListener("scroll", onScroll);
    };
  }

  function stripMarkdownForSearch(md) {
    var text = String(md || "");
    text = text.replace(/```[\s\S]*?```/g, " ");
    text = text.replace(/`([^`]+)`/g, " $1 ");
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, " $1 ");
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, " $1 ");
    text = text.replace(/<[^>]+>/g, " ");
    text = text.replace(/^#{1,6}\s+/gm, "");
    text = text.replace(/^\s*>\s?/gm, "");
    text = text.replace(/^\s*[-*+]\s+/gm, "");
    text = text.replace(/^\s*\d+\.\s+/gm, "");
    text = text.replace(/\|/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    return text;
  }

  function resolveDocMarkdown(item, lang) {
    var inline = (lang === "en" && item.markdownEn != null) ? item.markdownEn : item.markdown;
    if (inline != null && !item.markdownUrl) {
      return Promise.resolve(inline);
    }
    if (!item.markdownUrl) {
      return Promise.resolve("");
    }
    var mdUrl = item.markdownUrl;
    var candidates = (lang === "en") ? getEnglishDocUrlCandidates(mdUrl).concat([mdUrl]) : [mdUrl];
    function tryFetchAt(idx) {
      if (idx >= candidates.length) return Promise.resolve("");
      return fetch(resolveDocUrl(candidates[idx]), { cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(String(r.status))); })
        .catch(function () { return tryFetchAt(idx + 1); });
    }
    return tryFetchAt(0);
  }

  function buildSearchIndex(lang) {
    if (searchState.indexByLang[lang]) {
      return Promise.resolve(searchState.indexByLang[lang]);
    }
    if (searchState.buildingByLang[lang]) {
      return searchState.buildingByLang[lang];
    }
    var ids = Object.keys(docItems);
    searchState.buildingByLang[lang] = Promise.all(ids.map(function (id) {
      var item = docItems[id];
      var title = (lang === "en" && item.titleEn) ? item.titleEn : item.title;
      var desc = (lang === "en" && item.descEn) ? item.descEn : item.desc;
      return resolveDocMarkdown(item, lang).then(function (md) {
        var body = stripMarkdownForSearch(md);
        var plain = [title || "", desc || "", body || ""].join(" ").trim();
        return {
          id: id,
          title: title || "",
          desc: desc || "",
          body: body || "",
          plain: plain,
          plainLower: plain.toLowerCase()
        };
      });
    })).then(function (entries) {
      searchState.indexByLang[lang] = entries;
      searchState.buildingByLang[lang] = null;
      return entries;
    }).catch(function () {
      searchState.buildingByLang[lang] = null;
      return [];
    });
    return searchState.buildingByLang[lang];
  }

  function containsAllTerms(textLower, terms) {
    for (var i = 0; i < terms.length; i += 1) {
      if (textLower.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  function extractSnippet(entry, query) {
    var q = String(query || "").trim().toLowerCase();
    var source = entry.body || entry.desc || "";
    if (!source) return "";
    if (!q) return source.slice(0, 120);
    var lower = source.toLowerCase();
    var idx = lower.indexOf(q);
    if (idx === -1) return source.slice(0, 120);
    var start = Math.max(0, idx - 24);
    var end = Math.min(source.length, idx + q.length + 48);
    var prefix = start > 0 ? "..." : "";
    var suffix = end < source.length ? "..." : "";
    return prefix + source.slice(start, end) + suffix;
  }

  function searchDocs(entries, query, limit) {
    var q = String(query || "").trim();
    if (!q) return [];
    var qLower = q.toLowerCase();
    var terms = qLower.split(/\s+/).filter(function (t) { return !!t; });
    if (!terms.length) return [];
    var ranked = entries.map(function (entry) {
      var titleLower = (entry.title || "").toLowerCase();
      var plainLower = entry.plainLower || "";
      var titleMatched = containsAllTerms(titleLower, terms);
      var plainMatched = containsAllTerms(plainLower, terms);
      if (!titleMatched && !plainMatched) return { entry: entry, score: -1 };

      // Ranking: title hits first, then earlier exact position in full text.
      var score = 0;
      if (titleMatched) score += 2000;
      var firstIdx = plainLower.indexOf(qLower);
      if (firstIdx !== -1) {
        score += 1200 - Math.min(firstIdx, 1000);
      } else {
        // Multi-term query: favor entries where terms appear earlier overall.
        var posSum = 0;
        for (var i = 0; i < terms.length; i += 1) {
          var p = plainLower.indexOf(terms[i]);
          posSum += (p === -1 ? 1000 : Math.min(p, 1000));
        }
        score += 600 - Math.min(posSum, 550);
      }
      return { entry: entry, score: score };
    }).filter(function (r) { return r.score >= 0; });
    ranked.sort(function (a, b) { return b.score - a.score; });
    return ranked.slice(0, limit || 8).map(function (r) {
      return {
        id: r.entry.id,
        title: r.entry.title,
        snippet: extractSnippet(r.entry, q)
      };
    });
  }

  function escapeRegExp(text) {
    return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlightText(text, query) {
    var t = String(text || "");
    var q = String(query || "").trim();
    if (!q) return escapeHtml(t);
    var safe = escapeHtml(t);
    var re = new RegExp("(" + escapeRegExp(q) + ")", "ig");
    return safe.replace(re, '<mark class="docs-search__hl">$1</mark>');
  }

  function initSearch() {
    var input = document.getElementById("docsSearchInput");
    if (!input) return;
    var container = input.closest(".docs-search");
    if (!container) return;

    var panel = document.createElement("div");
    panel.className = "docs-search__results";
    panel.style.display = "none";
    container.appendChild(panel);
    var selectedIndex = -1;

    function hideResults() {
      panel.style.display = "none";
      panel.innerHTML = "";
      selectedIndex = -1;
    }

    function setActiveItem(index) {
      var nodes = panel.querySelectorAll(".docs-search__item");
      nodes.forEach(function (n, i) {
        n.classList.toggle("docs-search__item--active", i === index);
      });
    }

    function renderResults(items, lang, query) {
      selectedIndex = -1;
      if (!items.length) {
        panel.innerHTML = '<div class="docs-search__empty">' + (lang === "en" ? "No matching documents" : "未找到匹配文档") + "</div>";
        panel.style.display = "block";
        return;
      }
      panel.innerHTML = items.map(function (item) {
        return (
          '<button type="button" class="docs-search__item" data-doc="' + item.id + '">' +
            '<span class="docs-search__item-title">' + highlightText(item.title, query) + "</span>" +
            '<span class="docs-search__item-snippet">' + highlightText(item.snippet, query) + "</span>" +
          "</button>"
        );
      }).join("");
      panel.style.display = "block";
      var btns = panel.querySelectorAll(".docs-search__item");
      btns.forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-doc");
          if (id) renderDoc(id);
          hideResults();
          closeMobileNav();
        });
        btn.addEventListener("mouseenter", function () {
          selectedIndex = idx;
          setActiveItem(selectedIndex);
        });
      });
    }

    function runSearch() {
      var query = input.value || "";
      var lang = getCurrentLang();
      if (!query.trim()) {
        hideResults();
        return;
      }
      buildSearchIndex(lang).then(function (entries) {
        if ((input.value || "").trim() !== query.trim()) return;
        var items = searchDocs(entries, query, 8);
        renderResults(items, lang, query);
      });
    }

    var timer = null;
    input.addEventListener("input", function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(runSearch, 120);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        hideResults();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        var nodes = panel.querySelectorAll(".docs-search__item");
        if (!nodes.length) return;
        e.preventDefault();
        if (e.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1 + nodes.length) % nodes.length;
        } else {
          selectedIndex = (selectedIndex - 1 + nodes.length) % nodes.length;
        }
        setActiveItem(selectedIndex);
        if (nodes[selectedIndex] && typeof nodes[selectedIndex].scrollIntoView === "function") {
          nodes[selectedIndex].scrollIntoView({ block: "nearest" });
        }
        return;
      }
      if (e.key === "Enter") {
        var items = panel.querySelectorAll(".docs-search__item");
        if (!items.length) return;
        e.preventDefault();
        if (selectedIndex < 0) selectedIndex = 0;
        if (items[selectedIndex]) items[selectedIndex].click();
      }
    });
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) hideResults();
    });
    window.addEventListener("languagechange", function () {
      searchState.indexByLang.zh = null;
      searchState.indexByLang.en = null;
      if ((input.value || "").trim()) runSearch();
    });
  }

  var contributorsState = { data: null, promise: null };

  var CONTRIBUTOR_REPOS = [
    "buddy-compiler/buddy-mlir",
    "RuyiAI-Stack/ruyiai-stack.github.io",
    "RuyiAI-Stack/triton-riscv",
    "RuyiAI-Stack/tilelang-riscv",
    "RuyiAI-Stack/pytorch",
    "RuyiAI-Stack/llvm-project"
  ];

  var CONTRIBUTORS_JSON_URL = "./assets/contributors.json";

  function normalizeContributorUser(user) {
    if (!user || !user.login) return null;
    return {
      login: user.login,
      id: user.id,
      avatar_url: user.avatar_url,
      html_url: user.html_url || "https://github.com/" + user.login
    };
  }

  function fetchRepoMeta(repo) {
    return fetch("https://api.github.com/repos/" + repo, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) {
        if (r.status === 403) return Promise.reject(new Error("rate_limit"));
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      });
  }

  function fetchStandardContributorsForRepo(repo) {
    var all = [];
    function fetchPage(page) {
      return fetch("https://api.github.com/repos/" + repo + "/contributors?per_page=100&anon=1&page=" + page)
        .then(function (r) {
          if (r.status === 403) return Promise.reject(new Error("rate_limit"));
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .then(function (list) {
          if (!Array.isArray(list)) throw new Error("invalid_response");
          if (!list.length) return all;
          all = all.concat(list);
          if (list.length < 100) return all;
          return fetchPage(page + 1);
        });
    }
    return fetchPage(1).then(function (list) {
      return list.map(normalizeContributorUser).filter(Boolean);
    });
  }

  /** fork 仓库：compare 上游与 fork 默认分支，仅统计新增提交作者 */
  function fetchForkContributorsForRepo(repo, meta) {
    var parent = meta.parent;
    if (!parent || !parent.owner) return Promise.resolve([]);
    var parentOwner = parent.owner.login;
    var parentBranch = parent.default_branch || "main";
    var forkBranch = meta.default_branch || "main";
    var contributors = new Map();

    function addFromCommits(commits) {
      commits.forEach(function (commit) {
        [commit.author, commit.committer].forEach(function (user) {
          var c = normalizeContributorUser(user);
          if (!c) return;
          var key = contributorKey(c);
          if (!contributors.has(key)) contributors.set(key, c);
        });
      });
    }

    function comparePage(basehead) {
      return fetch("https://api.github.com/repos/" + repo + "/compare/" + basehead, {
        headers: { Accept: "application/vnd.github+json" }
      })
        .then(function (r) {
          if (r.status === 403) return Promise.reject(new Error("rate_limit"));
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .then(function (data) {
          var commits = data.commits || [];
          addFromCommits(commits);
          if (data.total_commits > commits.length && commits.length > 0) {
            var lastSha = commits[commits.length - 1].sha;
            return comparePage(lastSha + "..." + forkBranch);
          }
          return Array.from(contributors.values());
        });
    }

    return comparePage(parentOwner + ":" + parentBranch + "..." + forkBranch);
  }

  function fetchContributorsForRepo(repo) {
    return fetchRepoMeta(repo).then(function (meta) {
      if (meta.fork && meta.parent) {
        return fetchForkContributorsForRepo(repo, meta);
      }
      return fetchStandardContributorsForRepo(repo);
    });
  }

  function fetchAllContributorsForRepo(repo) {
    return fetchContributorsForRepo(repo);
  }

  function contributorKey(c) {
    if (c.login) return "login:" + String(c.login).toLowerCase();
    if (c.id != null) return "id:" + c.id;
    return "anon:" + (c.avatar_url || "");
  }

  /** 按仓库顺序合并贡献者，login/id 去重，保留首次出现顺序 */
  function mergeContributorsDedup(repoLists) {
    var seen = {};
    var merged = [];
    repoLists.forEach(function (list) {
      (list || []).forEach(function (c) {
        var key = contributorKey(c);
        if (seen[key]) return;
        seen[key] = true;
        merged.push(c);
      });
    });
    return merged;
  }

  function loadContributorsFromStaticJson() {
    return fetch(resolveDocUrl(CONTRIBUTORS_JSON_URL), { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(function (payload) {
        if (payload && Array.isArray(payload.contributors)) return payload.contributors;
        if (Array.isArray(payload)) return payload;
        throw new Error("invalid_json");
      });
  }

  /** 逐仓库拉取，单个失败不影响其余仓库 */
  function fetchMergedContributorsFromApi(repos) {
    function fetchRepoAt(idx, acc) {
      if (idx >= repos.length) return Promise.resolve(acc);
      return fetchAllContributorsForRepo(repos[idx])
        .then(function (list) {
          acc.push(list);
          return fetchRepoAt(idx + 1, acc);
        })
        .catch(function () {
          acc.push([]);
          return fetchRepoAt(idx + 1, acc);
        });
    }
    return fetchRepoAt(0, []).then(function (repoLists) {
      var merged = mergeContributorsDedup(repoLists);
      if (!merged.length) {
        return Promise.reject(new Error("all_failed"));
      }
      return merged;
    });
  }

  function fetchMergedContributors(repos) {
    if (contributorsState.data) {
      return Promise.resolve(contributorsState.data);
    }
    if (contributorsState.promise) {
      return contributorsState.promise;
    }
    contributorsState.promise = loadContributorsFromStaticJson()
      .catch(function () {
        return fetchMergedContributorsFromApi(repos);
      })
      .then(function (merged) {
        contributorsState.data = merged;
        contributorsState.promise = null;
        return merged;
      })
      .catch(function (err) {
        contributorsState.promise = null;
        throw err;
      });
    return contributorsState.promise;
  }

  function contributorStatsText(count, lang) {
    if (lang === "en") {
      return "Nothing, not even mountains and seas, can separate people with common goals and ideals. Let's build something meaningful together. Thank you to our " + count + " contributor" + (count === 1 ? "" : "s") + ":";
    }
    return "志合者，不以山海为远。让我们一起做出有意思的事情，感谢 " + count + " 位贡献者：";
  }

  function renderBuddyContributorsGrid(container, contributors) {
    if (!container) return;
    var lang = getCurrentLang();
    var count = contributors ? contributors.length : 0;
    if (!count) {
      container.innerHTML = '<p class="buddy-contributors__status">' +
        (lang === "en" ? "No contributor data available." : "暂无贡献者数据。") +
        "</p>";
      return;
    }
    var html = '<p class="buddy-contributors__summary">' + contributorStatsText(count, lang) + "</p>";
    html += '<div class="buddy-contributors__grid">';
    contributors.forEach(function (c) {
      var login = c.login;
      var profileUrl = c.html_url || (login ? "https://github.com/" + login : "");
      var avatarUrl = c.avatar_url || "";
      var alt = login || "Anonymous contributor";
      if (profileUrl) {
        html += '<a class="buddy-contributors__link" href="' + escapeHtml(profileUrl) + '" target="_blank" rel="noopener noreferrer" title="' + escapeHtml(login || alt) + '">';
        html += '<img class="buddy-contributors__avatar" src="' + escapeHtml(avatarUrl) + '" alt="' + escapeHtml(alt) + '" width="64" height="64" loading="lazy" />';
        html += "</a>";
      } else {
        html += '<span class="buddy-contributors__anon" title="Anonymous contributor">';
        html += '<img class="buddy-contributors__avatar" src="' + escapeHtml(avatarUrl) + '" alt="' + escapeHtml(alt) + '" width="64" height="64" loading="lazy" />';
        html += "</span>";
      }
    });
    html += "</div>";
    container.innerHTML = html;
  }

  function loadBuddyContributors(bodyEl) {
    var container = bodyEl ? bodyEl.querySelector("#buddyContributors") : null;
    if (!container) return;
    var lang = getCurrentLang();
    container.innerHTML = '<p class="buddy-contributors__status">' + (lang === "en" ? "Loading contributors…" : "加载贡献者中…") + "</p>";
    fetchMergedContributors(CONTRIBUTOR_REPOS)
      .then(function (contributors) {
        if (!bodyEl.querySelector("#buddyContributors")) return;
        renderBuddyContributorsGrid(container, contributors);
        refreshInPageToc();
      })
      .catch(function () {
        if (!bodyEl.querySelector("#buddyContributors")) return;
        container.innerHTML = '<p class="buddy-contributors__status buddy-contributors__status--error">' +
          (lang === "en" ? "Unable to load contributors. Please try again later." : "无法加载贡献者列表，请稍后重试。") +
          "</p>";
      });
  }

  function afterDocBodyRendered(id, bodyEl) {
    if (id === "about") loadBuddyContributors(bodyEl);
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
      if (descEl) {
        var hasDesc = !!(desc && String(desc).trim());
        descEl.style.display = hasDesc ? "" : "none";
        descEl.textContent = hasDesc ? desc : "";
      }
    }
    var mdInline = (lang === "en" && item.markdownEn != null) ? item.markdownEn : item.markdown;
    var mdUrl = item.markdownUrl || null;
    if (mdInline != null && !mdUrl) {
      setBodyHtml(bodyEl, mdInline);
      promoteBodyHeadingToPageTitle(item, titleEl, bodyEl);
      afterDocBodyRendered(id, bodyEl);
    } else if (mdUrl) {
      setBodyHtml(bodyEl, lang === "en" ? "Loading…" : "加载中…");
      var candidates = (lang === "en") ? getEnglishDocUrlCandidates(mdUrl).concat([mdUrl]) : [mdUrl];
      function tryFetchAt(idx) {
        if (idx >= candidates.length) return Promise.reject(new Error("all_failed"));
        return fetch(resolveDocUrl(candidates[idx]), { cache: "no-store" })
          .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(String(r.status))); })
          .catch(function () { return tryFetchAt(idx + 1); });
      }
      tryFetchAt(0)
        .then(function (md) {
          if (getDocIdFromHash() === id) {
            setBodyHtml(bodyEl, md);
            promoteBodyHeadingToPageTitle(item, titleEl, bodyEl);
            afterDocBodyRendered(id, bodyEl);
          }
        })
        .catch(function () {
          var msg = lang === "en"
            ? "Unable to load document. Please access via HTTP or the deployed site."
            : "无法加载文档。请通过 HTTP 访问本页（如本地运行 <code>python3 -m http.server</code> 后打开）或访问已部署的网站。";
          if (getDocIdFromHash() === id) {
            setBodyHtml(bodyEl, "<p>" + msg + "</p>");
            afterDocBodyRendered(id, bodyEl);
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
    closeAllDocsNavGroups();
    if (id === "contributor-guide" || id === "code-style" || id === "git-workflow") {
      var contributorBtn = document.getElementById("docsNavContributor");
      var contributorGroup = contributorBtn ? contributorBtn.closest(".docs-nav__group") : null;
      if (contributorGroup && contributorBtn) {
        contributorGroup.classList.add("docs-nav__group--open");
        contributorBtn.setAttribute("aria-expanded", "true");
      }
    }
    if (id === "compiler" || id === "rvv-environment" || id === "ime-dialect" || id === "gemmini" || id === "add-pass" || id === "build-methods" || id === "dynamic-vector" || id === "adding-operators" || id === "convolution-vectorization") {
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
    if (id === "insights" || id === "C4ML2024" || id === "EuroLLVM2023" || id === "RISC-V-EU-2026" || id === "RuyiAI2026") {
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

  /** 收起侧栏中所有可展开的一级菜单分组 */
  function closeAllDocsNavGroups() {
    document.querySelectorAll(".docs-nav .docs-nav__group").forEach(function (g) {
      g.classList.remove("docs-nav__group--open");
      var t = g.querySelector(".docs-nav__group-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }

  /** 手风琴：展开某一组前先收起其余分组；若该组已展开则整体收起 */
  function bindDocsNavGroupAccordion(btn) {
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var group = btn.closest(".docs-nav__group");
      if (!group) return;
      var wasOpen = group.classList.contains("docs-nav__group--open");
      closeAllDocsNavGroups();
      if (!wasOpen) {
        group.classList.add("docs-nav__group--open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  function initNav() {
    bindDocsNavGroupAccordion(document.getElementById("docsNavContributor"));
    bindDocsNavGroupAccordion(document.getElementById("docsNavCompiler"));
    bindDocsNavGroupAccordion(document.getElementById("docsNavOperatorLang"));
    bindDocsNavGroupAccordion(document.getElementById("docsNavInsights"));
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
      initSearch();
    });
  } else {
    initNav();
    initHash();
    initSearch();
  }
})();
