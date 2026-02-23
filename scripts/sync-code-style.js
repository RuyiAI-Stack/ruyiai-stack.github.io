#!/usr/bin/env node
/**
 * 将 docs/code-style.md 的内容同步到 docs.js 中「代码规范」的 markdown 字段。
 * 修改完 code-style.md 后运行此脚本，然后刷新文档页即可看到更新。
 *
 * 使用：在项目根目录执行 node scripts/sync-code-style.js
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const mdPath = path.join(root, "docs", "code-style.md");
const jsPath = path.join(root, "docs.js");

function escapeForJsDoubleQuoted(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

const md = fs.readFileSync(mdPath, "utf8").trimEnd();
let js = fs.readFileSync(jsPath, "utf8");

const anchor = '"code-style":';
const markdownLabel = 'markdown: "';
const idx = js.indexOf(anchor);
if (idx === -1) {
  console.error("docs.js 中未找到 \"code-style\" 配置");
  process.exit(1);
}
const startSearch = idx + anchor.length;
const openIdx = js.indexOf(markdownLabel, startSearch);
if (openIdx === -1) {
  console.error("docs.js 中未找到 code-style 的 markdown 字段");
  process.exit(1);
}
const stringStart = openIdx + markdownLabel.length;
let i = stringStart;
while (i < js.length) {
  if (js[i] === "\\") {
    i += 2;
    continue;
  }
  if (js[i] === '"') break;
  i++;
}
const stringEnd = i;
const escaped = escapeForJsDoubleQuoted(md);
js = js.slice(0, stringStart) + escaped + js.slice(stringEnd);
fs.writeFileSync(jsPath, js, "utf8");
console.log("已同步 docs/code-style.md -> docs.js（代码规范）");
