#!/usr/bin/env node
// Publish a bounded preview; report.md remains the complete, unchanged artifact.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Conservative UTF-8 byte bound also bounds code points and UTF-16 units.
// Count the final summary and footer, not just the candidate entries.
const MAX_BYTES = 60_000;
const report = await readFile(process.argv[2], "utf8");
if (!report) process.exit(0); // discover's zero-candidate output stays silent

const total = Number(report.match(/^Found \*\*(\d+)\*\* bb plugins? /)?.[1]);
const start = report.search(/^- \[ \] /m);
const entries = start < 0 ? [] : report.slice(start).trimEnd().split(/(?=^- \[ \] )/m).map((e) => e.trimEnd());
if (!Number.isSafeInteger(total) || total < 1 || entries.length !== total) {
  throw new Error("preview: invalid discovery report or candidate count mismatch");
}
const runUrl = process.env.DISCOVERY_RUN_URL;
const artifactUrl = process.env.DISCOVERY_ARTIFACT_URL;
if (![runUrl, artifactUrl].every((url) => /^https:\/\/[^\s)]+$/.test(url ?? ""))) {
  throw new Error("preview: run and uploaded artifact URLs are required");
}
const bytes = Buffer.byteLength(report);
const digest = createHash("sha256").update(report).digest("hex");
const footer = (shown) =>
  `\n\n---\nShowing **${shown} of ${total}** candidates; **${total - shown} omitted** from this preview.\n\n` +
  `[Complete original report (all ${total} candidates)](${artifactUrl}) · [Workflow run](${runUrl})\n` +
  `Download the artifact and open \`report.md\` (${bytes} bytes; SHA-256: \`${digest}\`). ` +
  `The artifact is subject to Actions retention; use the next successful run after it expires.\n\n` +
  `_Swept by [\`scripts/discover.mjs\`](../blob/main/scripts/discover.mjs) on ${new Date().toISOString().slice(0, 10)}. ` +
  `This issue is rewritten each run, so ticking a box will not survive — add the entry to README.md instead._\n`;

let preview = report.slice(0, start).trimEnd();
let shown = 0;
if (Buffer.byteLength(preview + footer(shown)) > MAX_BYTES) {
  throw new Error("preview: report header and footer exceed the issue budget");
}
for (const entry of entries) {
  const next = `${preview}\n\n${entry}`;
  // An oversized entry stays in the artifact and omitted count. Later entries
  // can still fit; never slice an entry or a Unicode character to fill space.
  if (Buffer.byteLength(next + footer(shown + 1)) <= MAX_BYTES) {
    preview = next;
    shown++;
  }
}
process.stdout.write(preview + footer(shown));
console.error(`preview: ${shown} of ${total} candidates shown; ${total - shown} omitted; ${Buffer.byteLength(preview + footer(shown))} issue bytes; ${bytes} report bytes; sha256 ${digest}`);
