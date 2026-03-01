(function () {
  var docItems = {
    overview: {
      title: "总览",
      desc: "Ruyi AI 文档总览",
      markdown: "欢迎查阅 Ruyi AI 文档。\n\n（待补充TBD）"
    },
    install: {
      title: "安装方式",
      desc: "Ruyi AI 的安装与配置",
      markdown: "欢迎查阅 Ruyi AI 安装方式文档。\n\n（待补充TBD）"
    },
    tutorial: {
      title: "使用教程",
      desc: "Ruyi AI 使用教程与示例",
      markdown: "欢迎查阅 Ruyi AI 使用教程。\n\n（待补充TBD）"
    },
    "contributor-guide": {
      title: "贡献者指引",
      desc: "如何参与 Ruyi AI 项目贡献",
      markdown: "欢迎参与 Ruyi AI 贡献。\n\n（待补充TBD）"
    },
    "code-style": {
      title: "代码规范",
      desc: "Ruyi AI 项目代码规范与约定",
      markdownUrl: "docs/contributor-guide/code-style.md"
    },
    "git-workflow": {
      title: "Git 开源工作流程",
      desc: "RuyiAI 社区采用 Fork + Pull Request 的工作模式进行开源贡献。",
      markdownUrl: "docs/contributor-guide/git-workflow.md"
    },
    compiler: {
      title: "Ruyi AI 编译器",
      desc: "基于 MLIR 桥接 PyTorch 和 RISC-V",
      markdownUrl: "docs/compiler/compiler.md"
    },
    "rvv-environment": {
      title: "RVV Environment",
      desc: "MLIR 与 RVV 测试实验环境搭建指南",
      markdownUrl: "docs/compiler/RVVEnvironment.md"
    },
    gemmini: {
      title: "Gemmini",
      desc: "Gemmini 相关文档",
      markdownUrl: "docs/compiler/Gemmini.md"
    },
    "operator-lang": {
      title: "Ruyi AI 算子编程语言",
      desc: "面向 RISC-V 适配 Triton / TileLang",
      markdown: "欢迎查阅 Ruyi AI 算子编程语言文档。\n\n（待补充TBD）"
    },
    "operator-lib": {
      title: "Ruyi AI 算子库",
      desc: "面向 RISC-V 的原生高性能算子库",
      markdown: "欢迎查阅 Ruyi AI 算子库文档。\n\n（待补充TBD）"
    },
    runtime: {
      title: "Ruyi AI 运行时环境",
      desc: "面向 RISC-V 各类扩展的统一运行时环境",
      markdown: "欢迎查阅 Ruyi AI 运行时环境文档。\n\n（待补充TBD）"
    },
    insights: {
      title: "洞察",
      desc: "了解 Ruyi AI 的愿景与团队",
      markdown: "欢迎了解 Ruyi AI 洞察与分享。\n\n（待补充TBD）"
    },
    C4ML2024: {
      title: "C4ML2024",
      desc: "Buddy Compiler at C4ML 2024",
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
    return docItems[hash] ? hash : defaultDocId;
  }

  function parseMarkdown(md) {
    if (typeof marked === "undefined") return null;
    var raw = (md || "").trim();
    if (!raw) return "";
    if (typeof marked.parse === "function") return marked.parse(raw);
    if (typeof marked === "function") return marked(raw);
    return null;
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
    if (item.bodyOnly) {
      if (titleEl) { titleEl.style.display = "none"; titleEl.textContent = ""; }
      if (descEl) { descEl.style.display = "none"; descEl.textContent = ""; }
    } else {
      if (titleEl) { titleEl.style.display = ""; titleEl.textContent = item.title; }
      if (descEl) { descEl.style.display = ""; descEl.textContent = item.desc; }
    }
    if (item.markdown != null && !item.markdownUrl) {
      setBodyHtml(bodyEl, item.markdown);
    } else if (item.markdownUrl) {
      setBodyHtml(bodyEl, "加载中…");
      var docUrl = resolveDocUrl(item.markdownUrl);
      fetch(docUrl, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(String(r.status))); })
        .then(function (md) {
          if (getDocIdFromHash() === id) setBodyHtml(bodyEl, md);
        })
        .catch(function () {
          var msg = "无法加载文档。请通过 HTTP 访问本页（如本地运行 <code>python3 -m http.server</code> 后打开）或访问已部署的网站。";
          if (getDocIdFromHash() === id) setBodyHtml(bodyEl, "<p>" + msg + "</p>");
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
    if (id === "compiler" || id === "rvv-environment" || id === "gemmini") {
      var compilerBtn = document.getElementById("docsNavCompiler");
      var compilerGroup = compilerBtn ? compilerBtn.closest(".docs-nav__group") : null;
      if (compilerGroup && compilerBtn) {
        compilerGroup.classList.add("docs-nav__group--open");
        compilerBtn.setAttribute("aria-expanded", "true");
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
    renderDoc(getDocIdFromHash());
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
