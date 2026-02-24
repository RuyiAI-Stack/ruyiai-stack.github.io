<!-- # Git 开源工作流程

RuyiAI 社区采用 Fork + Pull
Request 的工作模式进行开源贡献。

--- -->

## 一、首次开发前准备

在首次参与项目开发时，应按照以下步骤进行准备：

### 1. Fork 项目

在 GitHub 上，将 **Upstream 仓库** Fork 到个人 GitHub 账户（Origin
仓库）。

### 2. Clone 到本地

将个人 GitHub 账户中的仓库（Origin）克隆到本地：

``` bash
git clone https://github.com/yourname/project.git
cd project
```

### 3. 添加 Upstream 远程仓库

为了后续同步上游代码，需要添加 Upstream 远程地址：

``` bash
git remote add upstream https://github.com/upstream/project.git
```

可通过以下命令确认远程仓库配置：

``` bash
git remote -v
```

至此，本地开发环境准备完成。

---

## 二、日常开发流程

以下流程适用于每一次功能开发或问题修复。

### 1. 同步最新上游代码

在开发前，确保本次开发基于最新的 Upstream 代码：

``` bash
git checkout main
git fetch upstream
git rebase upstream/main
```

---

### 2. 创建新分支

避免在 `main` 分支上直接开发，应在 `main` 分支上创建独立分支：

``` bash
git checkout -b xxx
```


> 建议采用有语义的分支命名，例如： - `feature/add-vector-pass` -
> `fix/memory-leak` - `refactor/code-structure`

---

### 3. 本地开发

在当前分支上进行代码编写与修改，保持提交粒度合理，每个 commit 尽量只做一件事。

---

### 4. 添加修改至暂存区

``` bash
git add .
```

> 也可以精确添加文件，例如：
>
> ``` bash
> git add src/file.cpp
> ```

---

### 5. 提交代码

``` bash
git commit -m "commit message"
```

> 提交说明建议使用规范格式，例如： -
> `[IR] Add support for vector region.` -
> `[Fix] Resolve segmentation fault in pass pipeline.` -
> `[NFC] Update README.`

---

### 6. 再次同步上游代码（避免冲突）

此时应处于开发分支上。
``` bash
git fetch upstream
git rebase upstream/main
```

若出现冲突，解决冲突后：

``` bash
git add .
git rebase --continue
```

---

### 7. 推送至个人 GitHub 仓库

``` bash
git push origin 本地分支名:目标分支名

# 例如
git push origin feature/add-vector-pass:feature/add-vector-pass
```

---

### 8. 提交 Pull Request（PR）

1.  登录 GitHub
2.  进入个人仓库页面
3.  点击 "Compare & Pull Request"
4.  提交 PR 至 Upstream 仓库
5.  等待 Review

---

### 9. 根据 Review 修改代码

``` bash
git add .
git commit -m "fix according to review comments"
git push origin xxx:xxx
```

如果 Review 意见需要将代码 Rebase 到最新则需要

``` bash
# 若仅同步到最新 upstream（没有新增代码修改）
git fetch upstream
git rebase upstream/main

# 若 rebase 过程中产生冲突：解决后继续
git add .
git rebase --continue

# rebase 改写了提交历史，需要强制推送
git push --force-with-lease origin xxx
```

PR 会自动更新，无需重新创建。
