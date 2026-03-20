;(function () {
  var STORAGE_KEY = "ruyiai-lang";
  var LANG =
    localStorage.getItem(STORAGE_KEY) ||
    (navigator.language && navigator.language.startsWith("zh") ? "zh" : "en");

  var i18n = {
    zh: {
      "nav.home": "首页",
      "nav.projects": "项目",
      "nav.contribute": "贡献",
      "nav.docs": "文档",
      "nav.community": "社区",
      "nav.insights": "洞察",
      "nav.about": "关于",
      "nav.menu": "菜单",
      "nav.compiler": "Ruyi AI 编译器",
      "nav.compilerDesc": "基于 MLIR 桥接 PyTorch 和 RISC-V",
      "nav.operatorLang": "Ruyi AI 算子编程语言",
      "nav.operatorLangDesc": "面向 RISC-V 适配 Triton / TileLang",
      "nav.operatorLib": "Ruyi AI 算子库",
      "nav.operatorLibDesc": "面向 RISC-V 的原生高性能算子库",
      "nav.runtime": "Ruyi AI 运行时环境",
      "nav.runtimeDesc": "面向 RISC-V 各类扩展的统一运行时环境",
      "nav.langZh": "中文",
      "nav.langEn": "English",
      "doc.toc": "目录",
      "doc.search": "搜索文档",
      "doc.overview": "总览",
      "doc.install": "安装方式",
      "doc.tutorial": "使用教程",
      "doc.contributorGuide": "贡献者指引",
      "doc.codeStyle": "代码规范",
      "doc.gitWorkflow": "Git 开源工作流程",
      "doc.compiler": "Ruyi AI 编译器",
      "doc.rvvEnv": "RVV Environment",
      "doc.imeDialect": "IME Dialect",
      "doc.gemmini": "Gemmini",
      "doc.addPass": "Add Pass",
      "doc.convOpt": "卷积优化",
      "doc.buildMethods": "构建方法",
      "doc.dynamicVector": "动态向量表示",
      "doc.convOpt": "卷积优化",
      "doc.addingOperators": "增加算子支持",
      "doc.operatorLang": "Ruyi AI 算子编程语言",
      "doc.tritonOnRiscv": "Triton 的 RISC-V 适配",
      "doc.operatorLib": "Ruyi AI 算子库",
      "doc.runtime": "Ruyi AI 运行时环境",
      "doc.insights": "洞察",
      "doc.about": "关于",
      "hero.subtitle": "面向 RISC-V 架构的<br />人工智能系统软件栈",
      "hero.install": "立即安装",
      "hero.tutorial": "使用教程",
      "hero.overview": "项目架构",
      "footer.privacy": "Privacy",
      "footer.terms": "Terms"
    },
    en: {
      "nav.home": "Home",
      "nav.projects": "Projects",
      "nav.contribute": "Contribute",
      "nav.docs": "Docs",
      "nav.community": "Community",
      "nav.insights": "Insights",
      "nav.about": "About",
      "nav.menu": "Menu",
      "nav.compiler": "Ruyi AI Compiler",
      "nav.compilerDesc": "MLIR-based bridge between PyTorch and RISC-V",
      "nav.operatorLang": "Ruyi AI Operator Language",
      "nav.operatorLangDesc": "Triton / TileLang for RISC-V",
      "nav.operatorLib": "Ruyi AI Operator Library",
      "nav.operatorLibDesc": "Native high-performance operator library for RISC-V",
      "nav.runtime": "Ruyi AI Runtime",
      "nav.runtimeDesc": "Unified runtime for RISC-V extensions",
      "nav.langZh": "中文",
      "nav.langEn": "English",
      "doc.toc": "Table of contents",
      "doc.search": "Search docs",
      "doc.overview": "Overview",
      "doc.install": "Install",
      "doc.tutorial": "Tutorial",
      "doc.contributorGuide": "Contributor Guide",
      "doc.codeStyle": "Code Style",
      "doc.gitWorkflow": "Git Workflow",
      "doc.compiler": "Ruyi AI Compiler",
      "doc.rvvEnv": "RVV Environment",
      "doc.imeDialect": "IME Dialect",
      "doc.gemmini": "Gemmini",
      "doc.addPass": "Add Pass",
      "doc.convOpt": "Convolution Optimization",
      "doc.buildMethods": "Build Methods",
      "doc.dynamicVector": "Dynamic Vector Representation",
      "doc.convOpt": "Convolution Optimization",
      "doc.addingOperators": "Adding Operators",
      "doc.operatorLang": "Ruyi AI Operator Language",
      "doc.tritonOnRiscv": "Triton on RISC-V",
      "doc.operatorLib": "Ruyi AI Operator Library",
      "doc.runtime": "Ruyi AI Runtime",
      "doc.insights": "Insights",
      "doc.about": "About",
      "hero.subtitle": "AI System Software Stack<br />for RISC-V Architecture",
      "hero.install": "Get Started",
      "hero.tutorial": "Tutorial",
      "hero.overview": "Project Overview",
      "footer.privacy": "Privacy",
      "footer.terms": "Terms"
    }
  };

  function getText(key) {
    return (i18n[LANG] && i18n[LANG][key]) || i18n.zh[key] || key;
  }

  function applyLanguage() {
    document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var text = getText(key);
      if (text) {
        if (el.getAttribute("aria-label") !== null) {
          el.setAttribute("aria-label", text);
        } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      var html = getText(key);
      if (html) el.innerHTML = html;
    });

    var toggle = document.getElementById("navLangWrap");
    if (toggle) toggle.classList.toggle("lang-toggle--en", LANG === "en");

    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent("languagechange", { detail: { lang: LANG } })
      );
    }
  }

  function setLang(lang) {
    if (lang !== "zh" && lang !== "en") return;
    LANG = lang;
    window.ruyiaiLang = LANG;
    localStorage.setItem(STORAGE_KEY, LANG);
    applyLanguage();
  }

  function initSwitcher() {
    var actions = document.querySelector(".nav__actions");
    if (!actions) return;
    var existing = document.getElementById("navLangWrap");
    if (existing) return;

    var wrap = document.createElement("button");
    wrap.id = "navLangWrap";
    wrap.type = "button";
    wrap.className =
      "lang-toggle" + (LANG === "en" ? " lang-toggle--en" : "");
    wrap.setAttribute("aria-label", "Switch language");
    wrap.innerHTML =
      '<span class="lang-toggle__track">' +
      '<span class="lang-toggle__label lang-toggle__label--zh">中</span>' +
      '<span class="lang-toggle__label lang-toggle__label--en">En</span>' +
      '<span class="lang-toggle__thumb"></span>' +
      "</span>";
    wrap.addEventListener("click", function () {
      var next = LANG === "zh" ? "en" : "zh";
      setLang(next);
      wrap.classList.toggle("lang-toggle--en", next === "en");
    });

    actions.insertBefore(wrap, actions.firstChild);
    applyLanguage();
  }

  function run() {
    initSwitcher();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  window.ruyiaiLang = LANG;
  window.ruyiaiSetLang = setLang;
  window.ruyiaiGetText = getText;
})();
