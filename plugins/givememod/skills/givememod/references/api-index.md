# API index

Every event a hook can take, every `$` method and every field of `next`, one line each, from the types of Claude Code 2.1.293. The types file of the running build stays the authority: grep it for the name to read the full declaration and its examples. Rebuild this file after an update with `python scripts/api_index.py <types file>` in the repository.

## Events (107)

| Event | What it is |
|---|---|
| `agent.list` | The argument of `$.agent.list()`. |
| `agent.offer` | Fires when the engine offers an agent type to the model, in the agent listing and again at dispatch; `next(e)` resolves to `{ isOffered: true }`. |
| `agent.register` | The argument of `$.agent.register(spec)`: the agent type as the plugin defined it. |
| `agent.spawn` | Fires when the Agent tool is about to start a subagent, everything decided and its model not yet resolved, and when a workflow script's `agent()` is about to start one (`e.workflow`): only a deny applies there. |
| `attribution.text` | Fires when the engine composes a git text the model is to write (`kind`: `commit`, `pr`, `exemption`, `remedy`); `next(e)` resolves to `{ text }`. |
| `audio.play` | The clip and how to play it (`shouldLoop`, `gain`); the signal does not cross. |
| `audio.speak` | The argument of `$.audio.speak(text, { voice })`. |
| `clock.after` | The argument of `$.clock.after(ms, fn)`: the wait before `fn`, which stays in the plugin's environment and runs once the dispatch resolves. |
| `clock.every` | The argument of `$.clock.every(ms, fn)`, dispatched once per period: `fn` runs each time a dispatch resolves, and the next period is asked. |
| `clock.now` | The argument of `$.clock.now()`. |
| `clock.sleep` | The argument of `$.clock.sleep(ms, { signal })`; the signal does not cross, it aborts the dispatch. |
| `command.describe` | Fires once per command, when the engine lists it for the typeahead and `/help`; `next(e)` resolves to `{ description, argumentHint, isHidden }`. |
| `command.list` | The argument of `$.command.list()`. |
| `command.register` | The argument of `$.command.register(spec)`. |
| `command.run` | Fires when a slash command is about to run (`/name args` typed, or a plugin's `$.command.run`); `next(e)` resolves to `{ text }`, its output. |
| `config.describe` | Fires once per `/config` row, when the menu lists it and for `$.config.list`; `next(e)` resolves to `{ label, description, isHidden }`. |
| `config.list` | The argument of `$.config.list()`. |
| `config.set` | Fires when a `/config` row is about to change, from the menu or a plugin's `$.config.set`; `next(e)` resolves to `{ value }` once written. |
| `engine.create` | Runs while `$` is being built, once per load or reload of this plugin and before any other hook of it; `next(e)` resolves to `$` built so far. |
| `env.get` | The argument of `$.env.get(name)`; `name` is identity, pinned. |
| `env.set` | The argument of `$.env.set(name, value)`; `name` is identity, pinned, and no `value` unsets. |
| `fs.ancestors` | The argument of `$.fs.ancestors({ names, of, below })`. |
| `fs.exists` | The argument of `$.fs.exists(path)`. |
| `fs.list` | The argument of `$.fs.list(path)`. |
| `fs.read` | The argument of `$.fs.read(path, { as })`: `as` is `text` unless the caller asked for `bytes`. |
| `fs.stat` | The argument of `$.fs.stat(path, { resolve })`: `resolve` is false unless the caller asked where the path lands. |
| `fs.write` | The argument of `$.fs.write(path, text)`. |
| `http.fetch` | The argument of `$.http.fetch(url, init)`. |
| `mcp.call` | The argument of `$.mcp.call(server, tool, args)`. |
| `mcp.connect` | The argument of `$.mcp.connect(server)`. |
| `model.classify` | The argument of `$.model.classify(text, labels, options)`. |
| `model.complete` | The argument of `$.model.complete(request, { signal })`, its text as strings and its blocks beside them (ModelCompleteInput). |
| `model.fork` | The argument of `$.model.fork(request)`. |
| `plugin.register` | Fires once per hooks module about to join the chain, at load (the set folded and built, nothing swapped in) and at reload; core allows. |
| `process.run` | The argument of `$.process.run(argv, init)`. |
| `process.spawn` | The argument of `$.process.spawn(request)`: the request itself. |
| `prompt.attachment` | Fires once per message the engine injects for the model on its own (a reminder, a mode transition, a mentioned file), as a request carries it. |
| `prompt.autocomplete` | Fires as the person types in the main prompt box, for the token at the cursor; `next(e)` resolves to `{ suggestions }`, rows for the typeahead. |
| `prompt.compose` | Fires when the engine renders a system prompt; `next(e)` resolves to `{ sections }`, each `{ id, text, scope }`, in the order they are sent. |
| `prompt.context` | Fires once per conversation, when the engine computes the context blocks its first user message carries; `next(e)` resolves to `{ blocks }`. |
| `prompt.edit` | Fires when the person edits the main prompt box: a key the editor took as an edit, or a paste; `next(e)` resolves the box the editor shows. |
| `prompt.fill` | Fires when a text is about to be put in the prompt box as the person's draft (a plugin's `$.prompt.fill`); `next(e)` writes it by `e.mode`. |
| `prompt.mention` | Fires once per path a prompt names after an `@`, a directory aside, before the engine reads it; `next(e)` reads it and resolves `{ type }`. |
| `prompt.read` | The argument of `$.prompt.read()`. |
| `prompt.section` | Fires once per named section of the system prompt, when the engine assembles it; `next(e)` resolves to `{ text }` as core computed it. |
| `prompt.submit` | Fires when a prompt is submitted, before the turn starts. |
| `prompt.suggest` | Fires when a text is proposed as the prompt box's dim suggestion, Tab to take: the engine's guess after a turn, or a plugin's `$.prompt.suggest`. |
| `session.append` | Fires once per row a conversation of this session keeps (a prompt, a response block, a tool result, a notice), before it is stored. |
| `session.attach` | Fires when a remote client joins the session's roster of attached surfaces: it said so (ui_attach), or it first asked to draw. |
| `session.authorize` | The argument of `$.session.authorize()`. |
| `session.compact` | Fires when the conversation is about to be compacted (`/compact`, the threshold, a plugin, or ahead of time); `next(e)` resolves `{ messages }`. |
| `session.cwd` | The argument of `$.session.cwd()`. |
| `session.detach` | Fires when a client leaves the roster: it detached, or the session ended with it attached (`e.reason`). |
| `session.end` | Fires once when the session ends (exit, /clear, resume, logout, signal, a `-p` run done), after its SessionEnd settings hooks; `e.reason` says which. |
| `session.id` | The argument of `$.session.id()`. |
| `session.measure` | Fires when the engine measures the session and a unit moved: after each main-thread turn, and when a rate-limit window moves a whole point. |
| `session.messages` | The argument of `$.session.messages(args)`: `{}` for the main conversation, `{ agentId }` for one of its agents, `as` for the form. |
| `session.model` | The argument of `$.session.model()`. |
| `session.receive` | Fires when a delivery reaches the session (a relay's event, a peer's message, a Remote Control prompt), before it is queued; `{ text }`. |
| `session.repo` | The argument of `$.session.repo()`. |
| `session.root` | The argument of `$.session.root()`. |
| `session.send` | Fires when a plain-text message is about to leave this conversation for another agent or session (the SendMessage tool, or `$.session.send`). |
| `session.start` | Fires once per process for each loaded plugin, before the first prompt, then once per fresh load of one (never `/clear`); `next(e)` is `{ cwd }`. |
| `session.surface` | The argument of `$.session.surface()`. |
| `session.surfaces` | The argument of `$.session.surfaces()`. |
| `session.turns` | The argument of `$.session.turns()`. |
| `session.usage` | The argument of `$.session.usage({ breakdown, columns })`. |
| `session.version` | The argument of `$.session.version()`. |
| `settings.read` | The argument of `$.settings.read({ source })`. |
| `skill.prompt` | Fires when the engine expands a skill's prompt for the model (`/name`, the Skill tool, a preload); `next(e)` resolves to `{ text }` as computed. |
| `state.get` | The argument of `$.state.get(ref)`: the reference itself, `plugin`, `key` and a family member's `id`; identity, pinned. |
| `state.set` | The argument of `$.state.set(ref, value, { ifVersion })`: the reference, the value, the condition, and `previous`, what stood there (the host's). |
| `store.delete` | The argument of `$.store.delete(key)`. |
| `store.get` | The argument of `$.store.get(key)`. |
| `store.keys` | The argument of `$.store.keys()`. |
| `store.set` | The argument of `$.store.set(key, value)`. |
| `telemetry.log` | Fires when a record is about to be logged to the destination `e.to` names: a built-in's `$.telemetry.log`, or the engine's own events. |
| `telemetry.mark` | Fires when one use of a feature is marked (`$.telemetry.mark`), as the CLI's own feature events mark one; always for `anthropic`, no `to`. |
| `tool.call` | Fires when the engine is about to run a tool. |
| `tool.check` | Fires when the engine decides whether a tool call may run, after the `tool.call` and PreToolUse hooks and before the mode settles an ask. |
| `tool.describe` | Fires once per tool, when the engine first renders the tool's schema in a session; `next(e)` resolves to `{ description, isDeferred? }`. |
| `tool.list` | The argument of `$.tool.list()`. |
| `tool.register` | The argument of `$.tool.register(spec)`. |
| `turn.abort` | The argument of `$.turn.abort({ turnId })`. |
| `turn.complete` | Fires when a model turn has ended, at the point its duration is reported; `next(e)` resolves to `{ text }`, the answer. |
| `turn.start` | Fires when a model turn begins, before its first model call; `next(e)` resolves to `{ turnId }`. |
| `turn.step` | Fires when the engine is about to send a model request of a turn, main's or a subagent's (`e.agentId`); `next(e)` resolves to the whole response. |
| `ui.blit` | The argument of `$.ui.blit(...)`: a Raster's `cells` or a keyed Image's `source`; a hook above may rewrite either with `next`, or `{ deny }`. |
| `ui.close` | The argument of `$.ui.close({ id })` with `origin` `plugin`; the engine raises it too, for the person (`person`) and an unload (`unload`). |
| `ui.copy` | The argument of `$.ui.copy({ text, surface })`, `surface` filled with the session's first when left out; rewritable, deniable, answerable. |
| `ui.fault` | Fires when a `Client` THIS plugin drew failed on a surface: its module did not load, its drawing failed, or its code failed after it had drawn. |
| `ui.focus` | Fires before a site's focus ring moves: the person's Tab, arrows or click in a `Pane` or the band; an `autoFocus` element taking it; `$.ui.focus`. |
| `ui.input` | Fires when an `Input` a render hook drew changes or is submitted; `e` is `{ plugin, element, component, surface, kind, value }`. |
| `ui.invalidate` | The argument of `$.ui.invalidate(event)`. |
| `ui.log` | The argument of `$.ui.log(text, { to })`; `to` is always present (UiLogSink), and `next({ ...e, to: "debug" })` keeps a line off screen. |
| `ui.message` | Fires when a `Client` THIS plugin drew posts from its surface module (`surface.post(data)`); only this plugin's hooks see it. |
| `ui.notice` | The argument of `$.ui.notice(tool_use_id, text)`. |
| `ui.open` | The argument of `$.ui.open({ id, title, focus })`; a hook above the opener may retitle it or refuse it with `{ deny }`, never rename it. |
| `ui.panes` | The argument of `$.ui.panes()`. |
| `ui.press` | Fires when a `Button` a render hook drew is pressed on a surface; `e` is `{ plugin, element, component, surface }`, `element` the button's `key`. |
| `ui.render` | Fires when the engine is about to draw a component: once per input value (props, viewport width), plugin load or `$.ui.invalidate("ui.render")`. |
| `ui.resolve` | Fires when the plugins load (not per draw), once per surface, component and plugin: `e` names the surface and component, never the props. |
| `ui.scroll` | Fires before a site's window moves: the person's wheel or scroll keys on a `Pane` body or the `AbovePrompt` band, at its edges too; `$.ui.scroll`. |
| `ui.select` | Fires when a `Select` a render hook drew is picked from; `e` is `{ plugin, element, component, surface, value }`. |
| `ui.selection` | The argument of `$.ui.selection()`. |
| `ui.status` | The argument of `$.ui.status(text)`; `text` undefined clears the line. |
| `ui.toast` | The argument of `$.ui.toast(text, { timeoutMs })`. |

Classic hook events (33), each `classic.<Name>` with the settings hook's input and result: `ConfigChange`, `CwdChanged`, `DirectoryAdded`, `Elicitation`, `ElicitationResult`, `FileChanged`, `InstructionsLoaded`, `MessageDisplay`, `Notification`, `PermissionDenied`, `PermissionRequest`, `PostCompact`, `PostModelSwitch`, `PostToolBatch`, `PostToolUse`, `PostToolUseFailure`, `PreCompact`, `PreModelSwitch`, `PreToolUse`, `SessionEnd`, `SessionStart`, `Setup`, `Stop`, `StopFailure`, `SubagentStart`, `SubagentStop`, `TaskCompleted`, `TaskCreated`, `TeammateIdle`, `UserPromptExpansion`, `UserPromptSubmit`, `WorktreeCreate`, `WorktreeRemove`.

## `$` methods (81)

| Call | What it does |
|---|---|
| `$.plugin.name` | From plugin.json; debug-log and `$.ui.log` lines carry it. |
| `$.plugin.root` | The plugin's directory (the one holding plugin.json), absolute. |
| `$.ui.notice` | Shows `text` as one line under the dialog open for `tool_use_id`, or removes the line when `text` is undefined. |
| `$.ui.invalidate` | Re-runs an event whose results the engine caches: `ui.render` draws the instances this plugin may draw again; the others drop the cached answers. |
| `$.ui.blit` | Repaints a mounted `Raster` this plugin's own render hook drew with new cells, or swaps a keyed `Image` it drew to a new source; no redraw. |
| `$.ui.resolve` | The elements of the surface `e` is drawn on (Elements[e.surface]): a frozen table of constructors, the JSX tags a render hook draws with. |
| `$.ui.log` | Appends one line to the transcript, drawn like a system notice (dim; not sent to the model), or with `{ to: "debug" }` to the debug log alone. |
| `$.ui.ask` | Asks the user `question` in the engine's own AskUserQuestion dialog and resolves to the label they chose, or the text typed under "Other". |
| `$.ui.toast` | Shows `text` for a few seconds under the plugin's name: a small box on the stack of plugin toasts over the transcript's top right corner. |
| `$.ui.status` | Pins `text` as this plugin's status line under the prompt, beside the engine's own pinned notices, until the next call replaces it. |
| `$.ui.open` | Opens a pane, a framed region the surface places and this plugin draws by hooking `ui.render` for `{ component: "Pane" }`; says if it is drawn. |
| `$.ui.close` | Closes one of the open panes; an id that is not open is left alone. |
| `$.ui.panes` | Lists this plugin's own open panes (UiPane): each one's id and title, and whether it is shown, holds the keyboard, and is placed. |
| `$.ui.scroll` | Scrolls something into view as the DOM's `scrollIntoView` would: a render instance by `requestId`, an element by `key`, a site's edge. |
| `$.ui.focus` | Moves the focus ring of one of this plugin's sites onto an element it drew there, as the DOM's `element.focus()`, while it holds the keys. |
| `$.ui.copy` | Puts `text` on the clipboard of a surface the session draws on, as the DOM's `navigator.clipboard.writeText`, and says whether it took. |
| `$.ui.selection` | Returns what the person last selected with the mouse: the text as a copy would take it, and the transcript row it lies in. |
| `$.model.complete` | Runs one text completion through the session's own API client and resolves a result: the reply's text and cost, or why there is no text. |
| `$.model.fork` | Runs one tool-less completion over the session's OWN transcript as the main thread last sent it, so the API serves that prefix from its cache. |
| `$.model.classify` | Picks one of `labels` for `text` with one completion over `$.model.complete` and a fixed classifier prompt. |
| `$.audio.play` | Plays one audio clip, starting now; clips are not queued, so two calls play together (a bed under speech). |
| `$.audio.speak` | Speaks `text` with the platform's own synthesizer (`say` on macOS). |
| `$.mcp.call` | Calls `tool` on one of the engine's connected MCP servers with the engine's own connection and credentials. |
| `$.mcp.connect` | Connects one of the MCP servers this plugin's own manifest lists; a server already connected answers at once. |
| `$.session.messages` | Returns the transcript so far, one SessionMessage per user or assistant message; progress rows, `$.ui.log` lines and notices are not messages. |
| `$.session.cwd` | Returns the directory the session runs in, absolute. |
| `$.session.root` | Returns the session's project root, absolute: where it started, or where `/cd`, a host's directory change or a worktree move took it. |
| `$.session.model` | Returns the main loop's model, as `/model` shows it. |
| `$.session.turns` | Returns how many prompts the user has sent this session (user turns in the transcript). |
| `$.session.id` | Returns the session's id (the transcript file's name). |
| `$.session.repo` | Returns the git repository the session runs in, read from the working copy on each call; null when the directory is not inside one. |
| `$.session.surfaces` | Returns every surface the session draws on, each once: `terminal` under the REPL first, then the remote ones in the order they attached. |
| `$.session.surface` | Returns the first of `$.session.surfaces()`, or null where nothing draws. |
| `$.session.usage` | Returns when the session began, and the context window's fill, the rate-limit windows and the cost as the status line has them, itemized. |
| `$.session.version` | Returns the version of the engine the session runs on, the release it is built from, and when it was built. |
| `$.session.compact` | Compacts the conversation: the event `session.compact` with `trigger` `plugin`, the same call `/compact` makes, between turns. |
| `$.session.send` | Sends a plain-text message to another agent or session: the event `session.send`, the model's SendMessage tool's own call and delivery. |
| `$.session.append` | Appends a row to a conversation of the session: the event `session.append`, the engine's own call for every row it keeps. |
| `$.session.authorize` | Holds the session's Anthropic credential on the host and answers an opaque handle and its kind; the secret never reaches the plugin. |
| `$.turn.abort` | Cancels the running model turn: the one whose id `turn.start` handed this plugin, its running tools stopped, no interruption marker. |
| `$.prompt.submit` | Submits a prompt: the event `prompt.submit`, the same call the engine makes for a typed prompt; a turn of its own, once the session is idle. |
| `$.prompt.read` | Returns the prompt box as it stands, the draft typed so far and the cursor's offset into it, so a `fill` can keep what the person typed. |
| `$.prompt.fill` | Puts `input.text` in the prompt box as the draft, by `mode`: `replace` (the default) over it, `append` after it, `insert` at the cursor. |
| `$.prompt.suggest` | Proposes `input.text` as the prompt box's dim suggestion, Tab to take: the event `prompt.suggest`, as the engine's own guess after a turn. |
| `$.prompt.compose` | Returns the system prompt's sections for `facts`: the event `prompt.compose`, the call the engine makes for every prompt it sends. |
| `$.tool.list` | Returns the tools the model can call now, built-in and MCP alike, in the order the model sees them. |
| `$.tool.call` | Calls a tool: the event `tool.call`, the same call the engine makes for the model's tool calls, under a `tool_use_id` of its own. |
| `$.tool.check` | Asks the engine's permission decision for a tool call now: the event `tool.check`, resolved to `{ decision, reason?, rule?, ceiling? }`. |
| `$.tool.register` | Declares a tool the model can call from the next prompt on: the name, description and input schema of `mcp__<plugin>__<name>`. |
| `$.command.list` | Returns the slash commands the person can run now, built-in, plugin and MCP alike, in the order the typeahead lists them. |
| `$.command.run` | Runs a slash command as if the person typed `/command args`: the event `command.run`, queued and run once the session is idle. |
| `$.command.register` | Declares the slash command `/<name>` for this session, listed in the typeahead from the next keystroke on. |
| `$.config.list` | Returns the rows the `/config` menu would draw now, in its order, each with its current value, its kind, its owner and its lock. |
| `$.config.set` | Changes one row as if the person did in the menu: the event `config.set` with `origin` `{ kind: 'plugin', name }`, then the writer. |
| `$.telemetry.log` | Logs one record to the destination `entry.to` names, the event `telemetry.log`; `e.to` is pinned, and `anthropic` when left out. |
| `$.telemetry.mark` | Marks one use of a feature as the CLI's own feature events do, the event `telemetry.mark`; it takes no `to` and always means `anthropic`. |
| `$.agent.spawn` | Spawns a subagent: the event `agent.spawn`, the same call the engine makes when the Agent tool starts one; the engine fills the rest. |
| `$.agent.list` | Returns the session's agents so far, subagents and teammates: the ones the model spawned and the ones plugins did alike. |
| `$.agent.register` | Defines an agent type the Agent tool dispatches from the next turn on, named `<plugin>:<name>`: the event `agent.register`. |
| `$.fs.read` | Reads a file and returns its text, or with `{ as: "bytes" }` its bytes as `{ base64 }`. |
| `$.fs.write` | Writes `text` to a file, creating it and its directories as needed. |
| `$.fs.list` | Lists a directory by name: `{ name, kind, size, mtimeMs, isLink }` per entry, each entry as it stands. |
| `$.fs.exists` | Returns whether the path exists; rejects only a network location, which the implementation beneath the hooks never touches. |
| `$.fs.stat` | Returns `{ kind, size, mtimeMs, isLink }` of the path: what it leads to, and whether it is itself a symbolic link. |
| `$.fs.ancestors` | Reads the named instruction files in every directory above the session's original working directory, the way the engine reads CLAUDE.md. |
| `$.store.get` | Returns the value under `key`, or `undefined` when unset. |
| `$.store.set` | Sets `key` to `value`, which must be JSON data. |
| `$.store.delete` | Removes `key` from the store. |
| `$.store.keys` | Returns every key set, in insertion order. |
| `$.state.get` | Resolves the value under `ref` and the version it stands at; a value never written is `undefined` at version 0. |
| `$.state.set` | Writes `value` under `ref`, which must be this plugin's own; the sites that read it while drawing are drawn again, at the redraw rate. |
| `$.clock.now` | Resolves milliseconds since the epoch, now. |
| `$.clock.sleep` | Resolves after `ms` milliseconds; rejects at once when `signal` aborts. |
| `$.clock.after` | Calls `fn` once after `ms` milliseconds; `cancel()` before then stops it. |
| `$.clock.every` | Calls `fn` every `ms` milliseconds (at least 1) until `cancel()`. |
| `$.http.fetch` | Fetches `url` through the host (never the plugin's own network) and resolves `{ status, ok, headers, text }` once the body is read. |
| `$.process.run` | Runs a command on the host by its argument vector (no shell) and resolves `{ exitCode, stdout, stderr }` once it exits, any exit code. |
| `$.process.spawn` | Starts a command on the host by its argument vector (no shell) and streams what it writes, piece by piece, then how it ended. |
| `$.settings.read` | Resolves with the settings merged over every source, as the engine reads them, or with one source's settings as loaded (`{ source }`). |
| `$.env.get` | Resolves with the variable's value, or `undefined` when it is unset. |
| `$.env.set` | Sets the variable for this process and everything it starts after, or unsets it when `value` is `undefined`. |

## `next` (9)

| Field | What it is |
|---|---|
| `next.to` | Continues this dispatch at a tier: `next(e)` with every link between this hook's own tier and that one skipped, by tier and narrowing only. |
| `next.signal` | Aborts when the call this dispatch belongs to is abandoned: the user interrupted, a hook above settled first, or this hook ran out of budget. |
| `next.is` | Whether this dispatch's event is selected by `pattern` (a name, a glob, a negation), as a type predicate on `e`: `next.is("tool.call", e)`. |
| `next.event` | The name of this dispatch's event, as a value, for a glob hook to log or switch on. |
| `next.origin` | Who raised this dispatch: the calling plugin's name and the tier it sits in (Origin); the engine reads `{ plugin: "engine", tier: "core" }`. |
| `next.trace` | What settled beneath this hook on its latest `next()` call, the one started last: an entry per link beneath, nearest first, the engine's last. |
| `next.budget` | How much time this hook runs under and how much is left (NextBudget), read fresh on each access; HookBudget says what the clock counts. |
| `next.error (in .catch)` | Why the hook failed (HookFailure); undefined on an ordinary hook's `next`, so its presence says a handler is running. |
| `next.called (in .catch)` | True when the failed hook had called `next()` or `next.to()` at least once, settled or in flight; the handler runs once that call settled. |
