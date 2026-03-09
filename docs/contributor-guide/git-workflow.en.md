## 1. First-Time Setup

Before contributing for the first time, follow these preparation steps:

### 1. Fork the Repository

On GitHub, fork the **Upstream repository** to your personal GitHub account (Origin repository).

### 2. Clone to Local

Clone your personal GitHub repository (Origin) to your local machine:

``` bash
git clone https://github.com/yourname/project.git
cd project
```

### 3. Add the Upstream Remote

To sync upstream code later, add the Upstream remote URL:

``` bash
git remote add upstream https://github.com/upstream/project.git
```

Verify the remote configuration with:

``` bash
git remote -v
```

Your local development environment is now ready.

---

## 2. Daily Development Workflow

The following workflow applies to every feature development or bug fix.

### 1. Sync with the Latest Upstream Code

Before starting development, ensure your work is based on the latest Upstream code:

``` bash
git checkout main
git fetch upstream
git rebase upstream/main
```

---

### 2. Create a New Branch

Avoid developing directly on the `main` branch. Create an independent branch from `main`:

``` bash
git checkout -b xxx
```

> Use semantic branch names, for example:
> - `feature/add-vector-pass`
> - `fix/memory-leak`
> - `refactor/code-structure`

---

### 3. Local Development

Write and modify code on your current branch. Keep commits granular — each commit should ideally do one thing.

---

### 4. Stage Changes

``` bash
git add .
```

> You can also stage specific files:
>
> ``` bash
> git add src/file.cpp
> ```

---

### 5. Commit Code

``` bash
git commit -m "commit message"
```

> Use a standardized commit message format, for example:
> - `[IR] Add support for vector region.`
> - `[Fix] Resolve segmentation fault in pass pipeline.`
> - `[NFC] Update README.`

---

### 6. Sync Upstream Again (Avoid Conflicts)

You should be on your development branch at this point.

``` bash
git fetch upstream
git rebase upstream/main
```

If there are conflicts, resolve them and then:

``` bash
git add .
git rebase --continue
```

---

### 7. Push to Your Personal GitHub Repository

``` bash
git push origin local-branch:remote-branch

# For example
git push origin feature/add-vector-pass:feature/add-vector-pass
```

---

### 8. Submit a Pull Request (PR)

1. Log in to GitHub
2. Go to your personal repository page
3. Click "Compare & Pull Request"
4. Submit the PR to the Upstream repository
5. Wait for review

---

### 9. Revise Code Based on Review

``` bash
git add .
git commit -m "fix according to review comments"
git push origin xxx:xxx
```

If the reviewer asks you to rebase onto the latest upstream:

``` bash
# Sync to the latest upstream (no new code changes)
git fetch upstream
git rebase upstream/main

# If conflicts arise during rebase: resolve and continue
git add .
git rebase --continue

# Rebase rewrites commit history, so force push is needed
git push --force-with-lease origin xxx
```

The PR will update automatically — no need to create a new one.
