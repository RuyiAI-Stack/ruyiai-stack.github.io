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
      markdownUrl: "docs/code-style.md"
    },
    compiler: {
      title: "Ruyi AI 编译器",
      desc: "基于 MLIR 桥接 PyTorch 和 RISC-V",
      markdown: "欢迎查阅 Ruyi AI 编译器文档。\n\n（待补充TBD）"
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
    about: {
      title: "关于",
      desc: "了解 Ruyi AI 的愿景与团队",
      markdown: "欢迎了解 Ruyi AI。\n\n（待补充TBD）"
    }
  };

  var defaultDocId = "overview";

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
    if (titleEl) titleEl.textContent = item.title;
    if (descEl) descEl.textContent = item.desc;
    if (item.markdown != null && !item.markdownUrl) {
      setBodyHtml(bodyEl, item.markdown);
    } else if (item.markdownUrl) {
      setBodyHtml(bodyEl, "加载中…");
      fetch(item.markdownUrl, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(r.status)); })
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
    if (id === "contributor-guide" || id === "code-style") {
      var group = document.querySelector(".docs-nav__group");
      var contributorBtn = document.getElementById("docsNavContributor");
      if (group && contributorBtn) {
        group.classList.add("docs-nav__group--open");
        contributorBtn.setAttribute("aria-expanded", "true");
      }
    }
    window.location.hash = id;
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
    document.querySelectorAll(".docs-nav__child").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var id = a.getAttribute("data-doc");
        if (id) renderDoc(id);
      });
    });
    document.querySelectorAll(".docs-nav__item[data-doc]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var id = a.getAttribute("data-doc");
        if (id) renderDoc(id);
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
