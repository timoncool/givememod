# Gotchas: symptom → cause → fix

Merged from the official troubleshooting page, every community mod skill that documented traps (BeLazy167, Sstobo, DannyMac180, jclfocused, ysoftman, BorjaGM1, tomada1114, dbrownjave, Esposter, karanb192) and 1,161 traps that 222 mod repositories wrote down (harvested 2026-10-11), deduplicated. Rows checked against the types of 2.1.293, the official docs or the source of a built-in are plain; rows only an author reported are marked *(reported)* with the build where known. Your build's types and `claude plugin validate` win over this page. Full official version: `official/troubleshoot.md`.

## Limits (official reference, 2.1.29x)

| Limit | Value |
|---|---|
| A hook's own time for one event (time inside `next` and `$` calls is free, `$.clock.sleep` is not) | 10 s; 50 ms for `prompt.edit` |
| A `.catch` handler | 1 s |
| All `session.end` hooks together | the SessionEnd budget, 1.5 s by default |
| `$.process.run` | 30 s default, 10 min max; each stream's first 4 MiB (`isStdoutTruncated`) |
| `$.fs.read` / `$.fs.write` | 4 MiB per file |
| `$.http.fetch` | 30 s with redirects; 5 redirects; 4 MiB request and response (a larger declared `Content-Length` rejects); text only, resolves once the whole body is read (no streaming) |
| `$.model.complete` `maxTokens` | 1,024 by default, up to 64,000 |
| `$.store` | 4 MiB of JSON per plugin |
| `$.session.messages()` | the newest 4,096 entries |
| Text in one drawn tree | the first 100,000 characters |
| `Svg` source | 131,072 characters |
| `Raster` | 1–512 columns, 1–256 rows, one printable width-1 BMP character per cell, 1,024 colour pairs per frame |
| A `Link` `href` | 2,048 characters, `https:` or `http://localhost` only; a bad one refuses the whole tree |
| A `Code` `language`/`path`, `Select` value, `Client` `module` | 10,000 characters |
| Redraws by `$.ui.invalidate` | 10 a second; 30 in the terminal for the visible pane, the expanded band and the hint line |
| A pane opened unasked | placed from 144 columns, 110 once the person has opened it |
| Command, tool, subagent and pane names | letters, digits, `_`, `-`, up to 64 characters |
| Nesting of scopes in one hooks file | 2,000 |
| One `claude plugin test` test | 5 s unless it sets `timeoutMs` |
| `$.audio.play` | macOS only (`afplay`); a Linux or Windows terminal plays nothing; at most 4 clips at once *(reported)* |

## Where the built-in guard loads

