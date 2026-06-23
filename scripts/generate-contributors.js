#!/usr/bin/env node
/**
 * 拉取各仓库贡献者并生成 assets/contributors.json（去重、保留首次出现顺序）。
 * 用法：node scripts/generate-contributors.js
 * 未认证 GitHub API 限流 60 次/小时；若失败请稍后重试或设置 GITHUB_TOKEN。
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

function fetchRepoContributors(repo) {
  var all = [];
  function page(n) {
    var url = "https://api.github.com/repos/" + repo + "/contributors?per_page=100&anon=1&page=" + n;
    return ghGet(url).then(function (list) {
      if (!list.length) return all;
      all = all.concat(list);
      if (list.length < 100) return all;
      return page(n + 1);
    });
  }
  return page(1);
}

function contributorKey(c) {
  if (c.login) return "login:" + String(c.login).toLowerCase();
  if (c.id != null) return "id:" + c.id;
  return "anon:" + (c.avatar_url || "");
}

function mergeDedup(repoLists) {
  var seen = {};
  var merged = [];
  repoLists.forEach(function (list) {
    list.forEach(function (c) {
      var key = contributorKey(c);
      if (seen[key]) return;
      seen[key] = true;
      merged.push({
        login: c.login || null,
        id: c.id,
        avatar_url: c.avatar_url,
        html_url: c.html_url || (c.login ? "https://github.com/" + c.login : null)
      });
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
    return fetchRepoContributors(repo)
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
