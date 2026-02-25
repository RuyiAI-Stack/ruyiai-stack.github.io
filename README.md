# ruyiai-stack.github.io

## 维护文档

- **代码规范**：正文来自 `docs/contributor-guide/code-style.md`，页面通过 `fetch` 加载并解析。编辑该文件并刷新页面即可看到更新。
  - 需通过 **HTTP** 打开文档页（如部署到 GitHub Pages，或本地运行 `python3 -m http.server` 后访问），直接双击 `docs.html`（file://）无法加载该文件。

## 文档目录结构（docs/）

按文档栏目一级菜单划分，便于按分类上传 Markdown：

| 一级菜单       | 文件夹路径                 |
|----------------|----------------------------|
| 总览           | `docs/overview/`           |
| 安装方式       | `docs/install/`            |
| 使用教程       | `docs/tutorial/`           |
| 贡献者指引     | `docs/contributor-guide/`  |
| Ruyi AI 编译器 | `docs/compiler/`           |
| Ruyi AI 算子编程语言 | `docs/operator-lang/` |
| Ruyi AI 算子库 | `docs/operator-lib/`       |
| Ruyi AI 运行时环境 | `docs/runtime/`        |
| 关于           | `docs/about/`               |

- **上线 Markdown**：在对应文件夹内编写或放置 `.md` 文件，并在 `docs.js` 中为该菜单项配置 `markdownUrl` 指向该文件路径。

## 上线 Markdown 文档

- **文档编写者需**：
  - Fork 仓库；
  - 在 `docs/` 下对应一级菜单文件夹中完成 Markdown 编写（见上表）；
  - 发起 Pull Request（PR）。
- **网页维护者需**：
  - 审核 PR 内容；
  - 合并 PR，并完成网页发布。