Claude Code loads `sec-default@builtin` ahead of every installed mod when the machine has managed settings or the person signs in with a Team or Enterprise plan. Its source ([mods/sec-default](https://github.com/anthropics/claude-code/tree/main/mods/sec-default)) moves these events past the user tier, so **an installed mod's hooks on them never run there**:

`classic.*` (so `classic.SessionStart` restores after `/clear` do not run), `prompt.section`, `prompt.context`, `prompt.compose`, `skill.prompt`, `attribution.text`, `settings.read`.

What still reaches the model: `prompt.submit` context, tool-result `context`, `tool.describe`, deny text (see `techniques.md` §6). Restore after `/clear` lazily on `turn.start` as well. `claude plugin test` does not load the guard, so tests pass where the live session skips the hook.

## Open issues that bite mods (checked open on 2026-10-11)

| Issue | Effect | Do |
|---|---|---|
| [#92533](https://github.com/anthropics/claude-code/issues/92533) | Any `tool.call` hook on `Bash` (a matcherless one too) makes every Bash call of an `Agent(isolation: "worktree")` subagent refused | Do not install Bash-hooking mods (guards, receipts) in sessions that use worktree subagents; say so in the mod's README |
| [#100837](https://github.com/anthropics/claude-code/issues/100837) | A headless 2.1.295 load (`claude -p --plugin-dir`) writes no `.claude-plugin/types/` | Type-check after an interactive load, or against the types file the `plugin-authoring` skill names; pin 2.1.293–2.1.294 in CI |
| [#100797](https://github.com/anthropics/claude-code/issues/100797) | The desktop rebuilds an unchanged band `Svg` on every redraw: blank frame, SMIL restarts | Negative `begin` offsets (`techniques.md` §2) |
| [#99395](https://github.com/anthropics/claude-code/issues/99395) | Desktop: the first click on a pane button only moves focus | Expect two clicks; make presses idempotent |
| [#99423](https://github.com/anthropics/claude-code/issues/99423), [#99217](https://github.com/anthropics/claude-code/issues/99217) | The VS Code extension and Remote Control views (desktop, iOS) draw no mod UI | Fall back to `$.ui.toast` or command text |
| [#101089](https://github.com/anthropics/claude-code/issues/101089), [#101090](https://github.com/anthropics/claude-code/issues/101090) | Desktop: a mod `Input` cannot be full width; mod text cannot be selected | Offer a copy button (`$.ui.copy`) |

## The mod does not load

| Symptom | Cause | Fix |
|---|---|---|
| Plugin installed, nothing happens | `hooks/hooks.json` has no `modules` key | `{ "modules": ["./register.tsx"] }`, path relative to that file |
| `validate` passes but prints no `hooks:` line | same | same |
| No mod loads at all | Claude Code < 2.1.287 (desktop < 2.1.286), `--safe-mode`, `--bare`, `disableAllHooks`, untrusted folder, org policy | `claude --version`; accept the trust prompt; `claude plugin test` in an empty folder prints the switch state |
| `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` advice | early-access flag, ignored since 2.1.287 | remove it; it no longer turns mods off either |
| `Plugin name "claude-x" is reserved` | names starting `claude-`, `anthropic-`, `anthropics-`, `cc-plugin-` | name it for what it does |
| `$.ui is used as a value` | `$` or a noun assigned, destructured or computed-indexed | write `$.noun.verb(...)` at each call site |
| `$ is passed to "f", which is not a function declared at the top of this file` | `$` passed to a closure, method or imported function | hoist the helper to the top level of the same file; `read`/`update` are the allowed imports |
| `on("x") is registered twice without a matcher` | two plain hooks on one event in one module | merge them, or give each a matcher |
| `the event name passed to on() is not a string literal` | variable or loop over names | write each `on('…')` literally |
| `"on" is declared again (shadowed)` | inner variable or parameter named `on` | rename it |
| `Client: the plugin loaded no surface module (its hooks module builds no Client from a literal path)` | the element was renamed (`const Clicker = els.Client`) or `module` is not a string literal | keep the tag spelled `<Client module="./file.tsx" …>`; narrow with `const Client = 'Client' in els ? els.Client : null` where VS Code and mobile have none |
| `a dynamic import()` / module refused | `import()`, `require`, npm or Node imports | static relative imports and bare `claude-code` only |
| File not loaded | extension not `.ts .tsx .js .jsx .mjs .cjs .mts .cts` | rename |
| JSX `does not parse` | JSX in a `.ts` file | use `.tsx` |
| First draw breaks | a local `h` or `Fragment`, or an `@jsx` pragma | delete them: the engine supplies `h` |
| `X.key is not declared` | an atom key missing from the contract | declare it in `types/index.d.ts`, name the file in `plugin.json` → `"types"` |
| contract refused | `export {}` in `types/index.d.ts` | export a real type instead |
| `takes a source the scan can read` | `atom(...)` held in `let` or keys computed | `const` atom, literal `plugin` and `key` |
| `Client module not found` | `module` built from a variable | a string literal path |
| `options do not fit plugin.json userConfig` | an option value fails its field | fix it in `pluginConfigs` |
| `another plugin of that name loads first` | name clash with an installed plugin | disable the installed copy or rename |
| Claude Code stopped asking about hot reloading | the question ended three times without an answer | copy the mod out and run `claude --plugin-dir <abs path>` |
| `Dependency "x" is not installed` | `dependencies` names a missing plugin | install it, or drop the dependency |
| Module refused though `tsc` and your own harness pass | they do not run the engine's load checks (a helper named `next`, `h` or `on`; `$` stored in an object) | `claude plugin validate` after every change |
| A helper that takes `$` is refused | it is imported from another file, or shares its name with another identifier in the file *(reported)* | keep `$`-taking functions in `register.tsx` with unique names; pass closures to pure modules |
| Import refused | the file is outside the plugin folder, symlinks included | copy shared code into each mod |
| Module refused | bigger than 1 MiB *(reported)* | move heavy code to a script run by `$.process.run` |
| `$.env.get(name)` refused | a variable name | a string literal at each call site |
| Two plugins of the same name, the wrong one runs | one name loads once, in this order: managed `enabledPlugins`, then `--plugin-dir`/`CLAUDE_CODE_PLUGIN_DIRS` (replaces an installed copy silently, a skills-folder copy with an Errors row in `/plugin`), then installed, then `~/.claude/skills/`, then the project's `.claude/skills/` (official `plugins/loading`, "name conflicts") | load a mod in development one way only; `claude --debug` logs `Plugin "<name>" from --plugin-dir overrides installed version` |
| Marketplace install runs `npm install` / `npm ci` | a `package.json` or lockfile in the plugin folder *(reported)* | keep dev tooling out of the shipped plugin folder |
| `validate --strict` warns | a `CLAUDE.md` at the plugin root *(reported)* | keep notes in `.claude/` |
| `claude plugin details` shows `Hooks (0)` | it counts settings-style hooks only *(reported)* | trust `validate`'s `hooks:` line |
| A helper binary in `bin/` turns up in the Bash tool's PATH | Claude Code adds a plugin's `bin/` *(reported)* | keep helpers in another folder |

## A hook misbehaves

| Symptom | Cause | Fix |
|---|---|---|
| The guard threw and the tool ran anyway | failing hooks are skipped: fail-open by default | `.catch(($, e, next) => next.called ? next(e) : { deny: 'why' })`; validate lists `gating hook without .catch` |
| The tool ran but the model was told it was refused | `deny` returned after `await next(e)` | decide **before** `next`; a deny after only withholds the result |
| Hook skipped after about 10 s | own-time budget (time inside `next` and `$` calls is free, `$.clock.sleep` is not) | long work in `session.start` + `$.clock`, waits inside `$` calls |
| `hook skipped: returned …` | wrong result shape (`{}` or `undefined`) | return `next(e)` or the event's full result |
| Rewritten tool result ignored | returned `{ ...r, text }` (engine-owned fields) | answer `{ result: newResult }`, tell the model through `context` |
| `$.command.register` throws and the rest of `session.start` is gone | the name is taken | register last or `.catch()` it |
| `registered /x but no command.run hook answered it` | matcher mismatch, the hook returned `next(e)`, or it was skipped (`focus: false` is one way) | match the literal name, return `{ text }` or `{}` |
| `ui.open: focus is true or left out` | passed `false` to `focus`/`closeOnEscape`/`holdToasts`/`autoFocus` | omit the field |
| Counter, timer or cache resets on save | reload re-runs `register`; module variables start over | `$.state` for the session, `$.store` across sessions |
| Value resets after `/clear`, `/resume`, `/branch` | `$.state` resets and `session.start` does not fire | reload in `classic.SessionStart` with `source: ['clear','resume','fork']` |
| `$.state.set` denied | written while drawing | write from a handler or another event |
| Two quick presses lose one | wrote from a captured value | `update($, atom, fn)` (reads, applies, retries on a version miss) |
| A subagent's turn triggered the main-loop logic | `turn.complete`, `turn.step`, `tool.call` fire for subagents | check `e.agentId === undefined` |
| `turn.start` has no `agentId` | not carried there | use `turn.step`/`turn.complete` for subagent work |
| A named teammate never raised `agent.spawn` (2.1.287) | reported | track its `agentId` on `tool.call`/`turn.complete` |
| A path guard was bypassed | `..`, symlinks, other spellings | allow-list on `$.fs.stat(p, { resolve: true }).realPath` |
| Every model request misses the prompt cache | a hook changes `prompt.section`/`compose`/`context`/`tool.describe` text or the model per request | stable text; route model and effort once per task |
| Model call costs explode | per-turn or per-step model call with no gate | main loop, `reason === 'answer'`, the turn changed something, an off switch |
| `$.store.set` rejects | past 4 MiB of JSON | cap lists, catch the write |
| Unhandled rejection unloads the mod | a fire-and-forget `$` promise with no `.catch` | catch every `$` promise you do not return |
| `it crashed the hooks worker` / all mods off after 3 crashes | a loop that never awaits | fix it; `/reload-plugins` brings mods back |
| `a hook changed this call's input after the model wrote it` (auto mode) | a hook rewrites tool input every time | do not rewrite in auto mode, or leave it |
| `$.session.compact` rejects | desktop and SDK | `$.prompt.submit({ text: '/compact' })` |
| `$.ui.toast({ text })` shows `[object Object]` | `$` calls are positional, the event `e` is an object | `$.ui.toast('text', { timeoutMs })` |
| Bash regex guard misses the danger | variables, aliases, scripts writing files | treat it as a reminder; real boundaries are permissions and the OS |
| A Windows guard misses commits | the harness has `PowerShell` beside `Bash` *(reported)* | match `['Bash', 'PowerShell']` |
| Timer frozen after a save, state still says "running" | a reload cancels pending `$.clock` waits; `$.state` survives | re-arm from state in `session.start`; keep timer handles in a module array the next `register` cancels |
| Timer never re-armed after `/reload-plugins` | some authors saw no `session.start` there *(reported)* | make start-up idempotent and call it lazily from any hook |
| A hook ran before the new module's `session.start` after a reload | module variables are still at their defaults *(reported)* | read `$.state` where you write, not a module copy |
| `$.command.run`, `$.prompt.submit` or `$.session.compact` refused or hangs | called inside a hook the current turn waits on (`command.run`, a press, `prompt.submit`) | return first, then run it from `$.clock.after(0, …)` |
| `$.prompt.submit` from a hook deadlocks | it resolves when its turn **starts** | never await it inside a turn; fire and forget |
| Plugin-name prefix twice on screen | the engine prefixes toasts, status, `ui.log` and command output with the plugin's name *(reported)* | do not start those texts with the name; a deny reaches the model unnamed, so name it there |
| `$.store` counter lost updates | the store is one JSON file shared by all sessions, with no compare-and-set *(reported, measured)* | one key per writer, or re-read and retry on a `rev` field |
| `$.http.fetch` hangs a band | it resolves only after the whole body; servers that stream never end | stream through `$.process.spawn` of `curl -sN` |
| `$.process.run(['npm', …])` cannot start on Windows | `npm` is a `.cmd` shim and there is no shell *(reported)* | `['cmd', '/c', 'npm', …]` or an absolute path |
| `$.process.spawn` fails with `ENOENT` | the cwd (a deleted worktree) no longer exists *(reported)* | pass `cwd: '/'` or the session root |
| Bare command not found | `$.process.run` sees the Claude Code process's `PATH` (bare when started from the macOS Dock); `~` is not expanded | absolute paths from `$.env.get('HOME')`/`'USERPROFILE'` |
| `$.model.fork` says `nothing-to-fork` | before the first response, after `/clear`, after a restart that resumed | fall back to `$.model.complete` over the transcript tail |
| `$.model.complete` failed but did not throw | API failures resolve with `isAnswered: false` and a `reason` | read `isAnswered` |
| A registered tool's answer refused | the result must be a string or content blocks | `{ result: 'text' }` |
| The model never calls your tool | plugin tools are deferred behind ToolSearch by default | `isDeferred: false`, or answer `tool.describe` with it |
| `$.mcp.call` raised no permission prompt | by design: the plugin's call is the grant | gate connector writes yourself (`$.ui.ask`) |
| A permission refusal looks like an error | it reaches `tool.call` as `isError: true` *(reported)* | do not count it as a failed command |
| Answer of a permission dialog unknown | no event carries the person's choice; the wait lasts until the approved call ends *(reported)* | infer from `tool.check` `ask` plus the call's end; `classic.PermissionDenied` reports refusals |
| Esc, Ctrl+C, Ctrl+D, a paste or a key release reach no hook | none raises an event for mods *(reported)* | buttons and commands for cancel; poll `$.prompt.read()` for pastes |
| `classic.SessionStart` and `session.start` race | they settle in no fixed order *(reported, 2.1.285)* | make both idempotent |

## Drawing

| Symptom | Cause | Fix |
|---|---|---|
| Pane or band empty, or Claude Code's usual drawing | the tree did not validate | read `ui.render (X) refused: <reason>` (transcript while hot reloading, otherwise `--debug`) |
| `threw while drawn` | a value the painter cannot draw (an `undefined` prop rewritten) | fix the value; the engine drew its own |
| Another mod's band disappeared when yours appeared | your tree replaced theirs | put `{await next(e)}` in your tree |
| Band overflows or wraps | sized to `viewport.columns` | size to `e.props.bodyColumns` |
| `$.ui.open` runs, no pane | opened unasked in a terminal under 144 columns | open from a command or button, check `isPlaced`, fall back to the band |
| Hotkeys do nothing | no focus | `focus: true` from a command, Ctrl+X Tab, or a click; digits in an empty prompt reach band buttons only |
| A letter hotkey typed into the prompt | band not focused | use digits for band buttons, letters only in focused panes |
| Works in the terminal, not on desktop | `Raster`/`Image`/terminal-only site | branch on the element table; Box runs or Svg on desktop |
| Desktop colours grey | theme colour names | hex where it matters |
| Spaces vanish between Text pieces on desktop | whitespace collapse | ` ` |
| Desktop Svg is 300×150 or white in dark mode | no `width/height`, no `color-scheme` | set both |
| Desktop animation restarts on every redraw | Svg props changed | self-running Svg, or Box-based frames |
| Clicks lost on desktop | redrawing every ~140 ms | redraw only on news |
| `Text key` not found in a test | Text takes no key | find by text, keys go on Box, Button, Input |
| A toast never appears | a `holdToasts` pane is up, three-toast stack, or a newer toast of yours replaced it | close the pane, merge messages, check the debug log |
| Link not clickable on desktop | not `https:`/`http://localhost`, `@` in the path, odd spelling | normalise with `new URL(href).href` |
| The whole `Raster` vanished | one cell holds a character that is not printable width-1 BMP (emoji, CJK, combining) | sanitise cells to a safe set |
| Gradient banding in a `Raster` | more than 1,024 colour pairs; channels snap to a 4-bit grid *(reported)* | quantize to ≤ 1,000 pairs on the `0x11` grid |
| Button refused, whole tree gone | `hotkey` other than one digit or one lowercase letter (`F1`, `?`) | digits and letters only |
| Typing a digit pressed someone's band button | a bare digit in an empty prompt presses band Buttons with that hotkey; mods collide | digits only for the mod's main choice; letters in focused panes |
| Desktop draws nothing for an `Svg` | empty `alt` *(reported)*; an interactive `Svg` is a size-less 300×150 frame | always set `alt`, `width`, `height`; prefer plain image `Svg` |
| A click inside an `Svg` does nothing | SVG content takes no presses | lay `Button`s over it |
| Engine row refused under your wrapper | `width`, `height`, `minWidth`, `overflow` or `position` on a `Box` above the engine's own row | spacer boxes beside it |
| Band gone while a question is open | in the terminal `AskUserQuestion` takes the prompt area; more than 12 rows around it are refused *(reported)* | draw the essentials in the `AskUserQuestion` site |
| A tree with a control character unmounts | `Text` cannot hold control or ANSI characters | strip C0/C1, bidi and zero-width characters from data before drawing |
| Table drawn wrong | colour codes inside table cells; a table wider than the terminal turns into `header: value` lines *(reported)* | plain cells; draw wide tables yourself |
| Wrapping at odd places | Claude Code wraps only at ASCII spaces; only U+00A0 keeps words together *(reported)* | non-breaking spaces where needed |
| A pane docks only sometimes | it docks beside the transcript in the fullscreen layout (`/tui fullscreen`, `CLAUDE_CODE_NO_FLICKER=1`) from 110 columns, above the prompt otherwise *(reported)* | design for both |
| Mouse does nothing in the terminal | only the fullscreen layout reports clicks; no pointer through tmux *(reported)* | keyboard paths: Ctrl+X Tab, hotkeys |
| Desktop split view shows the band in one pane only | plugin bars draw in the left pane *(reported)* | a line under the newest reply for the other |
| Desktop `Client` shows a placeholder | some desktop builds refuse `Client` modules (CSP) *(reported)* | `Svg` with SMIL on the desktop, `Client` on the terminal |
| `Image` shows its alt text | needs kitty graphics (kitty, Ghostty), not tmux or background sessions; `CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1` forces it | `Raster` half blocks as the fallback |

## Testing (`claude plugin test`)

| Symptom | Cause | Fix |
|---|---|---|
| `no implementation for <event>` | nothing sits beneath the plugin in a test | answer it in the test: `on('session.start', ($, e) => ({ cwd: e.cwd }))`, `on('command.register', () => ({ value: { command: 'x' } }))` |
| `returned something that is not a result object` | a bare value for a `$` noun | `{ value: … }` |
| `"ui.ask" is not an event` | `$.ui.ask` is an `AskUserQuestion` tool call | answer `tool.call` for `AskUserQuestion` with `{ result: { questions, answers: { [question]: label } } }`; `{ deny }` makes it reject |
| `turn.start` stub refused | result needs `{ turnId }` | `on('turn.start', ($, e) => ({ turnId: e.turnId }))` |
| `turn.complete` stub refused | result needs `{ text }` | `on('turn.complete', () => ({ text: '' }))` |
| A clock-driven value did not change | `advance` not awaited | `await clock.advance(ms)` |
| Inline plugin: `X is not defined` | inline plugins load from their `register` source alone | write literals inside it |
| The test's `$` has no `state`/`fs` | by design | read state through a probe command; capture writes by answering `fs.write` |
| `tsc` rejects a mount | `props` must be the site's full props | copy `BAND`/`PANE` from the templates' tests |
| validate and test pass, types are wrong | neither type-checks | `tsc -p <mod>` after the first load lays `.claude-plugin/types/` |
| No `.claude-plugin/types/` after a headless load | 2.1.295 stopped writing them headless ([#100837](https://github.com/anthropics/claude-code/issues/100837)) | load interactively, or point tsc at the `plugin-authoring` types file |
| `ui.find({ text })` matched the wrong node | it matches substrings and wrapper `Box`es too | anchor with `/^…$/` and add `type: 'Text'` |
| A pane test throws at the bottom of the chain | nothing sits beneath `ui.render` in a test | a stub engine row: `on('ui.render', () => ENGINE_ROW)` |
| `$.session.append` never reaches your test hook | the kit does not route it *(reported)* | keep that logic in a pure function and test it directly |
| Store writes leak between tests | the test's `$.store` is real unless mocked | `mock.store(on)` in every test |
| Mods off in `claude plugin test` ("served off") | a remote rollout switch for that launch *(reported)* | run once with network access; `--debug-file` names it |

## Distribution

| Symptom | Cause | Fix |
|---|---|---|
| Edits do not take effect | editing an installed copy (cached by version) | develop with `--plugin-dir`; for a local marketplace folder, `/reload-plugins` re-reads it |
| A mod kept in `~/.claude/skills/<name>/` or `.claude/skills/<name>/` does not load | the folder lacks `.claude-plugin/plugin.json`; an organization allowlist (`strictKnownMarketplaces`) has no `{ "source": "skills-dir" }` entry; or `"<name>@skills-dir": false` in settings | `/plugin` names the cause; skills-folder plugins load in place from the next session start or `/reload-plugins` (official `plugins/loading`, `plugins/org`) |
| Users never get the update | `version` not bumped | bump it every release |
| `Plugin "x" not found in marketplace "y"` | `y` must be the `name` in `marketplace.json` | use that name after `@` |
| `/plugin install` says not available | the desktop Code tab has no `/plugin` command | install from a terminal; a user-scope install loads in desktop sessions |
| Types stale after an update | types are rewritten on each load | load once; never commit `.claude-plugin/types/` |
| An update reaches nobody | installed copies are cached by `version`; both `plugin.json` and the marketplace entry must change | bump both every release |
| A running session keeps the old code after an update | a session keeps the copy it started with *(reported)* | `/reload-plugins`, or a new session; the desktop app needs a full restart |
| `/radio`, `/bg`, `/recap`, `/agents` will not register | taken by built-ins or skills; a user skill of the same name takes it too | prefix command names with the mod's name |
| Mods silently absent | `--safe-mode`, `--bare`, `claude -p` drawing, cloud sessions, Bedrock/Vertex/custom base URL *(reported)*, the VS Code panel | check where it must run before building it |

## Stale claims (do not repeat them)

- "You must set `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`": false since 2.1.287.
- "Types come from `/plugin-types`": the engine now writes them beside every mod it loads from a folder you own; `/plugin-types` was the early-access path.
- "`$.fs` has no realpath": `$.fs.stat(p, { resolve: true }).realPath` exists.
- "No event reaches the prompt while typing": `prompt.edit` exists (50 ms budget).
- "`tool.check` is not implemented" / "`claude plugin test` is not shipped": both ship.
- "Hooks are fail-open and nothing can be done": `.catch` handlers make a hook fail closed.
- "Drawing mods only work in the terminal": the desktop Code tab draws bands, panes and transcript sites.
- "`$.http.fetch` has no timeout": it has 30 s with redirects included (official limits).
- "A plugin has only one hooks module, so mods cannot share code": they cannot share at run time, but one module can fan out to many mods, and pure files can be copied.
