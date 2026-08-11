# Awesome bb plugins [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> Community plugins for [bb](https://getbb.app) — the agent IDE that builds itself.

bb ships 13 official plugins bundled inside the app and [deliberately has no remote
marketplace](https://github.com/get-bb/bb/pull/737), so third-party plugins are found by
word of mouth. This list is the missing directory.

**Everything here installs the same way** — there are no bb plugins on npm yet
([`@bb/plugin-sdk` isn't published](https://github.com/get-bb/bb/issues/1134)):

```sh
bb plugin install git:https://github.com/<owner>/<repo>.git@main
```

Plugins are full-trust code running in the bb server. Read the source before installing.

## Contents

- [Providers](#providers) · [Threads & workflow](#threads--workflow) · [Editing & files](#editing--files)
- [Code intelligence](#code-intelligence) · [Host & environment](#host--environment)
- [Memory & knowledge](#memory--knowledge) · [Notifications](#notifications)
- [Integrations](#integrations) · [Appearance](#appearance) · [Fun](#fun)
- [Authoring tools](#authoring-tools) · [Writing a plugin](#writing-a-plugin) · [Contributing](#contributing)

## Providers

- [bb-plugin-kimi](https://github.com/vburojevic/bb-plugin-kimi) — Kimi Code as an ACP provider.
- [bb-plugin-factory-droid](https://github.com/bentossell/bb-plugin-factory-droid) — Factory Droid as an ACP provider.
- [omp](https://github.com/patleeman/bb-plugins) — OMP provider integration.

## Threads & workflow

- [bb-plugin-advisor](https://github.com/salemsayed/bb-plugin-advisor) — reviews a coding thread with a second model in a hidden reviewer thread; a pre-final agent tool plus post-turn review, with findings that re-raise across turns until the reviewer re-checks and closes them.
- [bb-plugin-bus](https://github.com/MGrin/bb-plugin-bus) — peer messaging between threads; addressed sends wake the recipient with a real turn, so no listener process is needed.
- [bb-plugin-auto-sections](https://github.com/benegessarit/bb-plugin-auto-sections) — files task-keyed threads into sidebar sections automatically.
- [thread-organizer](https://github.com/brsbl/bb-plugins) — organize threads in the sidebar.
- [thread-hover-cards](https://github.com/brsbl/bb-plugins) — preview a thread on hover.
- [timeline-comments](https://github.com/brsbl/bb-plugins) — comment on the thread timeline.
- [bb-plugin-next-steps](https://github.com/portseif/bb-plugin-next-steps) — suggests next steps above an empty composer.
- [prompt-shaper](https://github.com/brsbl/bb-plugins) — improve a prompt before sending it.
- [auto-new-tab](https://github.com/patleeman/bb-plugins) · [sessions](https://github.com/patleeman/bb-plugins) · [prime-agent](https://github.com/patleeman/bb-plugins)
- [bb-plugin-todo](https://github.com/agustif/bb-plugin-todo) — hierarchical session todos with nested sub-tasks, `dependsOn`/`requires`, and dispatch to multiple agents.
- [bb-plugin-session-goal](https://github.com/agustif/bb-plugin-session-goal) — keeps a session's goal and success criteria on a composer card so they stay in view.

## Editing & files

- [bb-plugin-files](https://github.com/Diffuzmetall/bb-plugin-files) — file browser and editor for a thread's environment.
- [bb-plugin-filetree](https://github.com/rekon307/bb-plugin-filetree) — lazy-loading file tree in the side panel.
- [bb-plugin-md-annotate](https://github.com/DarrenTsung/bb-plugin-md-annotate) — Google-Docs-style inline comments on markdown.
- [excalidraw](https://github.com/patleeman/bb-plugins) — Excalidraw boards inside bb.

## Code intelligence

- [bb-plugin-code-intelligence](https://github.com/mywwave/bb-plugin-code-intelligence) — tree-sitter code search and impact analysis. **(unmaintained — upstream archived the repo)**
- [design-doctrine](https://github.com/brsbl/bb-plugins) — design guidance for agents.

## Host & environment

- [bb-plugin-system](https://github.com/MGrin/bb-plugin-system) — CPU, memory, disk and top processes as a panel, homepage tiles and a `bb system` CLI.
- [bb-plugin-worktree-setup](https://github.com/KaviiSuri/bb-plugin-worktree-setup) — per-repo worktree provisioning and git hooks.
- [browser](https://github.com/jssblck/bb-plugins) — shared Chrome over CDP.
- [stay-awake](https://github.com/jssblck/bb-plugins) — keep the host awake while work runs.
- [codex-environments](https://github.com/jssblck/bb-plugins) — Codex environment management.
- [bb-plugin-accounts](https://github.com/MGrin/bb-plugin-accounts) — Claude Max account usage and auto-switching, with thread auto-continue after a rate limit.
- [bb-plugin-cf-tunnel](https://github.com/MGrin/bb-plugin-cf-tunnel) — reach bb remotely over your own Cloudflare Tunnel and Access policy, with expiring shared ports.

## Memory & knowledge

- [bb-plugin-memory-ui](https://github.com/MGrin/bb-plugin-memory-ui) — browse, search, edit, pin and forget bb memories, with version history.

## Notifications

- [bb-plugin-ios-notifications](https://github.com/vburojevic/bb-plugin-ios-notifications) — Web Push to your iPhone when a thread finishes or fails.
- [bb-plugin-notify](https://github.com/agustif/bb-plugin-notify) — agent-to-user pings as an in-app toast or a webhook, with quiet hours.

## Integrations

- [bb-plugin-linear](https://github.com/thonythony/bb-plugin-linear) — Linear issues, start a thread from one.
- [linear](https://github.com/galligan/bb-mate) — an independent Linear integration.
- [telemetry](https://github.com/patleeman/bb-plugins) — usage telemetry.
- [bb-plugin-exec-tracking](https://github.com/pixexid/llm-collab) — records provider/model/reasoning evidence per run.
- [bb-plugin-argocd](https://github.com/Willhong/bb-plugin-argocd) — read-only Argo CD browser: application sync and health, managed resources, deploy history and pod logs, with agent tools and a `bb argocd` CLI.
- [bb-plugin-jenkins](https://github.com/Willhong/bb-plugin-jenkins) — Jenkins jobs, builds and console logs as a panel, with agent tools, a `bb jenkins` CLI, and build triggering behind a confirmation.

## Appearance

- [bb-plugin-ayu](https://github.com/vburojevic/bb-plugin-ayu) — ayu themes plus a palette explorer.
- [bb-plugin-sidebar-sync](https://github.com/MGrin/bb-plugin-sidebar-sync) — keeps the sidebar arrangement — nav order, hidden rows, collapsed sections — the same in every bb UI; width and open state stay per-device.
- [ds4](https://github.com/patleeman/bb-plugins) — design-system theming.

## Fun

- [bb-plugin-strudel](https://github.com/SawyerHood/bb-plugin-strudel) — Strudel live-coding music REPL, with agents.
- [bb-plugin-ambient-live](https://github.com/kieranklaassen/ambient-live) — sample-browser ambient DAW.

## Authoring tools

- [bb-mate](https://github.com/galligan/bb-mate) — fixture-driven plugin authoring workbench; the only bb tooling published to npm.
- [bb-smithers-workflows](https://github.com/benvenker/bb-smithers-workflows) — plugin verification and release-gate workflows.
- [create-plugin / validate-plugin-artifacts](https://github.com/brsbl/bb-plugins) — scaffolding and artifact validation scripts.

## Writing a plugin

`bb plugin new <name>` scaffolds one. The authoritative reference is the
`bb-plugin-authoring` skill shipped inside the app; `bb plugin types` writes the SDK
type declarations into your `types/` directory.

Conventions this ecosystem has settled on:

- Name the repo and package `bb-plugin-<thing>`.
- Tag the repo with the `bb-plugin` topic — that is currently the only way anyone finds you.
- Pin `engines.bbPluginSdk` (`^0.4.1` at time of writing); managed installs refuse a mismatch.
- Don't set `private: true` in `package.json` — it blocks installation.
- Ship a prebuilt `dist/` if you publish to npm: npm installs run `--ignore-scripts` and never build.

## Contributing

Pull requests welcome. One entry per plugin: link, then a single sentence describing what
it does, in the section that fits. Keep it factual — no marketing copy. A plugin qualifies
if its `package.json` has a `bb` key or it imports `@bb/plugin-sdk`.

## License

[CC0-1.0](LICENSE) — public domain.
