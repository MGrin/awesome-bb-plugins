# Awesome bb plugins [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> Community plugins for [bb](https://getbb.app) — the agent IDE that builds itself.

bb ships 18 official plugins bundled inside the app and [retired its own remote
marketplace](https://github.com/get-bb/bb/pull/737) rather than running a central one, so
third-party plugins are found by word of mouth. This list is the missing directory.

**Install forms.** Everything here installs from git:

```sh
bb plugin install git:https://github.com/<owner>/<repo>.git@main
```

Some publish to npm as well — [27 packages carry the `bb-plugin`
keyword](https://www.npmjs.com/search?q=keywords:bb-plugin) as of 2026-08-25 — and where an
entry lists one, that is the shorter route:

```sh
bb plugin install npm:<package>
```

A plugin living in a subdirectory of a monorepo used to be installable by neither, because
bb read the manifest at the repo root. That was fixed in
[get-bb/bb#1097](https://github.com/get-bb/bb/issues/1097), closed 2026-08-14 — name the
directory and the `git:` form works:

```sh
bb plugin install git:https://github.com/<owner>/<repo>.git@main --subdirectory <path>
```

A repo carrying a `marketplace.json` catalog can also be added as a self-hosted marketplace,
after which its plugins install by name. bb runs no central marketplace, but it reads
third-party ones:

```sh
bb marketplace add git:github.com/<owner>/<repo>
bb plugin install <entry>@<marketplace>
```

Adding a marketplace installs nothing and runs no plugin code; a catalog entry is not
reviewed by bb, and the install confirmation names the marketplace, the author and the exact
resolved source.

(The plugin SDK was renamed and published as
[`@get-bb/plugin-sdk`](https://www.npmjs.com/package/@get-bb/plugin-sdk) —
[get-bb/bb#1134](https://github.com/get-bb/bb/issues/1134), closed 2026-08-14 — so a plugin
can depend on it instead of vendoring the types. `@bb/plugin-sdk` under the old name is
still absent from npm; entries written before the rename vendor it and are unaffected.)

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
- [bb-plugin-copilot](https://github.com/balazstasi/bb-plugin-copilot) — writes a managed `customAcpAgents` entry into bb's `config.json` so `copilot --acp --stdio` runs as provider `acp-copilot` through bb's own ACP client; a missing Copilot CLI is reported as needs-configuration instead of a load failure. Note the PATH probe accepts any binary named `copilot` that answers `--version`, including the unrelated AWS ECS Copilot CLI.
- [bb-opencode](https://github.com/iamhenry/bb-opencode) — OpenCode as a provider over a detached `opencode serve` and the official `@opencode-ai/sdk` rather than bb's ACP guest: OpenCode agents picked in the composer, `/name` slash commands, permission asks on bb's native card, revert/redo, Task children bound to their own threads, and `bb opencode status|version|logs`. Pinned to OpenCode 1.18.x.

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
- [GTD Sidebar](https://github.com/smsunarto/bb-plugins/tree/main/plugins/gtd-sidebar) — replaces the sidebar thread list with an action-oriented inbox: a thread sits in Next Action or Waiting by whether you or the agent moves next, and snoozing it to a wake time or settling it shelves it. Renamed from t3sidebar at 0.4.0 — it installs under the new id as a separate plugin and shelves do not carry over, and `@smsunarto/bb-plugin-t3sidebar` is frozen at 0.3.0. Forked from bb's own `examples/plugins/t3sidebar` and built on experimental SDK slots. · npm `@smsunarto/bb-plugin-gtd-sidebar`
- [Thread stages](https://github.com/ariofrio/ribbon/tree/main/plugins/bb-plugin-thread-stages) — replaces the sidebar thread list with manually ordered Deferred/Idle/Active/Blocked/Completed stages; a thread moves to Active when a turn or background command starts anywhere in its hierarchy and back to Idle when none are running, while the other three are only ever set by hand. `.` chords file the open thread and walk you to the next one, ⇧⌘. undoes the last filing, and Completed auto-archives after 7 days by default. `bb thread-stages list|show|update` from the CLI. (Renamed from Thread tasks.)
- [Missing keyboard shortcuts](https://github.com/ariofrio/ribbon/tree/main/plugins/bb-plugin-missing-keyboard-shortcuts) — adds the shortcuts bb does not bind: ⌘[/⌘] for browser history, ⌘N/⇧⌘N for a new thread with or without the current thread's project, ⌘L to focus the primary composer, and ⇧⌘L / ⌃` to toggle a side chat or thread terminal.
- [emoji-react](https://github.com/patleeman/bb-plugins) — adds one emoji button per configured reaction to the assistant-message text-selection menu; clicking one drafts a reply quoting the highlighted text.
- [bb-plugin-writing-check](https://github.com/qiantao94/bb-plugin-writing-check) — checks each English message you send for spelling and grammar in a hidden worker thread and inserts the corrections below the message; explanations are written in Simplified Chinese.
- [Agent Checklists](https://github.com/patleeman/bb-plugins/tree/main/packages/bb-plugin-agent-checklists) — gives a thread a persisted list of steps the agent reads and ticks off through `agent_checklist_get` / `agent_checklist_update`, with progress in the workbench and a read-only detail view; state lives in the plugin's own SQLite store.
- [Comprehension](https://github.com/patleeman/bb-plugins/tree/main/packages/bb-plugin-comprehension) — turns a message, a text selection or a whole thread into an HTML explainer, from a message action or the thread header. Needs bb ≥ 0.38.
- [Plannotator](https://github.com/patleeman/bb-plugins/tree/main/packages/bb-plugin-plannotator) — embeds the upstream [Plannotator](https://github.com/backnotprop/plannotator) plan-review app in the thread panel and hands its approval or feedback back to the agent via a `plannotator_review_plan` tool; you supply the Plannotator binary yourself.
- [Cascade](https://github.com/SawyerHood/bb-plugin-cascade) — niri-style scrollable tiling: every live thread is a column in a horizontally scrolling strip, rows group those columns by section, project or machine, and `hjkl` moves while `HL` reorders.
- [T3 Sidebar](https://github.com/SawyerHood/bb-plugin-t3sidebar) — inbox-style replacement for the sidebar thread list, and the reference example for `app.slots.experimental_threadList` published standalone from bb's own examples; bb's list comes back the moment you switch away. · npm `bb-plugin-t3sidebar`
- [Dispatch](https://github.com/slogsdon/bb-plugin-dispatch) — expands a one-liner into a full prompt and routes it to the right project as a new thread, from the new-thread composer.
- [Arc Switcher](https://github.com/bighitbiker3/bb-plugin-arc-switcher) — ⌘D cycles the seven most recently opened threads, Arc-style; each one keeps a stable emoji marker so it stays recognisable as the most-recent order shuffles under it. Ships no LICENSE, so strictly nobody has been granted the right to use it yet.
- [UltraGoal](https://github.com/braedonsaunders/bb-plugin-ultragoal) — keeps a durable objective on a thread and staffs it: the orchestrator posts the remaining work as a dependency DAG where each slice declares its own file scope, a runnable done-gate and its deps, and the plugin's scheduler spawns one fresh worker per ready slice up to a slot count, re-staffs dead workers, streams audit findings into fix slices, and by default sends each finished slice to a second model to verify before it closes. `bb ultragoal` CLI and a plan pane; Codex threads are left alone, since Codex has native Goal. It hides worker threads by mutating bb's sidebar DOM directly and builds on experimental SDK slots, so it is more exposed to bb UI churn than most entries, and the repo was three days old when it was listed.
- [Tinted Threads](https://github.com/grrowl/bb-tinted-threads) — replaces the sidebar thread list with rows tinted red when a thread is blocked on input or errored and green while work is running, grouped by project with sub-threads nested under their parent; subtitles carry provider and model, a workspace label, uncommitted diffstat and PR checks and review state, and a right-click menu opens the thread's pull request. Ships no LICENSE, so nobody has been granted the right to use it yet.
- [Bots](https://github.com/prakashchokalingam/bb-plugin-bots) — saved bots each with their own instructions, provider, model and reasoning level; starting a chat spawns an ordinary bb thread and injects that bot's instructions into every turn of it, and deleting a bot leaves its chats behind without the persona.
- [Handoff](https://github.com/vburojevic/bb-plugin-handoff) — moves a session in both directions — captures a thread's transcript from bb's provider-independent event log, renders it as a document and spawns a new thread on another installed provider, optionally on another enrolled machine with the uncommitted work carried as a patch; or adopts a Claude Code, Codex, Gemini CLI or OpenCode session that ran outside bb, local or remote, as a bb thread. Panel, `bb handoff` CLI and a bundled skill. Continuation is transcript-based, not a native resume, and the cross-machine patch is capped at 2 MB.
- [Stelow](https://github.com/calionauta/bb-plugin-stelow) — a Kanban board over [Stelow](https://github.com/calionauta/stelow) workflows: a card spawns a worker thread and moves to Gate pending while a structured question is open, gate approvals are written as `.stelow/approvals/<dirHash>/*-approved.md` receipts, `.md` artifacts open in a text-selection reviewer, and `bb stelow status|ask|seed|advance|preset` drives the same state from the CLI. Workflow state stays in `stelow.json`/`.stelow/`, so Stelow's skills must be installed separately. Ships no LICENSE.
- [Chief](https://github.com/dilipgv/bb-plugin-chief-nav) — runs threads as an org chart: one global Chief thread you talk to, a project chief it stands up per bb project, and a task architect spawned per task with a generated brief, each tier locked by `bb.agents.configure` to only the tools and skill its rank is allowed. A nav panel draws the tree beside the Chief chat using the host's own ThreadChat, and `bb chief status|handoff|workflow|retire|tidy` covers the same from the CLI. Reads the companion Command Center plugin over cross-plugin rpc for open questions and the harness the composer picked, and keeps working when it is absent. Ships no LICENSE, so strictly nobody has been granted the right to use it yet.
- [Command Center](https://github.com/dilipgv/bb-plugin-command-center) — a board joining the questions agents raise through `bb inbox ask` with the work you queue yourself; answers are delivered back into the asking thread, archiving a card archives the worker threads attached to its task, and a request dispatches to the separate `chief-nav` plugin or, when it is absent, to a directly spawned worker. Sends its own macOS banners through `osascript`, badges its own sidebar row with a content script because `navPanel` has no badge, and on load installs bb's Tasks plugin and `chief-nav` from a git URL without asking. Ships no LICENSE.
- [Kanban](https://github.com/frickadelle/bb-plugin-kanban) — a nav-panel board of every visible thread in every standard project, with the lane derived from bb runtime state and the environment's pull request: active is working, failed is blocked, and an idle thread lands in done, review or blocked by whether its PR is merged, open/draft or closed unmerged. Drag, keyboard drag or Move left/right buttons override a lane by hand and the ordering persists in the plugin's own SQLite store, a `kanban_transition` tool lets an agent move only its own thread, and a five-minute reconcile plus thread events keep it current. Ships no LICENSE, so strictly nobody has been granted the right to use it yet.
- [Context Meter](https://github.com/Hazihell/bb-plugin-context-meter) — a bar above the composer showing a thread's context tokens against a soft limit you set rather than the provider's full window, refreshed when a turn reports new usage, and rendered in the banner slot so it survives the compact layout that hides bb's own ring.
- [Project Instructions](https://github.com/Hazihell/bb-plugin-project-instructions) — per-project standing instructions appended to the system prompt of every thread in that project, kept in bb's per-plugin key-value storage instead of a committed `AGENTS.md`; a settings section that holds an unsaved draft per project and a `bb project-instructions get|set|clear|list` CLI write through one path, and both refuse text over bb's 4096-character contribution limit rather than letting bb truncate the tail silently.
- [hmps/bb-plugins](https://github.com/hmps/bb-plugins) — three fixes for bb's web UI on an iPhone, each installable on its own: `ios-composer-touch` cancels the focus transfer that costs iOS Safari a second tap on send and pads the composer buttons out to 44px, `ios-status-bar` parks a fixed rail in each safe area so Safari tints the status bar with `--background` instead of black, and `mobile-large-editor` rebuilds the "make prompt box larger" toggle the thread composer drops below 768px. Ships no LICENSE, and the release tags for the last two were never pushed, so those two install by `--subdirectory plugins/<name>` rather than from the repo's own marketplace. Its `t3sidebar` and `usage-tracker` are forks of plugins already listed here.
- [Pi Agent Switch](https://github.com/iamhenry/bb-plugin-pi-agent-switch) — adds a picker to the Pi composer that lists the primary agents found in Pi's and OpenCode's agent directories, shows which one the thread is running, and switches by sending `/agent <name>`; a pick made in the new-thread composer is replayed once the thread exists. Pi only.
- [Session Brief](https://github.com/iamhenry/bb-plugin-session-brief) — pins a card in the thread header with that thread's context fill, project branch and dirty files, child threads and pending todos, plus subscription remaining for the vendor of the model in use — read from the Pi, OpenCode or Grok OAuth sessions already on disk, access token only, never refreshed. Built on an experimental SDK slot.
- [Autobahn](https://github.com/jhbarnett/bb-autobahn) — a Kanban board whose cards are threads in Open/WIP/R4R/Closed lanes, where a Driver agent dispatches ready work into free WIP capacity, runs planning and verification as hidden child threads on disposable managed worktrees, and stops at a human approval form before a card closes; workflow state and an append-only event ledger live in the plugin's SQLite, and the Open lane merges controller threads with unstarted GitHub issues read through the official GitHub plugin. Ships no LICENSE, so strictly nobody has been granted the right to use it yet.
- [Council](https://github.com/patleeman/bb-plugins/tree/main/packages/bb-plugin-council) — convenes a council of advisor agents: three seeded personas, each spawned as its own bb thread, run through discussion rounds whose `STANCE:` / `VOTE:` / `PASS:` lines are tallied into a verdict with a dissent section; `council_deliberate` and `council_register_vote` tools plus a `bb council` CLI.
- [Recap](https://github.com/MacHatter1/bb-recap) — generates concise, display-only summaries for BB threads manually or after idle, with compact banner, recap card, on-demand display, and automatic cleanup.

## Editing & files

- [bb-plugin-files](https://github.com/Diffuzmetall/bb-plugin-files) — file browser and editor for a thread's environment.
- [bb-plugin-filetree](https://github.com/rekon307/bb-plugin-filetree) — lazy-loading file tree in the side panel.
- [Git Graph](https://github.com/GabZoFar/bb-plugin-git-graph) — read-only commit graph in a thread side panel, running git inside that thread's own environment — including one hosted on another connected machine, rather than on whichever repo the bb window happens to be pointing at.
- [bb-plugin-md-annotate](https://github.com/DarrenTsung/bb-plugin-md-annotate) — Google-Docs-style inline comments on markdown.
- [excalidraw](https://github.com/patleeman/bb-plugins) — Excalidraw boards inside bb.
- [bb-plugin-excalidraw](https://github.com/Diffuzmetall/bb-plugin-excalidraw) — opens a workspace `.excalidraw` file as a canvas, with SHA-256 compare-and-swap agent tools, a `bb excalidraw` read/create/apply CLI, and a diagram-design skill.
- [Server File Explorer](https://github.com/Willhong/bb-plugin-file-explorer) — read-only Files panel for the machine running the bb server, with folder navigation, an absolute-path bar, browser history and markdown shown rendered or raw.
- [bb-plugin-monaco](https://github.com/andrewkchan/bb-plugin-monaco) — replaces bb's read-only file preview with Monaco wherever a file opens — chat links, panel file search, `bb thread open` — saving on ⌘S behind a SHA-256 compare-and-swap that offers Reload or Overwrite instead of clobbering an edit the agent made, plus a filterable file tree and fold/sort/copy-path quick-palette rows. Ships no LICENSE, so strictly nobody has been granted the right to use it yet.

## Code intelligence

- [bb-plugin-code-intelligence](https://github.com/mywwave/bb-plugin-code-intelligence) — tree-sitter code search and impact analysis. **(unmaintained — upstream archived the repo)**
- [design-doctrine](https://github.com/brsbl/bb-plugins) — design guidance for agents.
- [Call Stacks](https://github.com/ebg1223/bb-plugin-callstack) — the agent publishes named call-stack flows into a thread panel, each frame carrying file:line, in/out types, the guarding condition, loop context and an added/modified/removed marker; publishing lints those frames against the workspace files, a re-hash on every thread idle flags frames whose files changed, and it ships a `bb callstack` CLI and a call-stack-driven-development skill.

## Host & environment

- [bb-plugin-system](https://github.com/MGrin/bb-plugin-system) — CPU, memory, disk and top processes as a panel, homepage tiles and a `bb system` CLI.
- [Wterm Terminal Preview](https://github.com/Diffuzmetall/bb-wterm-terminal-plugin) — early-preview Ghostty-backed alternative to bb's thread terminal with persistent reattachment, TUI mouse input, font controls and file upload for SSH and Herdr workflows. Drives bb's own terminal sessions rather than spawning its own, and uploads land in `.bb-wterm-uploads/` under the terminal's working directory. Built on an experimental SDK slot, so it is more exposed to bb UI churn than most entries.
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
- [Usage](https://github.com/iamEvanYT/bb-usage-page) — a second take on the same idea: Claude Code, Codex and Pi token usage and estimated cost in a nav panel and a CLI, read from local session logs on the host running bb.
- [Usage limits below chat](https://github.com/Willhong/bb-plugin-usage-limit) — one compact row under the composer showing the session and weekly limits of the provider selected in *that* composer — Codex, Claude Code or Cursor — with the signed-in account on the right.
- [Grok Usage](https://github.com/idrevnii/bb-plugin-grok-usage) — adds a Grok Build weekly-limit row to Settings → Usage limits, reusing the existing `grok login` session in `~/.grok/auth.json` instead of asking for another key.
- [Lanes](https://github.com/slogsdon/bb-plugin-lanes) — normalises Claude, Codex, OpenCode Zen Go and OpenRouter headroom into one set of gauges on the homepage and a nav panel; the last two are the lanes bb tracks nothing about.
- [Toolbox](https://github.com/patleeman/bb-plugins/tree/main/packages/bb-plugin-toolbox) — one registry for MCP servers and named CLI operations, re-exposed to any provider as bb agent tools and as a single aggregated MCP endpoint. Enabled entries run real commands, so read what you turn on.
- [bb-plugin-docker](https://github.com/grikomsn/bb-plugins/tree/main/packages/bb-plugin-docker) — containers, images, volumes and networks on a connected bb host in a nav panel, with container logs, one-shot exec, prunes that need an explicit `--yes`, and a `bb docker` CLI; the `docker` argv runs in a bundled host entry rather than in the bb server, so it follows the enrolled host and never goes through a shell.
- [Provider Usage](https://github.com/braedonsaunders/bb-plugin-provider-usage) — a live 15-minute throughput chart, binned per 10 seconds and attributed to the threads doing the work, next to remaining plan quota and reset windows from bb's own `system.usageLimits` and 7/30/90-day token volume read from Codex, Claude Code, Cursor and opencode transcripts — with bb's `thread/tokenUsage/updated` events covering any provider that has no scanner, so a new ACP agent charts itself; panel, homepage section, sidebar accessory and a `bb usage` CLI, plus a picker across paired machines.
- [tokenmaxx](https://github.com/pedroapfilho/bb-plugin-tokenmaxx) — dashboard for the third-party [tokenmaxx](https://github.com/RubricLab/tokenmaxx) daemon — every signed-in Codex and Claude Code account with its rate-limit windows and reset times, token throughput and cost analytics, manual switching, and auto-rotation with threshold, dwell and hysteresis; a sidebar figure carries how full the whole pool is, and daemon start/stop, routing install, `doctor` and provider login run through the CLI, login in a bb terminal you can type into. You must be running tokenmaxx yourself — the plugin does not install it.
- [Ports](https://github.com/ramaaudra/bb-plugin-ports) — listening TCP ports from every connected bb host in one panel, each grouped under the bb project source or environment whose path contains the process's working directory (longest path wins) and the rest under **External ports**; a row opens the port through a bb shared-port tunnel, falling back to `http://127.0.0.1:<port>` when no tunnel can be created, copies that URL, or SIGTERMs the process after a confirmation and a re-scan that checks the PID still owns the port. Reads `lsof` on each host, so TCP only, and a Linux or FreeBSD host needs it installed. Built on the experimental host-entry SDK surface, and ships no LICENSE.
- [Xcode](https://github.com/vburojevic/bb-plugin-xcode) — tracks every Xcode, `xcodebuild`, agent and CI build on the machine by watching toolchain processes and learning DerivedData roots from the builds themselves, with live rows above the composer, per-project history, and verdicts, compiler errors and failed tests at `file:line`; the same panel streams a booted simulator over hardware H.264 with tap, drag, pinch, paste and keyboard, and renders every SwiftUI preview to diff against the last run (that tab needs EmergeTools SnapshotPreviews added to your project). Agent tools that run builds or touch a simulator stay unregistered until you switch them on. Only works when the bb server itself runs on macOS.
- [Skills.sh](https://github.com/charpeni/bb-plugins/tree/main/plugins/skills-sh) — installs skills.sh skills into bb's own global skills directory (`<data-dir>/skills`) so every agent bb runs picks them up, instead of per-tool copies under `.claude/` or `.codex/`; a sidebar panel and a `bb skills add|list|check|update|remove|find` CLI mirror the `npx skills` commands, and check/update compare the git tree SHA of each installed skill folder against its source so only drifted skills are rewritten.
- [iOS Simulators](https://github.com/faultables/bb-plugins/tree/main/plugins/ios-simulators) — boots, shuts down and streams iOS simulators from a thread panel, keeping a [baguette](https://github.com/tddworks/baguette) server alive with a watchdog that remembers the pid it spawned across plugin reloads, and embedding the stream through a loopback proxy that strips the `frame-ancestors 'none'` header baguette sends; you supply the baguette binary. Ships no LICENSE.
- [Traces](https://github.com/patleeman/bb-plugins/tree/main/packages/bb-plugin-traces) — indexes the agent session logs already on disk — Codex, Claude Code, Pi, OMP and dsh — into its own SQLite store and browses sessions and per-event trajectories in a nav panel, on every enrolled host.
- [UA Fetch](https://github.com/patleeman/bb-plugins/tree/main/packages/bb-plugin-ua-fetch) — a `web_fetch` agent tool that classifies a blocked or bot-walled response and re-probes it with a set of crawler User-Agents, caching the winning one per host.

## Memory & knowledge

- [bb-plugin-memory-ui](https://github.com/MGrin/bb-plugin-memory-ui) — browse, search, edit, pin and forget bb memories, with version history.

## Notifications

- [bb-plugin-ios-notifications](https://github.com/vburojevic/bb-plugin-ios-notifications) — Web Push to your iPhone when a thread finishes or fails.
- [bb-plugin-notify](https://github.com/agustif/bb-plugin-notify) — agent-to-user pings as an in-app toast or a webhook, with quiet hours.
- [notify](https://github.com/smsunarto/bb-plugins/tree/main/plugins/notify) — native macOS notifications when a thread finishes or fails, posted by the bb window so they carry bb's icon and click through to the thread; holds them in a durable queue while bb is closed, plus a `notify_user` tool and a `bb notify` command. · npm `@smsunarto/bb-plugin-notify`
- [Chime](https://github.com/gtramontina/bb-plugin-chime) — plays a short sound when a thread's turn starts, finishes, fails, asks a question or requests approval; each of the six events has its own toggle and sound from Calm/Glass/Wood/Minimal themes, a one-second window collapses storms in favour of questions, approvals and failures, and only one tab per browser origin sounds — or the bb host does, through `afplay` on macOS.

## Integrations

- [linear](https://github.com/galligan/bb-plugins/tree/main/plugins/linear) — search Linear issues from the prompt box and attach agent-ready context.
- [bb-plugin-linear](https://github.com/vburojevic/bb-plugin-linear) — the deeper of the two Linear entries: issues, inbox, triage, projects and cycles in a nav panel, each thread bound to the issue it works on in the header and in the agent's own context, and a dozen `linear_*` tools covering search, comment and issue create/update.
- [Shortcut](https://github.com/andreasmcdermott/bb-plugin-shortcut) — the Shortcut stories assigned to you as a compact kanban grouped by workflow state, with `shortcut_list_assigned` / `shortcut_get_story` agent tools and a hand-off into a thread; the API token is a secret setting.
- [Beads](https://github.com/olegtaratuhin/bbb) — browse and update [Beads](https://beads.gascity.com/) issues in a project panel, shelling out to the `bd` CLI as the source of truth rather than keeping its own copy; Beads must already be installed.
- [bb-plugin-jenkins](https://github.com/suhye0n/bb-plugin-jenkins) — a second Jenkins plugin, aimed at deploys rather than browsing: star the jobs you ship, group them into your own folders, and fire parameterised builds or saved presets in one click, with live status on the homepage.
- [telemetry](https://github.com/patleeman/bb-plugins) — usage telemetry.
- [bb-plugin-exec-tracking](https://github.com/pixexid/llm-collab) — records provider/model/reasoning evidence per run.
- [bb-plugin-argocd](https://github.com/Willhong/bb-plugin-argocd) — read-only Argo CD browser: application sync and health, managed resources, deploy history and pod logs, with agent tools and a `bb argocd` CLI.
- [bb-plugin-jenkins](https://github.com/Willhong/bb-plugin-jenkins) — Jenkins jobs, builds and console logs as a panel, with agent tools, a `bb jenkins` CLI, and build triggering behind a confirmation.
- [bb-slop-cop](https://github.com/SawyerHood/bb-slop-cop) — polls GitHub for PRs matching rules you define, dispatches a bb agent to review each match, and posts the review with `gh`; new rules run in shadow mode and only review authors with write access.
- [gh-stack](https://github.com/smsunarto/bb-plugins/tree/main/plugins/gh-stack) — drives `gh stack` in a thread's workspace: a layer rail with each PR's state and `+N −M` diff, checkout with auto-stash, draft toggle, sync/submit/merge/prune, and a button that hands the split to the thread's agent. · npm `@smsunarto/bb-plugin-gh-stack`
- [taskboard](https://github.com/MateoCerquetella/bb-plugins/tree/main/plugins/taskboard) — per-project GitHub, Linear or Jira issues as a list or kanban board, with drag-to-move through the provider's own statuses, a `bb taskboard` CLI, and a mention that attaches a task's context to a prompt. · npm `bb-plugin-taskboard`
- [GitHub Activity](https://github.com/brsbl/bb-plugins/tree/main/plugins/github-notifications) — comments and mentions on the GitHub pull requests and issues you authored, in one searchable panel that keeps open and resolved activity together; shells out to the `gh` CLI (`gh api graphql`), so GitHub CLI must already be installed and authenticated, and resolved state lives in the plugin's own KV store.
- [Shortcut Agent](https://github.com/andreasmcdermott/shortcut-agent-cli/tree/main/plugins/bb-plugin-shortcut-epic) — the Epic-scoped counterpart to the Shortcut entry: one Epic's stories as a nav-panel dependency graph split into ready, active, blocked and done, with a `bb shortcut-agent` CLI and `shortcut_agent_*` tools to claim, complete, release and link stories, and a Start work menu item that spawns a bb thread carrying the story's description; every write stays off until Enable agent mutations is set.
- [Jira](https://github.com/evgenii-sergeev/bb-plugin-jira) — Jira Cloud synced into a local SQLite cache: a projects grid, a filterable issue list with inline editing, versions behind a release gate that refuses to ship while attached issues are still open, an activity feed derived from changelogs and comments, read-only `jira_*` agent tools and a `bb jira` CLI.
- [Jira Card](https://github.com/evgenii-sergeev/bb-plugin-jira-card) — renders `::jira-card{key=ABC-123}` in an assistant reply as a live Jira issue card — status, priority, assignee, Open in Jira, Refresh, and a Summarize button that runs a hidden thread over the description and comments; a `jira_card` tool and `bb jira-card show|refresh` return the same fields plus the directive to emit, and snapshots are cached for five minutes so scrolling history does not re-hit Jira.

## Appearance

- [bb-plugin-ayu](https://github.com/vburojevic/bb-plugin-ayu) — ayu themes plus a palette explorer.
- [bb-plugin-sidebar-sync](https://github.com/MGrin/bb-plugin-sidebar-sync) — keeps the sidebar arrangement — nav order, hidden rows, collapsed sections — the same in every bb UI; width and open state stay per-device.
- [ds4](https://github.com/patleeman/bb-plugins) — design-system theming.
- [bb-plugin-fontsize](https://github.com/jmporchet/bb-plugin-fontsize) — scales the whole interface from a sidebar footer button that cycles 13/16/20/26px, plus a settings panel with ±1px control; the size is stored per device.
- [monokai](https://github.com/smsunarto/bb-plugins/tree/main/plugins/monokai) — dark Monokai palette that also repaints the terminal's 16 ANSI colors, the diff viewer's rows and gutters, the file tree's git-status column, inline code tokens and the composer stop button; dark appearance only. · npm `@smsunarto/bb-plugin-monokai`
- [Breadcrumbs](https://github.com/ariofrio/ribbon/tree/main/plugins/bb-plugin-breadcrumbs) — puts a thread's section, project and ancestor threads before its title in the header, each part toggled on its own; the project name opens settings, rename and remove, and the section name opens what bb's own sidebar section header opens. Ancestors are off by default, and a fork is not an ancestor — bb gives it a `sourceThreadId` rather than a parent. (Renamed from Project header breadcrumb.)
- [Icons](https://github.com/ariofrio/ribbon/tree/main/plugins/bb-plugin-icons) — gives every project and thread section an icon and optional color, picked from a 2,530-icon Hugeicons catalog — the same set bb draws its own chrome from — and drawn wherever bb names a project or section, including Thread stages' sidebar rows. (Renamed from Project icons, and now covers sections too.)
- [Cobalt2](https://github.com/patleeman/bb-plugins/tree/main/packages/bb-plugin-cobalt2) — the Cobalt2 palette as a bb theme; CSS only, no server behaviour.
- [Agent Orbs](https://github.com/fahmiirsyadk/bb-plugins/tree/main/plugins/agent-orbs) — gives each active child thread a stable identity: a generated Oreo avatar and a friendly codename.
- [Composer Beam](https://github.com/fahmiirsyadk/bb-plugins/tree/main/plugins/composer-beam) — draws an animated beam around a composer while its thread is running or submitting. Frontend only.
- [Fluid Thinking](https://github.com/fahmiirsyadk/bb-plugins/tree/main/plugins/fluid-thinking) — replaces only the `Thinking…` / `Working…` indicator with the morphing Fluid Functionalism one.
- [Mesh Gradient](https://github.com/brsbl/bb-plugins/tree/main/plugins/mesh-gradient) — a mesh-gradient studio in a thread's right panel: drag, recolor and reshuffle radial-gradient points, preview the result as an OG card, hero or avatar with a WCAG readability badge, save to a shared library that both an `@gradient` mention and a `mesh_gradient` agent tool read, export PNG, CSS/SVG or design tokens into the thread's checkout, and install its six palettes as bb themes.
- [Thread Provider Icons](https://github.com/braedonsaunders/bb-plugin-thread-provider-icons) — draws each thread's provider mark before its title in the sidebar, in the provider's own brand colour, with unknown `acp-*` agents falling back to a generic ACP mark and labelled from their provider id; it takes the exclusive `experimental_threadList` slot to wrap bb's own list, so it cannot run alongside another thread-list replacement.
- [ChatGPT theme](https://github.com/ariofrio/ribbon/tree/main/plugins/bb-plugin-chatgpt-theme) — repaints bb in the OpenAI ChatGPT (Codex) desktop palette, one stylesheet covering light and dark plus the terminal's 16 ANSI colors and their readable foregrounds, with values read from the live Codex DOM rather than pixel-sampled; colors and shadows only, no dimensions or positions.
- [Message Timestamps](https://github.com/bighitbiker3/bb-plugin-message-timestamps) — puts the send time on your own messages — a clock time today, `Yesterday`/a date for older ones, and the full date on hover; the server pages the thread timeline for user-sent rows and a content script paints the time onto bb's own chat DOM by matching its Tailwind class names, so a bb restyle drops the times rather than erroring. Ships no LICENSE.
- [Image Preview](https://github.com/Dwite/bb-plugin-image-preview) — restyles images in chat messages: one image becomes a capped thumbnail, several in the same message become a grid of up to four tiles with a `+N` badge, and clicking or pressing Enter opens a lightbox with arrow-key navigation; image-file links in a message get a generated thumbnail too. Frontend content script only — the server entry just logs. Ships no LICENSE, so strictly nobody has been granted the right to use it yet.
- [Fonts](https://github.com/gtramontina/bb-plugin-fonts) — sets an installed font family per role — interface, code and serif — plus each role's size, weight, style, line height and letter spacing, written over the theme's `--font-sans`/`--font-mono`/`--font-serif` and text-size variables so the type survives a palette change; the family list comes from Chromium's Local Font Access API with manual family entry where that is unavailable, and settings live in the client's own `localStorage`, synced across windows over `BroadcastChannel`. The server entry only logs, so no font catalog leaves the client.

## Fun

- [bb-plugin-strudel](https://github.com/SawyerHood/bb-plugin-strudel) — Strudel live-coding music REPL, with agents.
- [bb-plugin-ambient-live](https://github.com/kieranklaassen/ambient-live) — sample-browser ambient DAW.

## Authoring tools

- [Plugin Studio](https://github.com/galligan/bb-plugin-studio/tree/main/plugins/studio) — inspect the plugins your bb has actually loaded from a nav panel: a read-only snapshot of their source and status, taken in-process rather than by starting a second runtime.
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
- Put every runtime import in `dependencies`, not `devDependencies` — `zod` above all. Managed
  installs run `npm install --omit=dev`, so a `devDependencies` entry that `server.ts` imports
  fails the build and the plugin cannot be installed at all. This is the single most common
  breakage on this list.
- The exception is the frontend modules **bb injects itself**. Its build rewrites those imports
  to `globalThis.__bbPluginRuntime` and never resolves them from `node_modules`, so they are
  safe in `devDependencies` and belong there. Read off bb 0.39.0's own shim table on
  2026-08-25: `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime`,
  `react/jsx-dev-runtime`, `@get-bb/plugin-sdk/app`, `sonner`, `vaul`, `@pierre/diffs`,
  `@pierre/diffs/react`, and ten `@radix-ui/react-*` packages — alert-dialog, context-menu,
  dialog, dropdown-menu, hover-card, menubar, navigation-menu, popover, select, tooltip.
  `zod` is **not** on that list, which is exactly why it is the one that keeps breaking builds.
  Judge a plugin by whether a clean `npm install --omit=dev` plus `bb plugin build .` succeeds,
  not by reading its `package.json` — `react` and `sonner` in `devDependencies` look like the
  fatal mistake and are not it.
- `private: true` is fine and does **not** block a `git:` install — it only stops `npm publish`.
  (This entry used to claim the opposite. Verified against the installer's own steps on
  2026-08-15.) It does mean there is no npm package, which since
  [get-bb/bb#1097](https://github.com/get-bb/bb/issues/1097) closed no longer strands a plugin
  in a monorepo subdirectory: `--subdirectory` installs it from git.
- Ship a LICENSE. Without one, the default is all rights reserved, and a directory that tells
  people to install your plugin is asking them to do something you have not permitted.
- Ship a prebuilt `dist/` if you publish to npm: npm installs run `--ignore-scripts` and never build.
  Point `bb.server` at your **source** (`./server.ts`), not at `./dist/server.js` — a manifest that
  targets a committed artifact means the code that runs is not the code a reader reviews.

## Contributing

Pull requests welcome. One entry per plugin: link, then a single sentence describing what
it does, in the section that fits. Keep it factual — no marketing copy. A plugin qualifies
if its `package.json` has a `bb` key or it imports `@bb/plugin-sdk`.

## License

[CC0-1.0](LICENSE) — public domain.
