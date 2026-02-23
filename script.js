// Copy button
const copyBtn = document.getElementById("copyBtn");
const codeBlock = document.getElementById("codeBlock");
const year = document.getElementById("year");

year.textContent = String(new Date().getFullYear());

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
