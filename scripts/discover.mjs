#!/usr/bin/env node
// Find bb plugins that are not in README.md yet.
//
// WHY: the list is hand-compiled, and the whole point of it is that nobody can
// see what exists. A directory that only grows when someone remembers to send a
// link has the same problem it was built to solve — this repo's own README
// notes two independent Linear plugins and a system monitor duplicating an open
// PR, all because discovery was manual.
//
// HOW IT LOOKS: three searches that fail in different ways, so one missing a
// repo does not hide it. Name-prefix finds the conventional `bb-plugin-*`;
// topic finds anyone who tagged theirs; code search finds plugins named
// something else entirely, which the other two structurally cannot.
//
// WHAT COUNTS: the README's own bar — package.json has a `bb` key, or the code
// imports @bb/plugin-sdk. Nothing is added on the strength of a repo name.
//
// Prints a markdown report on stdout and exits 0 with NO output when there is
// nothing new, so the workflow can stay quiet on a normal week.

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("discover: GITHUB_TOKEN is required");
  process.exit(1);
}

const gh = async (path, accept = "application/vnd.github+json") => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { authorization: `Bearer ${TOKEN}`, accept, "user-agent": "awesome-bb-plugins-discover" },
  });
  if (res.status === 403 || res.status === 429) {
    // Secondary rate limit. Reporting half a sweep as if it were the whole
    // sweep is worse than reporting nothing, so stop loudly.
    throw new Error(`rate limited on ${path} (${res.status})`);
  }
  if (!res.ok) return null;
  return res.json();
};

// `bb-plugin in:name` matches ~480 repos across unrelated ecosystems, and the
// first 100 BY RELEVANCE do not include every real plugin — the sweep silently
// missed bb-plugin-ios-notifications, which is listed and obvious, until a
// falsification test removed it from the README and the sweep still said
// "nothing new". So: sort by recently-updated (a new plugin is a pushed plugin)
// and read several pages.
const SEARCHES = [
  { label: "name", q: "bb-plugin in:name", pages: 3, sort: "updated" },
  { label: "topic", q: "topic:bb-plugin", pages: 1 },
  { label: "topic-getbb", q: "topic:getbb", pages: 1 },
];

async function searchRepos() {
  const found = new Map(); // full_name -> {repo, how:Set}
  for (const s of SEARCHES) {
    for (let page = 1; page <= (s.pages ?? 1); page++) {
      const sort = s.sort ? `&sort=${s.sort}&order=desc` : "";
      const data = await gh(`/search/repositories?per_page=100&page=${page}${sort}&q=${encodeURIComponent(s.q)}`);
      const items = data?.items ?? [];
      for (const r of items) {
        const e = found.get(r.full_name) ?? { repo: r, how: new Set() };
        e.how.add(s.label);
        found.set(r.full_name, e);
      }
      if (items.length < 100) break;   // last page
    }
  }
  // Code search is the one that finds plugins NOT named bb-plugin-*, which is
  // exactly the blind spot of the other two. It needs its own Accept header and
  // is the flakiest, so a failure here degrades the sweep instead of failing it.
  try {
    const code = await gh(
      "/search/code?per_page=100&q=" + encodeURIComponent('"@bb/plugin-sdk" in:file filename:package.json'),
      "application/vnd.github.text-match+json",
    );
    for (const item of code?.items ?? []) {
      const r = item.repository;
      if (!r) continue;
      const e = found.get(r.full_name) ?? { repo: r, how: new Set() };
      e.how.add("code");
      found.set(r.full_name, e);
    }
  } catch (e) {
    console.error(`discover: code search unavailable (${e.message}) — continuing with repo searches`);
  }
  return found;
}

/** The README's bar, applied to the repo itself rather than to its name. */
async function isPlugin(fullName, defaultBranch) {
  for (const path of ["package.json", "plugin/package.json", "packages/plugin/package.json"]) {
    const file = await gh(`/repos/${fullName}/contents/${path}?ref=${defaultBranch}`);
    if (!file?.content) continue;
    try {
      const pkg = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
      if (pkg.bb) return { ok: true, why: "package.json has a bb key", desc: pkg.bb?.description ?? null };
      const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}), ...(pkg.peerDependencies ?? {}) };
      if (deps["@bb/plugin-sdk"]) return { ok: true, why: "depends on @bb/plugin-sdk", desc: null };
    } catch {
      /* unparseable package.json is not a plugin claim */
    }
  }
  return { ok: false };
}

const readme = await (async () => {
  const { readFile } = await import("node:fs/promises");
  return readFile(new URL("../README.md", import.meta.url), "utf8");
})();

// Compare by repo, not by entry: several listed plugins live in one monorepo
// (brsbl/bb-plugins, patleeman/bb-plugins), and re-reporting those every week
// would train the reader to ignore the report.
const listed = new Set(
  [...readme.matchAll(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/g)].map(
    (m) => `${m[1]}/${m[2]}`.toLowerCase(),
  ),
);

const found = await searchRepos();
const stats = { searched: found.size, alreadyListed: 0, notAPlugin: 0, archived: 0 };
const candidates = [];
for (const [fullName, { repo, how }] of found) {
  if (listed.has(fullName.toLowerCase())) { stats.alreadyListed++; continue; }
  if (repo.archived) { stats.archived++; continue; }
  if (repo.full_name.toLowerCase() === "get-bb/bb") continue; // bb itself, not a plugin
  // The name search drags in other ecosystems' "bb-plugin" repos. Verifying all
  // of them costs three content requests each and hits the rate limit; a repo
  // vouched for by a topic or by code search skips this filter entirely.
  const vouched = how.has("topic") || how.has("topic-getbb") || how.has("code");
  if (!vouched && !/bb[-_]?plugin/i.test(repo.name)) { stats.notAPlugin++; continue; }
  const verdict = await isPlugin(fullName, repo.default_branch ?? "main");
  if (!verdict.ok) { stats.notAPlugin++; continue; }
  candidates.push({
    fullName,
    url: repo.html_url,
    stars: repo.stargazers_count ?? 0,
    pushed: (repo.pushed_at ?? "").slice(0, 10),
    desc: (verdict.desc || repo.description || "").replace(/\s+/g, " ").trim(),
    why: verdict.why,
    how: [...how].join("+"),
  });
}

// Always on stderr, even on a quiet week: "found nothing" and "looked at
// nothing" are the same output otherwise, and the second one is a broken sweep
// wearing the first one's face.
console.error(
  `discover: ${stats.searched} repos matched a search · ${stats.alreadyListed} already listed · ` +
    `${stats.notAPlugin} not plugins · ${stats.archived} archived · ${candidates.length} new`,
);
if (stats.searched === 0) {
  console.error("discover: every search returned nothing — that is a broken sweep, not an empty ecosystem");
  process.exit(1);
}

if (!candidates.length) process.exit(0); // silence is the normal week

candidates.sort((a, b) => b.stars - a.stars || a.fullName.localeCompare(b.fullName));
const lines = [
  `Found **${candidates.length}** bb plugin${candidates.length === 1 ? "" : "s"} not in the list yet.`,
  "",
  "Each one was verified the same way the list requires — `package.json` has a `bb` key or",
  "depends on `@bb/plugin-sdk` — so these are candidates, not guesses. They still need a",
  "one-sentence description and the right section before they go in.",
  "",
  ...candidates.map(
    (c) => `- [ ] [${c.fullName}](${c.url}) — ${c.desc || "_no description_"}  \n      ` +
      `<sub>${c.why} · found by ${c.how} · ${c.stars}★ · last push ${c.pushed}</sub>`,
  ),
];
console.log(lines.join("\n"));
