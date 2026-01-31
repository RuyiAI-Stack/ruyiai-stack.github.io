// Copy button
const copyBtn = document.getElementById("copyBtn");
const codeBlock = document.getElementById("codeBlock");
const year = document.getElementById("year");
const burger = document.querySelector(".nav__burger");
const mobileMenu = document.getElementById("mobileMenu");

year.textContent = String(new Date().getFullYear());

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

// Mobile menu toggle
burger?.addEventListener("click", () => {
  const hidden = mobileMenu.hasAttribute("hidden");
  if (hidden) mobileMenu.removeAttribute("hidden");
  else mobileMenu.setAttribute("hidden", "");
});
