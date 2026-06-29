// Copy button
const copyBtn = document.getElementById("copyBtn");
const codeBlock = document.getElementById("codeBlock");
const year = document.getElementById("year");

if (year) year.textContent = String(new Date().getFullYear());

// Mobile nav: hamburger toggle
const navToggle = document.getElementById("navToggle");
const navInner = document.querySelector(".nav__inner");

function rectsOverlap(a, b, gap) {
  gap = gap == null ? 2 : gap;
  return a.right > b.left + gap && a.left < b.right - gap && a.bottom > b.top + gap && a.top < b.bottom - gap;
}

function detectNavBarOverlap(inner) {
  var menuWrap = inner.querySelector(".nav__menu-wrap");
  var links = menuWrap && menuWrap.querySelector(".nav__links");
  var actions = menuWrap && menuWrap.querySelector(".nav__actions");
  var brand = inner.querySelector(".brand");
  var toggle = inner.querySelector(".nav__toggle");
  if (!menuWrap || !links || !actions || !brand) return false;

  var toggleWidth = toggle ? toggle.getBoundingClientRect().width : 40;
  var reserved = brand.getBoundingClientRect().width + toggleWidth + 24;
  if (menuWrap.scrollWidth > inner.clientWidth - reserved + 1) return true;

  var linksRect = links.getBoundingClientRect();
  var actionsRect = actions.getBoundingClientRect();
  if (Math.abs(linksRect.top - actionsRect.top) < 8 && linksRect.right > actionsRect.left + 2) {
    return true;
  }

  var linkItems = links.querySelectorAll(":scope > a, :scope > .nav__dropdown");
  for (var i = 0; i < linkItems.length; i += 1) {
    var r1 = linkItems[i].getBoundingClientRect();
    if (r1.width < 1) continue;
    for (var j = i + 1; j < linkItems.length; j += 1) {
      var r2 = linkItems[j].getBoundingClientRect();
      if (r2.width < 1) continue;
      if (Math.abs(r1.top - r2.top) < 4 && r1.right > r2.left + 1) return true;
    }
    if (toggle && rectsOverlap(r1, toggle.getBoundingClientRect(), 0)) return true;
    if (rectsOverlap(r1, actionsRect, 0)) return true;
  }

  if (toggle && rectsOverlap(toggle.getBoundingClientRect(), actionsRect, 0)) return true;
  return false;
}

function updateNavCollapse() {
  if (!navInner) return;

  if (window.innerWidth <= 768) {
    navInner.classList.add("nav--collapsed");
    return;
  }

  navInner.classList.remove("nav--collapsed");
  navInner.classList.remove("nav--open");
  if (navToggle) navToggle.setAttribute("aria-expanded", "false");

  if (detectNavBarOverlap(navInner)) {
    navInner.classList.add("nav--collapsed");
  }
}

function initNavCollapse() {
  updateNavCollapse();
  var timer = null;
  function scheduleUpdate() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(updateNavCollapse, 80);
  }
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("languagechange", scheduleUpdate);
  window.addEventListener("load", updateNavCollapse);
  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(scheduleUpdate);
    ro.observe(navInner);
    var menuWrap = navInner.querySelector(".nav__menu-wrap");
    if (menuWrap) ro.observe(menuWrap);
  }
  scheduleUpdate();
}

if (navToggle && navInner) {
  navToggle.addEventListener("click", function () {
    var open = navInner.classList.toggle("nav--open");
    navToggle.setAttribute("aria-expanded", open);
  });
  // Close menu when clicking a link (for SPA-like close after navigate)
  var menuWrap = navInner.querySelector(".nav__menu-wrap");
  if (menuWrap) {
    menuWrap.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navInner.classList.remove("nav--open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavCollapse);
} else {
  initNavCollapse();
}

// Mobile: "项目" dropdown click-to-toggle (instead of hover)
function initNavDropdownMobile() {
  var dropbtn = document.querySelector(".nav__dropdown .nav__dropbtn");
  var dropdown = document.querySelector(".nav__dropdown");
  if (!dropbtn || !dropdown) return;
  dropbtn.addEventListener("click", function (e) {
    var inner = document.querySelector(".nav__inner");
    if (!inner || !inner.classList.contains("nav--collapsed")) return;
    e.preventDefault();
    dropdown.classList.toggle("is-open");
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavDropdownMobile);
} else {
  initNavDropdownMobile();
}

// Community members: duplicate items for seamless auto-scroll
const communityTrack = document.getElementById("communityTrack");
if (communityTrack) {
  const items = communityTrack.innerHTML;
  communityTrack.insertAdjacentHTML("beforeend", items);
}

// Overview diagram: language-specific asset (index.html)
function updateOverviewImage() {
  var img = document.getElementById("overviewImg");
  if (!img) return;
  var lang =
    typeof window.ruyiaiLang !== "undefined" && window.ruyiaiLang === "en"
      ? "en"
      : "zh";
  img.src =
    lang === "en"
      ? "./assets/ruyiai-overview_en.png"
      : "./assets/ruyiai-overview.png";
  if (typeof window.ruyiaiGetText === "function") {
    img.alt = window.ruyiaiGetText("hero.overviewImgAlt");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateOverviewImage);
} else {
  updateOverviewImage();
}
window.addEventListener("languagechange", updateOverviewImage);

copyBtn?.addEventListener("click", async () => {
  const text = codeBlock?.innerText || "";
  try {
    await navigator.clipboard.writeText(text);
    const t = copyBtn.querySelector(".copy__text");
    if (t) t.textContent = "Copied!";
    copyBtn.disabled = true;
    setTimeout(() => {
      if (t) t.textContent = "Copy";
      copyBtn.disabled = false;
    }, 1200);
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
});
