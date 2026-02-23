# ruyiai-stack.github.io

## 维护文档

- **代码规范**：正文直接来自 `docs/code-style.md`，页面通过 `fetch` 加载该文件并解析为 Markdown。只需编辑 `docs/code-style.md` 并刷新页面即可看到更新。
  - 需通过 **HTTP** 打开文档页（如部署到 GitHub Pages，或本地运行 `python3 -m http.server` 后访问），直接双击 `docs.html`（file://）无法加载该文件。