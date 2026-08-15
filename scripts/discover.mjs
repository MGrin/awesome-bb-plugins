#!/usr/bin/env node
// Find bb plugins that are not in README.md yet.
//
// WHY: the list is hand-compiled, and the whole point of it is that nobody can
// see what exists. A directory that only grows when someone remembers to send a
// link has the same problem it was built to solve.
//
// THE UNIT IS A PLUGIN, NOT A REPO. That is the whole difference between this
// version and the first one. v1 asked "is this repo a plugin?" and answered it
// from the repo's ROOT package.json, which is wrong twice over:
//
//   - A plugin monorepo has no bb key at the root. smsunarto/bb-plugins (9
//     plugins) and MateoCerquetella/bb-plugins (2) are both tagged
//     `topic:bb-plugin`, were both found by the topic search, and were both
//     thrown away as "not a plugin" — 11 plugins lost to a manifest path.
//   - An ALREADY-LISTED monorepo hid every plugin added to it afterwards,
//     because "already listed" was decided per repo. patleeman/bb-plugins
//     gained bb-plugin-emoji-react and bb-plugin-grove, jssblck/bb-plugins
//     gained plugin-goal, and the sweep could not have reported any of them.
//
// So: enumerate the manifests inside a repo, and compare each plugin against
// the entries of the README rather than comparing repo URLs.
//
// FOUR SOURCES, failing in different ways so one missing a plugin does not hide
// it: name-prefix finds the conventional `bb-plugin-*`; topics find anyone who
// tagged theirs; description search finds plugins named something else entirely
// (SawyerHood/bb-slop-cop has a real bb key and matches no naming convention —
// v1's name gate dropped it before ever reading its manifest); npm finds the
// ones now published there, which is a channel that did not exist when v1 was
// written.
//
// WHAT COUNTS: the README's own bar — a manifest with a `bb` key, or one that
// depends on @bb/plugin-sdk. Nothing is added on the strength of a repo name.
//
// WHAT STAYS DECLINED: `discovery-ledger.json`. Without it the sweep re-proposes
// everything anyone ever decided against — bb-plugin-attention was removed from
// the list deliberately and came back in the next report. A judgement that is
// not written down is a judgement that gets made again every week.
//
// Prints a markdown report on stdout and exits 0 with NO output when there is
// nothing new, so the workflow can stay quiet on a normal week.

import { readFile } from "node:fs/promises";

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
  // Finds plugins whose repo is not named bb-plugin-* and who never tagged it.
  // This is the search that would have caught bb-slop-cop.
  { label: "description", q: '"bb plugin" in:description,readme', pages: 2, sort: "updated" },
];

