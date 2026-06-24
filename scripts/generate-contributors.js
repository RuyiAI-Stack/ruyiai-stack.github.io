#!/usr/bin/env node
/**
 * 拉取各仓库贡献者并生成 assets/contributors.json（去重、保留首次出现顺序）。
 * 非 fork 仓库：使用 GitHub Contributors API。
 * fork 仓库：仅统计相对上游仓库新增提交中的作者（不含上游历史贡献者）。
 * 用法：node scripts/generate-contributors.js
 */
"use strict";

var fs = require("fs");
var path = require("path");
var https = require("https");

var REPOS = [
  "buddy-compiler/buddy-mlir",
  "RuyiAI-Stack/ruyiai-stack.github.io",
  "RuyiAI-Stack/triton-riscv",
  "RuyiAI-Stack/tilelang-riscv",
  "RuyiAI-Stack/pytorch",
  "RuyiAI-Stack/llvm-project"
];

var OUT = path.join(__dirname, "..", "assets", "contributors.json");
var TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

function ghGet(url) {
  return new Promise(function (resolve, reject) {
    var headers = { "User-Agent": "ruyiai-stack-contributors-script", Accept: "application/vnd.github+json" };
    if (TOKEN) headers.Authorization = "Bearer " + TOKEN;
    https.get(url, { headers: headers }, function (res) {
      var body = "";
      res.on("data", function (c) { body += c; });
      res.on("end", function () {
        if (res.statusCode === 403 && body.indexOf("rate limit") !== -1) {
          reject(new Error("GitHub API rate limit exceeded. Set GITHUB_TOKEN or retry later."));
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error("HTTP " + res.statusCode + " for " + url + ": " + body.slice(0, 200)));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function contributorKey(c) {
  if (c.login) return "login:" + String(c.login).toLowerCase();
  if (c.id != null) return "id:" + c.id;
  return "anon:" + (c.avatar_url || "");
}

function normalizeContributor(user) {
  if (!user || !user.login) return null;
  return {
    login: user.login,
    id: user.id,
    avatar_url: user.avatar_url,
    html_url: user.html_url || "https://github.com/" + user.login
  };
}

function fetchRepoMeta(repo) {
  return ghGet("https://api.github.com/repos/" + repo);
}

function fetchStandardContributors(repo) {
  var all = [];
  function page(n) {
    return ghGet("https://api.github.com/repos/" + repo + "/contributors?per_page=100&anon=1&page=" + n)
      .then(function (list) {
        if (!list.length) return all;
        all = all.concat(list);
        if (list.length < 100) return all;
        return page(n + 1);
      });
  }
  return page(1).then(function (list) {
    return list.map(normalizeContributor).filter(Boolean);
  });
}

/** fork 仓库：compare 上游默认分支与 fork 默认分支，只取新增提交中的作者 */
function fetchForkContributors(repo, meta) {
  var parent = meta.parent;
  if (!parent || !parent.owner || !parent.full_name) return Promise.resolve([]);
  var parentOwner = parent.owner.login;
  var parentBranch = parent.default_branch || "main";
  var forkBranch = meta.default_branch || "main";
  var contributors = new Map();

  function addFromCommits(commits) {
    commits.forEach(function (commit) {
      [commit.author, commit.committer].forEach(function (user) {
        var c = normalizeContributor(user);
        if (!c) return;
        var key = contributorKey(c);
        if (!contributors.has(key)) contributors.set(key, c);
      });
    });
  }

  function comparePage(basehead) {
    return ghGet("https://api.github.com/repos/" + repo + "/compare/" + basehead)
      .then(function (data) {
        var commits = data.commits || [];
        addFromCommits(commits);
        if (data.total_commits > commits.length && commits.length > 0) {
          var lastSha = commits[commits.length - 1].sha;
          return comparePage(lastSha + "..." + forkBranch);
        }
        return Array.from(contributors.values());
      });
  }

  return comparePage(parentOwner + ":" + parentBranch + "..." + forkBranch);
}

function fetchContributorsForRepo(repo) {
  return fetchRepoMeta(repo).then(function (meta) {
    if (meta.fork && meta.parent) {
      return fetchForkContributors(repo, meta);
    }
    return fetchStandardContributors(repo);
  });
}

function mergeDedup(repoLists) {
  var seen = {};
  var merged = [];
  repoLists.forEach(function (list) {
    list.forEach(function (c) {
      var key = contributorKey(c);
      if (seen[key]) return;
      seen[key] = true;
      merged.push(c);
    });
  });
  return merged;
}

function fetchAllSequential(repos) {
  var results = [];
  function next(i) {
    if (i >= repos.length) return Promise.resolve(results);
    var repo = repos[i];
    process.stderr.write("Fetching " + repo + "…\n");
    return fetchContributorsForRepo(repo)
      .then(function (list) {
        process.stderr.write("  " + list.length + " contributors\n");
        results.push(list);
        return next(i + 1);
      });
  }
  return next(0);
}

fetchAllSequential(REPOS)
  .then(function (repoLists) {
    var contributors = mergeDedup(repoLists);
    var payload = {
      generatedAt: new Date().toISOString(),
      repos: REPOS,
      forkPolicy: "fork repos count only commits ahead of upstream parent",
      count: contributors.length,
      contributors: contributors
    };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
    process.stderr.write("Wrote " + contributors.length + " contributors to " + OUT + "\n");
  })
  .catch(function (err) {
    process.stderr.write(String(err.message || err) + "\n");
    process.exit(1);
  });
