import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = new URL("./issue-preview.mjs", import.meta.url);
const runUrl = "https://github.com/MGrin/awesome-bb-plugins/actions/runs/123";
const artifactUrl = `${runUrl}/artifacts/456`;
const entry = (name, desc = "description") =>
  `- [ ] [${name}](https://example.com/${name}) — ${desc}  \n      <sub>manifest · ${name}</sub>\n`;
const report = (...entries) => `Found **${entries.length}** bb plugins not in the list yet.\n\nContext.\n\n${entries.join("")}`;

function preview(input, env = {}) {
  const dir = mkdtempSync(join(tmpdir(), "discovery-preview-"));
  const file = join(dir, "report.md");
  try {
    writeFileSync(file, input);
    const result = spawnSync(process.execPath, [script.pathname, file], {
      encoding: "utf8",
      env: { ...process.env, DISCOVERY_RUN_URL: runUrl, DISCOVERY_ARTIFACT_URL: artifactUrl, ...env },
    });
    assert.deepEqual(readFileSync(file), Buffer.from(input), "preview must preserve the complete original report");
    return result;
  } finally {
    rmSync(dir, { recursive: true });
  }
}

function success(input) {
  const r = preview(input);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(Buffer.byteLength(r.stdout) <= 60_000);
  assert.ok(!r.stdout.includes("\uFFFD"));
  return r.stdout;
}

// Each assertion catches lost/partial entries, false counts, an unbounded footer,
// Unicode slicing, missing archive links, or mutation of the original report.
test("overflow publishes whole entries and accounts for every omitted candidate", () => {
  const entries = Array.from({ length: 851 }, (_, i) => entry(`plugin-${i}`, "x".repeat(400)));
  const input = report(...entries);
  const body = success(input);
  const shown = entries.filter((e) => body.includes(e.trimEnd())).length;
  assert.ok(shown > 0 && shown < 851);
  assert.equal((body.match(/^- \[ \] /gm) ?? []).length, shown);
  assert.ok(body.includes(`Showing **${shown} of 851** candidates; **${851 - shown} omitted**`));
  assert.ok(body.includes(artifactUrl));
  assert.ok(body.includes(runUrl));
  assert.ok(body.includes(createHash("sha256").update(input).digest("hex")));
  assert.ok(body.includes(`${Buffer.byteLength(input)} bytes`));
});

test("below and exactly at the payload boundary retain the complete entry", () => {
  // Keep the report-byte count's digit width stable so only padding changes size.
  const initial = report(entry("one", "x".repeat(10000)));
  const padding = 60_000 - Buffer.byteLength(success(initial));
  for (const delta of [-1, 0, 1]) {
    const input = report(entry("one", "x".repeat(10000 + padding + delta)));
    const body = success(input);
    if (delta <= 0) {
      assert.equal(Buffer.byteLength(body), 60_000 + delta);
      assert.ok(body.includes("Showing **1 of 1** candidates; **0 omitted**"));
    } else {
      assert.ok(body.includes("Showing **0 of 1** candidates; **1 omitted**"));
    }
  }
});

test("one oversized entry is omitted whole while a later small entry remains visible", () => {
  const huge = entry("huge", "x".repeat(70_000));
  const small = entry("small");
  const body = success(report(huge, small));
  assert.ok(!body.includes("[huge]"));
  assert.ok(body.includes(small.trimEnd()));
  assert.ok(body.includes("Showing **1 of 2** candidates; **1 omitted**"));
  const alone = success(report(huge));
  assert.ok(alone.includes("Showing **0 of 1** candidates; **1 omitted**"));
});

test("Unicode entries remain intact under the byte bound including the final footer", () => {
  const entries = Array.from({ length: 80 }, (_, i) => entry(`插件-${i}`, "🙂é漢e\u0301".repeat(200)));
  const body = success(report(...entries));
  const shown = entries.filter((e) => body.includes(e.trimEnd())).length;
  assert.ok(shown > 0 && shown < entries.length);
  assert.equal((body.match(/^- \[ \] /gm) ?? []).length, shown);
  assert.ok(body.includes(`**${80 - shown} omitted**`));
});

test("empty input stays silent", () => {
  assert.equal(success(""), "");
});

test("malformed counts and missing artifact links fail before publication", () => {
  for (const input of ["not a discovery report", report(entry("one")).replace("**1**", "**2**")]) {
    const r = preview(input);
    assert.notEqual(r.status, 0);
    assert.equal(r.stdout, "");
  }
  const r = preview(report(entry("one")), { DISCOVERY_ARTIFACT_URL: "" });
  assert.notEqual(r.status, 0);
  assert.equal(r.stdout, "");
});

test("header or footer overflow fails closed", () => {
  const r = preview(report(entry("one")).replace("Context.", "x".repeat(60_000)));
  assert.notEqual(r.status, 0);
  assert.equal(r.stdout, "");
  const footer = preview(report(entry("one")), { DISCOVERY_ARTIFACT_URL: `https://example.com/${"x".repeat(60_000)}` });
  assert.notEqual(footer.status, 0);
  assert.equal(footer.stdout, "");
});

test("discovery with only listed plugins exits successfully without a report", () => {
  // Stub only external HTTP. Run the real discovery and listing decisions.
  const fixture = `
    const repo = { full_name: "MGrin/bb-plugin-bus", name: "bb-plugin-bus", private: false, archived: false, default_branch: "main" };
    globalThis.fetch = async (url) => {
      const u = new URL(url);
      const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
      if (u.hostname === "registry.npmjs.org") return json({ objects: [] });
      if (u.pathname === "/search/repositories") return json({ items: [repo] });
      if (u.pathname === "/search/code") return json({ items: [] });
      if (u.pathname === "/repos/MGrin/bb-plugin-bus/contents/package.json") {
        return json({ content: Buffer.from(JSON.stringify({ name: "bb-plugin-bus", bb: { name: "bus" } })).toString("base64") });
      }
      if (u.pathname.startsWith("/repos/MGrin/bb-plugin-bus/contents/")) return json({}, 404);
      throw new Error("unexpected fixture request: " + url);
    };
  `;
  const r = spawnSync(process.execPath, ["--import", `data:text/javascript;base64,${Buffer.from(fixture).toString("base64")}`, new URL("./discover.mjs", import.meta.url).pathname], {
    encoding: "utf8", env: { ...process.env, GITHUB_TOKEN: "test-fixture-token" },
  });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, "");
  assert.match(r.stderr, /1 plugins found · 1 already listed · 0 previously declined · 0 new/);
});