async function searchRepos() {
  const found = new Map(); // full_name -> {repo, how:Set}
  const add = (r, label) => {
    if (!r?.full_name) return;
    const e = found.get(r.full_name) ?? { repo: r, how: new Set() };
    e.how.add(label);
    found.set(r.full_name, e);
  };

  for (const s of SEARCHES) {
    for (let page = 1; page <= (s.pages ?? 1); page++) {
      const sort = s.sort ? `&sort=${s.sort}&order=desc` : "";
      const data = await gh(`/search/repositories?per_page=100&page=${page}${sort}&q=${encodeURIComponent(s.q)}`);
      const items = data?.items ?? [];
      for (const r of items) add(r, s.label);
      if (items.length < 100) break; // last page
    }
  }

  // Code search is the one that finds plugins NOT named bb-plugin-*, which is
  // exactly the blind spot of the name search. It needs its own Accept header
  // and is the flakiest, so a failure here degrades the sweep instead of
  // failing it.
  try {
    const code = await gh(
      "/search/code?per_page=100&q=" + encodeURIComponent('"@bb/plugin-sdk" in:file filename:package.json'),
      "application/vnd.github.text-match+json",
    );
    for (const item of code?.items ?? []) add(item.repository, "code");
  } catch (e) {
    console.error(`discover: code search unavailable (${e.message}) — continuing with repo searches`);
  }

  // npm. Plugins publish there now — `bb plugin install npm:bb-plugin-taskboard`
  // is the install line in half the Discord announcements — and the keyword
  // search is precise in a way the text search is not: `keywords:bb-plugin`
  // returns 16 packages, `text=bb-plugin` returns 260,000. Each package carries
  // a repository URL, which is what we actually want.
  try {
    const res = await fetch("https://registry.npmjs.org/-/v1/search?text=keywords:bb-plugin&size=250", {
      headers: { "user-agent": "awesome-bb-plugins-discover" },
    });
    if (!res.ok) throw new Error(`npm search ${res.status}`);
    const data = await res.json();
    for (const o of data.objects ?? []) {
      const url = o.package?.links?.repository ?? o.package?.repository?.url ?? "";
      const m = url.match(/github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:$|[/#])/);
      if (!m) continue;
      const fullName = `${m[1]}/${m[2]}`;
      // A repo the GitHub searches already returned keeps its rich metadata;
      // one only npm knows about gets a stub, filled in below.
      if (found.has(fullName)) found.get(fullName).how.add("npm");
      else found.set(fullName, { repo: { full_name: fullName, stub: true }, how: new Set(["npm"]) });
    }
  } catch (e) {
    console.error(`discover: npm search unavailable (${e.message}) — continuing without it`);
  }

  return found;
}

// A package.json `name` is what the author INTENDS to publish, not what is
// published. Reporting it as an npm package without asking the registry was
// wrong 21 times out of 22 on 2026-08-15, and wrong about bb-plugin-slopcop on
// 2026-08-12. It matters because a plugin in a monorepo subdirectory cannot be
// installed with the `git:` form at all (get-bb/bb#1097), so for those the npm
// name is the ONLY install route an entry can offer — and a fabricated one
// sends the reader to a command that cannot work.
//
// Unknown is not the same as absent: a registry that times out must not silently
// turn every package into a 404, so a failed lookup returns null and the caller
// omits the claim rather than asserting either way.
const npmCache = new Map();
async function publishedOnNpm(name) {
  if (!name) return false;
  if (npmCache.has(name)) return npmCache.get(name);
  let verdict = null;
  try {
    const res = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2F")}`, {
      method: "HEAD",
      headers: { "user-agent": "awesome-bb-plugins-discover" },
    });
    if (res.status === 200) verdict = true;
    else if (res.status === 404) verdict = false;
    // Anything else (429, 5xx) stays null — unknown, not absent.
  } catch {
    // Network failure is unknown too.
  }
  npmCache.set(name, verdict);
  return verdict;
}

const isPluginManifest = (pkg) => {
  if (pkg?.bb) return { ok: true, why: "package.json has a bb key", desc: pkg.bb?.description ?? pkg.description ?? null };
  const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}), ...(pkg?.peerDependencies ?? {}) };
  if (deps["@bb/plugin-sdk"]) return { ok: true, why: "depends on @bb/plugin-sdk", desc: pkg?.description ?? null };
  return { ok: false };
};

const readPkg = async (fullName, path, ref) => {
  const file = await gh(`/repos/${fullName}/contents/${path}${ref ? `?ref=${ref}` : ""}`);
  if (!file?.content) return null;
  try {
    return JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
  } catch {
    return null; // an unparseable package.json is not a plugin claim
  }
};

const listDirs = async (fullName, path, ref) => {
  const d = await gh(`/repos/${fullName}/contents/${path}${ref ? `?ref=${ref}` : ""}`);
  return Array.isArray(d) ? d.filter((x) => x.type === "dir").map((x) => x.name) : [];
};

/**
 * Every plugin inside a repo, as a list — a monorepo yields many, an ordinary
 * plugin repo yields one, a repo that only mentions bb yields none.
 */
async function findPlugins(fullName, ref) {
  const units = [];
  const consider = async (path, dirName) => {
    const pkg = await readPkg(fullName, path ? `${path}/package.json` : "package.json", ref);
    if (!pkg) return false;
    const verdict = isPluginManifest(pkg);
    if (!verdict.ok) return false;
    units.push({
      repo: fullName,
      path: path || null,
      // The name a reader would use. Prefer the manifest's own bb name, then
      // the npm name, then the directory — a directory called `notify` and a
      // package called `@smsunarto/bb-plugin-notify` are the same plugin, and
      // the README may have used either.
      name: pkg.bb?.name ?? pkg.name ?? dirName ?? fullName.split("/")[1],
      pkgName: pkg.name ?? null,
      dirName: dirName ?? null,
      desc: (verdict.desc || "").replace(/\s+/g, " ").trim(),
      why: verdict.why,
    });
    return true;
  };

  // The root is a plugin in the ordinary case, and is a workspace in the
  // interesting one. Both are worth checking; neither excludes the other.
  await consider("", null);
  await consider("plugin", "plugin");

  for (const container of ["plugins", "packages"]) {
    const dirs = await listDirs(fullName, container, ref);
    for (const dir of dirs) await consider(`${container}/${dir}`, dir);
  }
  return units;
}

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/^@[^/]+\//, "")     // npm scope
    .replace(/^bb[-_]?plugin[-_]?/, "")
    .replace(/^plugin[-_]?/, "")
    .replace(/[^a-z0-9]/g, "");

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

