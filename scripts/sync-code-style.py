#!/usr/bin/env python3
"""
将 docs/code-style.md 的内容同步到 docs.js 中「代码规范」的 markdown 字段。
修改完 code-style.md 后运行此脚本，然后刷新文档页即可看到更新。

使用：在项目根目录执行 python3 scripts/sync-code-style.py
"""

import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
md_path = os.path.join(root, "docs", "code-style.md")
js_path = os.path.join(root, "docs.js")


def escape_for_js(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")


def main():
    with open(md_path, "r", encoding="utf-8") as f:
        md = f.read().rstrip("\n")
    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()

    anchor = '"code-style":'
    label = 'markdown: "'
    idx = js.find(anchor)
    if idx == -1:
        print("docs.js 中未找到 \"code-style\" 配置")
        raise SystemExit(1)
    start_search = idx + len(anchor)
    open_idx = js.find(label, start_search)
    if open_idx == -1:
        print("docs.js 中未找到 code-style 的 markdown 字段")
        raise SystemExit(1)
    string_start = open_idx + len(label)
    i = string_start
    while i < len(js):
        if js[i] == "\\":
            i += 2
            continue
        if js[i] == '"':
            break
        i += 1
    string_end = i
    escaped = escape_for_js(md)
    js = js[:string_start] + escaped + js[string_end:]
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js)
    print("已同步 docs/code-style.md -> docs.js（代码规范）")


if __name__ == "__main__":
    main()
