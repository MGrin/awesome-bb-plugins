<!-- agents-md ceiling: 63 lines -->
# AGENTS.md — awesome-bb-plugins

A hand-compiled directory of third-party bb plugins, CC0. There is no build, no package
manifest and no test suite: the deliverable is [`README.md`](README.md), and the only code
is the weekly discovery sweep.

## Commands, all run 2026-09-09

```sh
node --check scripts/discover.mjs                    # rc=0
GITHUB_TOKEN=<token> node scripts/discover.mjs       # prints a markdown report on stdout
```

Without a token it exits 1 with `discover: GITHUB_TOKEN is required` — that is the
instrument refusing to report, not an empty week. **It exits 0 with NO output when nothing
is missing**, which is how the workflow stays quiet on a normal day; the counts go to
stderr so "found nothing" and "looked at nothing" cannot produce the same output.

## The gate

`.github/workflows/discover.yml`, daily at 06:00 UTC. It **never edits `README.md`** — it
opens or updates one issue titled `Unlisted bb plugins`, rewritten in place each run, and
closes it when the sweep finds nothing. An auto-appended list of repo blurbs would be a
worse directory than none; an entry needs a human sentence and the right section.

The cadence is daily rather than weekly because of a coupling, not a wish for more sweeps:
the repo-steward pass that ACTS on the issue ticks Monday 00:20 Asia/Makassar = Sunday
16:20 UTC, seventeen hours *before* a Monday-09:00-UTC sweep would have run, so every
candidate sat unread for a full week.

## `discovery-ledger.json` is the memory, and it is load-bearing

Every judgement the sweep must not make again lives there. Without it the sweep re-proposes
everything anyone ever decided against, once a week, forever — `bb-plugin-attention` was
deliberately removed from the list and came back in the very next report. **A declined
plugin, a mirror, or a vendored copy goes in the ledger in the same change that declines
it.**

## Conventions that differ from the defaults

- **The unit is a PLUGIN, not a repo.** A monorepo has no `bb` key at its root, and
  deciding "already listed" per repo hid every plugin added to a listed monorepo
  afterwards. Enumerate the manifests inside a repo and compare each plugin against the
  README's entries — never repo URLs.
- **The bar is the README's own**: a `package.json` with a `bb` key, or a dependency on the
  plugin SDK. Nothing is listed on the strength of a repo name.
- **Four discovery sources on purpose** — name prefix, topic, description search, npm —
  because each fails differently, so one missing a plugin does not hide it.
- **Link the plugin's directory, not the repo root** (`.../tree/main/<path>`);
  `--subdirectory` installs work, so a precise link is something a reader can act on.
- **Entries are factual, one sentence, no marketing copy.** Where a plugin has a real
  hazard — an unchecked binary download, a PATH probe that accepts any same-named binary,
  a permission mode that answers its own prompts — the entry says so plainly.
- **When one plugin lives in two repos, link the upstream** and record the copy in the
  ledger. Every install check passes on a mirror, so a reproduction says nothing about
  provenance; compare `name`/`version` and hash the entry file.

**Nothing about who may merge, how agents are spawned, or how the maintainer's
machine handles secrets belongs in this file, and none of it is stated here.**
Those are properties of a working environment, not of this project; if you are
contributing, your own conventions apply and nothing in this repo depends on
the maintainer's.