// Entries, not bare URLs. `[excalidraw](https://github.com/patleeman/bb-plugins)`
// and `[sessions](...same repo...)` are two plugins in one repo, and the only
// thing distinguishing them is the link TEXT — so that is what gets matched.
const listedEntries = [...readme.matchAll(/\[([^\]]+)\]\(https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)([^)]*)\)/g)].map(
  (m) => ({ text: m[1], repo: `${m[2]}/${m[3]}`.toLowerCase(), rest: m[4] ?? "" }),
);
const listedRepoNames = new Map(); // repo -> Set of normalised entry names
for (const e of listedEntries) {
  if (!listedRepoNames.has(e.repo)) listedRepoNames.set(e.repo, new Set());
  listedRepoNames.get(e.repo).add(norm(e.text));
  // A `/tree/main/plugins/gh-stack` link names the plugin by path too.
  const sub = e.rest.match(/\/(?:tree|blob)\/[^/]+\/(?:plugins|packages)\/([A-Za-z0-9_.-]+)/);
  if (sub) listedRepoNames.get(e.repo).add(norm(sub[1]));
}

// Judgements already made. Without this the sweep argues with the maintainer
// once a week, forever.
const ledger = await (async () => {
  try {
    return JSON.parse(await readFile(new URL("../discovery-ledger.json", import.meta.url), "utf8"));
  } catch {
    return { declined: [], listedAs: [] };
  }
})();
const declined = new Set((ledger.declined ?? []).map((d) => (d.plugin ?? d.repo ?? "").toLowerCase()));
const listedAs = new Set((ledger.listedAs ?? []).map((d) => (d.plugin ?? "").toLowerCase()));

const isListed = (u) => {
  const key = (u.path ? `${u.repo}/${u.path}` : u.repo).toLowerCase();
  if (listedAs.has(key)) return true;
  const names = listedRepoNames.get(u.repo.toLowerCase());
  if (!names) return false;
  // A single-plugin repo is listed if the repo is linked at all. A monorepo's
  // plugin is listed only if some entry names it.
  if (!u.path) return true;
  return [u.name, u.pkgName, u.dirName].some((n) => n && names.has(norm(n)));
};

const found = await searchRepos();
const stats = { repos: found.size, skippedRepos: 0, private: 0, archived: 0, plugins: 0, alreadyListed: 0, declined: 0 };
const candidates = [];

