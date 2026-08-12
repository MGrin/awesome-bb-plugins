# Awesome bb plugins [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> Community plugins for [bb](https://getbb.app) — the agent IDE that builds itself.

bb ships 13 official plugins bundled inside the app and [deliberately has no remote
marketplace](https://github.com/get-bb/bb/pull/737), so third-party plugins are found by
word of mouth. This list is the missing directory.

**Two install forms.** Everything here installs from git:

```sh
bb plugin install git:https://github.com/<owner>/<repo>.git@main
```

Some now publish to npm as well — [16 packages carry the `bb-plugin`
keyword](https://www.npmjs.com/search?q=keywords:bb-plugin) as of 2026-08-12 — and where an
entry lists one, that is the shorter route:

```sh
bb plugin install npm:<package>
```

A plugin living in a subdirectory of a monorepo cannot be installed with the `git:` form at
all — bb reads the manifest at the repo root
([get-bb/bb#1097](https://github.com/get-bb/bb/issues/1097)). Use the npm package where the
entry names one, otherwise clone the repo and `bb plugin install <path>`.

([`@bb/plugin-sdk` itself is still unpublished](https://github.com/get-bb/bb/issues/1134);
plugins vendor it. That blocks the SDK, not the plugins.)

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
- [amp](https://github.com/smsunarto/bb-plugins/tree/main/plugins/amp) — Amp as an ACP provider through a bundled bridge over the official `@ampcode/sdk`; `/orb` in a thread's first prompt runs it in an Amp Orb sandbox, and Oracle sub-agent calls render as a card with a streaming trace. · npm `@smsunarto/bb-plugin-amp`

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
- [agentation](https://github.com/smsunarto/bb-plugins/tree/main/plugins/agentation) — click any element of the bb UI, including another plugin's surface, and file it as an annotation carrying the route, owning plugin id and DOM selector; staged batches are assigned to a thread from its composer, and agent tools acknowledge, reply to and resolve them. · npm `@smsunarto/bb-plugin-agentation`
- [t3sidebar](https://github.com/smsunarto/bb-plugins/tree/main/plugins/t3sidebar) — replaces the sidebar thread list with a flat inbox that never re-orders; snooze a thread to a wake time or settle it, which also archives it in bb, and live work blocks parking. Forked from bb's own `examples/plugins/t3sidebar` and built on experimental SDK slots. · npm `@smsunarto/bb-plugin-t3sidebar`
- [Thread tasks](https://github.com/ariofrio/bb-plugins/tree/main/plugins/bb-plugin-thread-tasks) — replaces the sidebar thread list with manually ordered Done/To do/Working/Waiting/Deferred/Canceled sections, moves a thread to Working when its turn starts and back to To do when it stops or blocks on the user, and adds `.` status chords plus a `bb task list|show|update` CLI.
- [Missing keyboard shortcuts](https://github.com/ariofrio/bb-plugins/tree/main/plugins/bb-plugin-missing-keyboard-shortcuts) — adds the shortcuts bb does not bind: ⌘[/⌘] for browser history, ⌘N/⇧⌘N for a new thread with or without the current thread's project, ⌘L to focus the primary composer, and ⇧⌘L / ⌃` to toggle a side chat or thread terminal.
- [emoji-react](https://github.com/patleeman/bb-plugins) — adds one emoji button per configured reaction to the assistant-message text-selection menu; clicking one drafts a reply quoting the highlighted text.
- [bb-plugin-writing-check](https://github.com/qiantao94/bb-plugin-writing-check) — checks each English message you send for spelling and grammar in a hidden worker thread and inserts the corrections below the message; explanations are written in Simplified Chinese.

## Editing & files

- [bb-plugin-files](https://github.com/Diffuzmetall/bb-plugin-files) — file browser and editor for a thread's environment.
- [bb-plugin-filetree](https://github.com/rekon307/bb-plugin-filetree) — lazy-loading file tree in the side panel.
- [bb-plugin-md-annotate](https://github.com/DarrenTsung/bb-plugin-md-annotate) — Google-Docs-style inline comments on markdown.
- [excalidraw](https://github.com/patleeman/bb-plugins) — Excalidraw boards inside bb.
- [bb-plugin-excalidraw](https://github.com/Diffuzmetall/bb-plugin-excalidraw) — opens a workspace `.excalidraw` file as a canvas, with SHA-256 compare-and-swap agent tools, a `bb excalidraw` read/create/apply CLI, and a diagram-design skill. Third-party, despite the repo description calling it official.

## Code intelligence

- [bb-plugin-code-intelligence](https://github.com/mywwave/bb-plugin-code-intelligence) — tree-sitter code search and impact analysis. **(unmaintained — upstream archived the repo)**
- [design-doctrine](https://github.com/brsbl/bb-plugins) — design guidance for agents.

## Host & environment

- [bb-plugin-system](https://github.com/MGrin/bb-plugin-system) — CPU, memory, disk and top processes as a panel, homepage tiles and a `bb system` CLI.
- [bb-plugin-worktree-setup](https://github.com/KaviiSuri/bb-plugin-worktree-setup) — per-repo worktree provisioning and git hooks.
- [browser](https://github.com/jssblck/bb-plugins) — shared Chrome over CDP.
- [bb-plugin-browser](https://github.com/MGrin/bb-plugin-browser) — drives a browser you already have (Brave, Chrome, Chromium, Edge, Vivaldi or Opera) over CDP on a profile of its own, headless by default; each thread gets its own tab named by CDP target id, so tabs survive plugin reloads and bb restarts, threads share cookies and logins but can never move each other's page, `browser_show` relaunches on screen when a login wall or CAPTCHA needs you, and the idle reaper only ever closes tabs the plugin opened.
- [stay-awake](https://github.com/jssblck/bb-plugins) — keep the host awake while work runs.
- [codex-environments](https://github.com/jssblck/bb-plugins) — Codex environment management.
- [bb-plugin-accounts](https://github.com/MGrin/bb-plugin-accounts) — Claude Max account usage and auto-switching, with thread auto-continue after a rate limit.
- [bb-plugin-cf-tunnel](https://github.com/MGrin/bb-plugin-cf-tunnel) — reach bb remotely over your own Cloudflare Tunnel and Access policy, with expiring shared ports.
- [agent-proxy](https://github.com/smsunarto/bb-plugins/tree/main/plugins/agent-proxy) — installs CLIProxyAPI and keeps it running as a launchd/systemd login service, so several Claude and Codex accounts answer on one loopback OpenAI/Anthropic/Gemini endpoint; OAuth sign-in, provider keys, usage and Claude Code/Codex wiring in a panel, plus a `bb agent-proxy` CLI. It installs a third-party binary as a login service that outlives bb. · npm `@smsunarto/bb-plugin-agent-proxy`
- [usage-tracker](https://github.com/MateoCerquetella/bb-plugins/tree/main/plugins/usage-tracker) — Codex and Claude Code usage percentages in a sidebar footer strip that expands to the 5-hour and weekly windows with reset times. · npm `bb-plugin-usage-tracker`
- [bb-plugin-usage](https://github.com/MayankBansal12/bb-plugin-usage) — token counts and estimated API cost per agent, model provider and machine, read from Codex, Claude Code, Grok, OpenCode and Pi session logs on every enrolled host.

## Memory & knowledge

- [bb-plugin-memory-ui](https://github.com/MGrin/bb-plugin-memory-ui) — browse, search, edit, pin and forget bb memories, with version history.

## Notifications

- [bb-plugin-ios-notifications](https://github.com/vburojevic/bb-plugin-ios-notifications) — Web Push to your iPhone when a thread finishes or fails.
- [bb-plugin-notify](https://github.com/agustif/bb-plugin-notify) — agent-to-user pings as an in-app toast or a webhook, with quiet hours.
- [notify](https://github.com/smsunarto/bb-plugins/tree/main/plugins/notify) — native macOS notifications when a thread finishes or fails, posted by the bb window so they carry bb's icon and click through to the thread; holds them in a durable queue while bb is closed, plus a `notify_user` tool and a `bb notify` command. · npm `@smsunarto/bb-plugin-notify`

## Integrations

- [bb-plugin-linear](https://github.com/thonythony/bb-plugin-linear) — Linear issues, start a thread from one.
- [linear](https://github.com/galligan/bb-plugin-studio/tree/main/plugins/linear) — search Linear issues from the prompt box and attach agent-ready context.
- [telemetry](https://github.com/patleeman/bb-plugins) — usage telemetry.
- [bb-plugin-exec-tracking](https://github.com/pixexid/llm-collab) — records provider/model/reasoning evidence per run.
- [bb-plugin-argocd](https://github.com/Willhong/bb-plugin-argocd) — read-only Argo CD browser: application sync and health, managed resources, deploy history and pod logs, with agent tools and a `bb argocd` CLI.
- [bb-plugin-jenkins](https://github.com/Willhong/bb-plugin-jenkins) — Jenkins jobs, builds and console logs as a panel, with agent tools, a `bb jenkins` CLI, and build triggering behind a confirmation.
- [bb-slop-cop](https://github.com/SawyerHood/bb-slop-cop) — polls GitHub for PRs matching rules you define, dispatches a bb agent to review each match, and posts the review with `gh`; new rules run in shadow mode and only review authors with write access.
- [gh-stack](https://github.com/smsunarto/bb-plugins/tree/main/plugins/gh-stack) — drives `gh stack` in a thread's workspace: a layer rail with each PR's state and `+N −M` diff, checkout with auto-stash, draft toggle, sync/submit/merge/prune, and a button that hands the split to the thread's agent. · npm `@smsunarto/bb-plugin-gh-stack`
- [taskboard](https://github.com/MateoCerquetella/bb-plugins/tree/main/plugins/taskboard) — per-project GitHub, Linear or Jira issues as a list or kanban board, with drag-to-move through the provider's own statuses, a `bb taskboard` CLI, and a mention that attaches a task's context to a prompt. · npm `bb-plugin-taskboard`

## Appearance

- [bb-plugin-ayu](https://github.com/vburojevic/bb-plugin-ayu) — ayu themes plus a palette explorer.
- [bb-plugin-sidebar-sync](https://github.com/MGrin/bb-plugin-sidebar-sync) — keeps the sidebar arrangement — nav order, hidden rows, collapsed sections — the same in every bb UI; width and open state stay per-device.
- [ds4](https://github.com/patleeman/bb-plugins) — design-system theming.
- [bb-plugin-fontsize](https://github.com/jmporchet/bb-plugin-fontsize) — scales the whole interface from a sidebar footer button that cycles 13/16/20/26px, plus a settings panel with ±1px control; the size is stored per device.
- [monokai](https://github.com/smsunarto/bb-plugins/tree/main/plugins/monokai) — dark Monokai palette that also repaints the terminal's 16 ANSI colors, the diff viewer's rows and gutters, the file tree's git-status column, inline code tokens and the composer stop button; dark appearance only. · npm `@smsunarto/bb-plugin-monokai`
- [Project header breadcrumb](https://github.com/ariofrio/bb-plugins/tree/main/plugins/bb-plugin-project-header-breadcrumb) — puts the project name before the thread title, with a menu for project settings, rename and remove.
- [Project icons](https://github.com/ariofrio/bb-plugins/tree/main/plugins/bb-plugin-project-icons) — gives each project an icon and optional color, picked from a 2,532-icon Hugeicons catalog and drawn before the project name in the thread header.

## Fun

- [bb-plugin-strudel](https://github.com/SawyerHood/bb-plugin-strudel) — Strudel live-coding music REPL, with agents.
- [bb-plugin-ambient-live](https://github.com/kieranklaassen/ambient-live) — sample-browser ambient DAW.

## Authoring tools

- [bb-mate](https://github.com/galligan/bb-plugin-studio/tree/main/plugins/mate) — fixture-driven plugin authoring workbench, run against a supervised bb-mate runtime.
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
