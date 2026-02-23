// Copy button
const copyBtn = document.getElementById("copyBtn");
const codeBlock = document.getElementById("codeBlock");
const year = document.getElementById("year");

year.textContent = String(new Date().getFullYear());

// Mobile nav: hamburger toggle
const navToggle = document.getElementById("navToggle");
const navInner = document.querySelector(".nav__inner");
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

// Mobile: "项目" dropdown click-to-toggle (instead of hover)
function initNavDropdownMobile() {
  var dropbtn = document.querySelector(".nav__dropdown .nav__dropbtn");
  var dropdown = document.querySelector(".nav__dropdown");
  if (!dropbtn || !dropdown) return;
  dropbtn.addEventListener("click", function (e) {
    if (window.innerWidth > 768) return;
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