for (const [fullName, { repo: found0, how }] of found) {
  // npm only gave us a name. Everything below — private, archived, stars, last
  // push — needs the repo itself.
  const repo = found0.stub ? ((await gh(`/repos/${fullName}`)) ?? found0) : found0;

  // The sweep runs with a token, so GitHub search happily returns the token
  // owner's PRIVATE repos — and it did: four of mgrin's own were proposed for
  // a public directory. An entry pointing at a private repo is a 404 for
  // everyone but its owner, which is precisely the failure commit fd2338a had
  // to clean up by hand. Anything not provably public is not a candidate.
  if (repo.private !== false) { stats.private++; continue; }
  if (repo.archived) { stats.archived++; continue; }
  if (fullName.toLowerCase() === "get-bb/bb") continue; // bb itself, not a plugin

  // The name search drags in other ecosystems' "bb-plugin" repos, and
  // enumerating every one of them costs enough requests to hit the rate limit.
  // A repo vouched for by a topic, by code search, by npm, or by a description
  // that says "bb plugin" is read regardless of what it is called — that is the
  // gate that used to drop bb-slop-cop.
  const vouched = how.has("topic") || how.has("topic-getbb") || how.has("code") || how.has("npm") || how.has("description");
  if (!vouched && !/bb[-_]?plugin/i.test(repo.name ?? fullName.split("/")[1])) { stats.skippedRepos++; continue; }

  let units = [];
  try {
    units = await findPlugins(fullName, repo.default_branch ?? null);
  } catch (e) {
    // A repo we could not read is UNKNOWN, not empty. Say so rather than
    // letting it vanish into the "not a plugin" pile.
    console.error(`discover: could not read ${fullName} (${e.message}) — skipped, not judged`);
    continue;
  }
  if (!units.length) { stats.skippedRepos++; continue; }
  stats.plugins += units.length;

  for (const u of units) {
    const key = (u.path ? `${u.repo}/${u.path}` : u.repo).toLowerCase();
    if (declined.has(key) || declined.has(u.repo.toLowerCase())) { stats.declined++; continue; }
    if (isListed(u)) { stats.alreadyListed++; continue; }
    candidates.push({
      key,
      fullName,
      path: u.path,
      name: u.name,
      url: u.path ? `https://github.com/${fullName}/tree/HEAD/${u.path}` : `https://github.com/${fullName}`,
      stars: repo.stargazers_count ?? 0,
      pushed: (repo.pushed_at ?? "").slice(0, 10),
      desc: u.desc || (repo.description ?? "").replace(/\s+/g, " ").trim(),
      why: u.why,
      how: [...how].join("+"),
      // Verified against the registry below, once the candidate list is final —
      // never taken from the manifest.
      npm: null,
      pkgName: u.pkgName,
    });
  }
}

// Resolve the npm claims now that the candidate list is final — a handful of
// HEAD requests, not one per plugin in the ecosystem.
let npmChecked = 0;
let npmUnknown = 0;
for (const c of candidates) {
  const verdict = await publishedOnNpm(c.pkgName);
  if (verdict === null) npmUnknown++;
  else if (verdict) npmChecked++;
  c.npm = verdict === true ? c.pkgName : null;
}
if (candidates.length) {
  console.error(
    `discover: npm — ${npmChecked} of ${candidates.length} candidate package names are really published` +
      (npmUnknown ? `, ${npmUnknown} unknown (registry did not answer; claim omitted)` : ""),
  );
}

// Always on stderr, even on a quiet week: "found nothing" and "looked at
// nothing" are the same output otherwise, and the second one is a broken sweep
// wearing the first one's face.
console.error(
  `discover: ${stats.repos} repos matched a search · ${stats.skippedRepos} held no plugin · ` +
    `${stats.private} private · ${stats.archived} archived · ${stats.plugins} plugins found · ` +
    `${stats.alreadyListed} already listed · ${stats.declined} previously declined · ${candidates.length} new`,
);
if (stats.repos === 0) {
  console.error("discover: every search returned nothing — that is a broken sweep, not an empty ecosystem");
  process.exit(1);
}
if (stats.plugins === 0) {
  console.error("discover: matched repos but found zero plugins — the manifest check is broken, not the ecosystem");
  process.exit(1);
}

if (!candidates.length) process.exit(0); // silence is the normal week

candidates.sort((a, b) => b.stars - a.stars || a.key.localeCompare(b.key));
const lines = [
  `Found **${candidates.length}** bb plugin${candidates.length === 1 ? "" : "s"} not in the list yet.`,
  "",
  "Each one was verified the same way the list requires — a manifest with a `bb` key or a",
  "dependency on `@bb/plugin-sdk` — so these are candidates, not guesses. They still need a",
  "one-sentence description and the right section before they go in.",
  "",
  "Something here that should **not** be listed? Add it to `discovery-ledger.json` with a reason",
  "and the sweep will stop proposing it.",
  "",
  ...candidates.map(
    (c) =>
      `- [ ] [${c.name}](${c.url}) — ${c.desc || "_no description_"}  \n      ` +
      `<sub>${c.why} · ${c.fullName}${c.npm ? ` · npm \`${c.npm}\`` : ""}` +
      // A subdirectory plugin cannot use the `git:` form (get-bb/bb#1097). With
      // no npm package either, there is no documented install route at all —
      // say so here rather than leaving whoever triages it to find out.
      `${c.path && !c.npm ? " · **no install route: monorepo subdir, not on npm**" : ""}` +
      ` · found by ${c.how} · ${c.stars}★ · last push ${c.pushed}</sub>`,
  ),
];
console.log(lines.join("\n"));
