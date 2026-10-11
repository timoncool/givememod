# Building blocks

Every block is a piece a mod is assembled from: when to use it, the code, the traps. The code comes from the official docs (2.1.29x), the official samples and this skill's templates (each validated and tested on 2.1.292). The exact field names of your build live in its types file: grep it before you trust a shape here.

Imports used below: `import { atom, read, update } from 'claude-code'` and `import type { EngineInterface, Register } from 'claude-code'`.

---

## B1. Module skeleton and lifecycle

```tsx
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

const loaded = atom({ plugin: 'my-mod', key: 'loaded' } as const, false)

async function load($: EngineInterface) {  // top level of the file: the only place $ may be passed to
  /* restore from $.store */
  await update($, loaded, () => true)
}

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)                // let the session start as usual
    await load($)                          // restore from $.store
    // timers go here: $.clock.every(...)
    await $.command.register({ name: 'my-cmd', description: '…', immediate: true }).catch(() => {}) // register last
    return r
  })
  on('classic.SessionStart', { source: ['clear', 'resume', 'fork'] }, async ($, e, next) => {
    await load($)                          // $.state was reset and session.start does not fire again
    return next(e)
  })
  on('turn.start', async ($, e, next) => {
    if ((await read($, loaded)) !== true) await load($)   // where the built-in guard skips classic.* hooks
    return next(e)
  })
  on('session.end', async ($, e, next) => next(e)) // all session.end hooks together get about 1.5 s
}
```

- `session.start` fires at startup **and on every module reload**. Claude Code waits for it before the first prompt: no long awaits there.
- Where the built-in guard loads (Team or Enterprise sign-in, managed settings) an installed mod's `classic.*` hooks never run: `load` sets a `loaded` atom, and `turn.start` restores when it is missing. Templates `goal-pin` and `starter` do this.
- `options` holds the plugin's `userConfig` values; each non-secret field also becomes a `/config` row.

## B2. A `/command` that answers at once, with no model turn

```js
await $.command.register({ name: 'standup', description: 'Summary', argumentHint: '[days]', immediate: true })
on('command.run', { command: 'standup' }, async ($, e) => ({ text: 'Last ' + (e.args || '1') + ' day(s): …' }))
```

- `{ text }` prints in the transcript after the plugin's name and the model reads it. `{}` prints nothing (a command that only opens a pane).
- `immediate: true` lets it run while Claude works. A taken name throws, and the rest of the hook does not run: register last or catch.
- Run another command from code with `$.command.run({ command: 'compact', args: '' })`, not `$.prompt.submit`.

## B3. Band above the prompt (`AbovePrompt`)

```tsx
on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
  const v = await read($, value)                         // subscribes: a write redraws this band
  if (e.props.hasSurvey || v === null) return next(e)    // nothing to say: step aside
  const { Box, Text } = $.ui.resolve(e)
  const below = await next(e)                            // the bands of the mods after yours
  return (
    <Box flexDirection="column">
      <Text dimColor wrap="truncate-end">{`… ${v} …`}</Text>
      {below}
    </Box>
  )
})
```

- Width: `e.props.bodyColumns`. Height: up to `e.props.maxRows` (at most half the terminal), taller scrolls. `e.props.isWorking` says a turn is running (show-while-working bands).
- A bare digit typed into an empty prompt presses a band Button with that hotkey; letter hotkeys work only after the band has focus (click or Ctrl+X Tab). Use letters for anything costly.
- The person can collapse the band (`[-]`, Ctrl+X Ctrl+A); its Buttons unmount with it.
- Keep it to 1–3 rows and draw nothing when there is nothing to say.

## B4. Pane opened by a command

```tsx
const PANE = 'my-pane'
on('command.run', { command: 'my-pane' }, async $ => {
  const o = await $.ui.open({ id: PANE, title: 'Mine', focus: true, closeOnEscape: true })
  return o.isPlaced ? {} : { text: 'The pane waits for a wider terminal: ' + o.reason }
})
on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
  const { Box, Text } = $.ui.resolve(e)
  const rows = e.props.scroll.bodyRows, cols = e.props.bodyColumns
  return <Box flexDirection="column"><Text bold>Title</Text></Box>
})
```

- Opened by something the person did, a pane is placed at any width. Opened unasked (timer, `turn.start`), it needs 144 columns (110 once the person has opened it). On `isPlaced: false` fall back to the band (blast-radius does), a toast or the command text.
- `$.ui.close({ id })`; `$.ui.panes()` returns only your panes: `{ id, title, isShown, isFocused, isPlaced }`. A hidden tab does not render, so its Buttons and hotkeys are gone.
- Opening an open id only changes its title and does not bring it forward: close, then open.
- `holdToasts: true` only for a dialog the person answers and leaves.
- Tab titles are cut at about 12 columns: keep `title` to 10.

## B5. Tabs and buttons in a pane

```js
const tabButton = (name, label, hotkey) => Button({ key: 'tab-' + name, label, hotkey, plain: true,
  variant: tab === name ? 'primary' : 'secondary', onPress: () => update($, tabAtom, () => name) })
```

- Every control needs a stable, unique `key`: tests press by it.
- `plain: true` draws `1: One` in the terminal; bracketed buttons hide the hotkey, so name it in the label.
- `role: 'dismiss'` marks the close button (the desktop draws its native ✕).

## B6. Input and a list of rows

```js
Input({ key: 'new', label: 'Note', placeholder: 'Enter to add', value: '', submitLabel: 'add', autoFocus: true,
  onSubmit: async v => { if (v.trim()) await update($, notes, l => [...l, v.trim()].slice(-200)) } })
...notes.map((n, i) => Box({ flexDirection: 'row', columnGap: 1, children: [
  Button({ key: 'del-' + i, label: 'x', plain: true, onPress: () => update($, notes, l => l.filter((_, j) => j !== i)) }),
  Text({ children: [n] }) ] }))
```

- `value: ''` clears the field after a submit. While an `Input` has focus every printable key goes into it.
- Mobile has no `Input`/`Select`: check `'Input' in elements`.

## B7. React to the end of a turn (`turn.complete`)

```js
on('turn.complete', async ($, e, next) => {
  const r = await next(e)
  if (e.agentId !== undefined || e.isAborted) return r   // main loop only
  // e.answer, e.durationMs, e.usage, e.reason ('answer' | 'aborted' | 'refusal' | 'error')
  void refresh($).catch(() => {})                        // work after, without holding the turn
  return r                                               // or { ...r, text: 'a line under the answer' }
})
```

- Returning `{ text }` draws a line under the answer (template `turn-receipt`).
- `turn.start` has no `agentId`; it fires for the main loop.

## B8. Watch each model request (`turn.step`, an async generator)

```js
on('turn.step', async function* ($, e, next) {
  const result = yield* next(e)                           // the response streams as usual
  if (e.agentId === undefined && result.usage) { /* cache_read_input_tokens, … */ }
  return result
})
```

- `e.effort` (`low`…`max` or a number) is visible only here, once per request.
- Rewrite the model with `yield* next({ ...e, model })` at `e.index === 0` and keep it for the task: switching per request burns the prompt cache.

## B9. Guard a tool call (before it runs)

```js
on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
  if (/\bgit\s+push\b.*--force(?!-with-lease)\b/.test(String(e.command)))
    return { deny: 'Force pushes are blocked here. Push a new branch.' }   // the model reads it: write an instruction
  return next(e)
}).catch(($, e, next) => (next.called ? next(e) : { deny: 'The guard failed, so the command was not run.' }))
```

- Matcher: a string, an array (`['Edit', 'Write']`) or a regex (`/^mcp__github__/`).
- Paths: allow-list on `(await $.fs.stat(p, { resolve: true }))?.realPath` under a root resolved the same way; string matching is defeated by `..` and symlinks.
- A regex over Bash text cannot see variables or files a script writes: it is a reminder, not a security boundary.
- Any `tool.call` hook on `Bash` (a matcherless one too) breaks Bash inside `Agent(isolation: "worktree")` subagents ([#92533](https://github.com/anthropics/claude-code/issues/92533), open). Say so when proposing a Bash guard to someone who uses worktree subagents.
- On Windows match `['Bash', 'PowerShell']`.
- Template: `risky-hold`, `starter`.

## B10. Hold a call until the person decides

```js
on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
  if (!RISKY.test(e.command)) return next(e)
  let answer = 'Refuse'
  try { answer = await $.ui.ask(`Run this? ${e.command}`, ['Refuse', 'Run it']) } catch {}  // dismissed, or -p
  return answer === 'Run it' ? next(e) : { deny: 'The user refused. Ask before trying another way.' }
}).catch(($, e, next) => (next.called ? next(e) : { deny: 'The guard failed.' }))
```

- `$.ui.ask` is an `AskUserQuestion` tool call underneath: the question should end with `?`, 2–4 labels, the safe one first. In tests, answer it through `tool.call` (see testing.md).
- Keep waiting inside a `$` call (`$.ui.ask`, a short `$.process.run(['sleep','0.25'])`): that time is free; your own promise counts against the 10 s budget, and a timed-out hook is skipped so the command would run.
- Pane version with Proceed/Cancel and a band fallback: `examples/official/blast-radius.mjs` (watches `next.signal.aborted`, caps the wait, one hold at a time).

## B11. Decide the permission (`tool.check`)

```js
on('tool.check', { tool: 'Bash' }, async ($, e, next) => {
  const decided = await next(e)                     // allow | ask | deny from rules and settings hooks
  if (!e.input.command.includes('git push')) return decided
  const b = await $.process.run(['git', 'branch', '--show-current'])
  return b.stdout.trim() === 'main' ? { decision: 'deny', reason: 'No pushes from main' } : decided
})
```

- A refusal after `next` holds here, unlike `tool.call`. **Do not return `allow`** unless asked: it skips permission prompts and the person's settings guards.

## B12. Rewrite or add to a prompt

```js
on('prompt.submit', async ($, e, next) => {
  if (!/\bPR\b|pull request/i.test(e.text)) return next(e)
  const g = await $.process.run(['git', 'branch', '--show-current'])
  if (g.exitCode !== 0) return next(e)
  return next({ ...e, context: [...(e.context ?? []), 'Current branch: ' + g.stdout.trim()] })  // only the model reads it
})
// rewrite: next({ ...e, text }); stop: { drop: 'reason for the person' } (before next only)
```

- Text that changes between requests in `prompt.section`, `prompt.compose`, `prompt.context` or `tool.describe` breaks the prompt cache. Add through `context` or `$.session.append`.
- Where the built-in guard loads, an installed mod's `prompt.section`, `prompt.context` and `prompt.compose` hooks are skipped: `prompt.submit` context and tool-result context reach the model everywhere (B27).
- Put `context` on the event you pass to `next`; settings `UserPromptSubmit` hooks run inside `next`, and context added after it arrives too late *(reported, 2.1.283)*.

## B13. Timer, status, toast, log

```js
on('session.start', async ($, e, next) => {
  $.clock.every(60_000, async () => {
    try { const s = await $.process.run(['gh', 'pr', 'checks', '--json', 'state']); $.ui.status('checks: ' + sum(s.stdout)) }
    catch {}
  })
  return next(e)
})
```

- `$.ui.status(text)`: one pinned line under the prompt (`⚠ mod:`), `undefined` clears it. `$.ui.toast(text, { timeoutMs })`: 4 s by default. `$.ui.log(text)`: a dim transcript line the model does not read; `{ to: 'debug' }` writes to the debug log.
- `$.clock.every(ms, fn)` / `$.clock.after(ms, fn)` return a cancellable timer; reloads drop timers. `await $.clock.now()` is a Promise.
- Toasts: dedupe and fold bursts; a newer toast of your mod replaces its older one.
- Template: `watch-command`, `focus-timer`.

## B14. State: variable, `$.state`, `$.store`

```ts
// types/index.d.ts
declare module 'claude-code' { interface PluginState { 'my-mod': { count: number; isHidden: boolean } } }
// register.tsx
const count = atom({ plugin: 'my-mod', key: 'count' } as const, 0)
const n = await read($, count)                                    // in render: subscribes
onPress: async () => {                                            // writes come from handlers
  const saved = Number((await $.store.get('count')) ?? 0)         // re-read the store right before writing
  await $.store.set('count', saved + 1)
  await update($, count, () => saved + 1)
}
```

| Where | Lasts until | Use for |
|---|---|---|
| module variable | the next reload (every save during development) | private, recomputable data (a frame index) |
| `$.state` | session end, `/clear`, `/resume`, `/branch` | anything a drawing reads; survives reloads |
| `$.store` | deleted, or `cleanupPeriodDays` without use | settings, history; 4 MiB of JSON per plugin, shared by sessions |

- Write only on change; cap lists (`.slice(-N)`); `$.store.set` rejects past 4 MiB, so catch it.
- Another plugin's value can be read (`$.state.get({ plugin: 'other', key })`) but not written; change it by hooking `on('state.set', { plugin, key }, …)`.
- `plugin` and `key` are string literals; every key is declared in the contract named by `plugin.json` → `"types"`.

## B15. Redraw what Claude Code already draws

```tsx
on('ui.render', { component: 'Spinner' }, ($, e, next) => next({ ...e, props: { ...e.props, suffix: ' · tools: ' + n + '…' } }))  // change a detail
on('ui.render', { component: 'ToolResult' }, async ($, e, next) => (e.props.tool === 'Read' ? myTree($, e) : next(e)))           // replace
on('ui.render', { component: 'PromptHint' }, ($, e, next) =>                                                                       // add a tail
  next({ ...e, props: { ...e.props, tail: [e.props.tail, 'ctrl+g: my pane'].filter(Boolean).join(' · ') } }))
on('ui.render', { component: 'SessionMode' }, ($, e, next) =>                                                                      // footer label
  next({ ...e, props: { ...e.props, modes: [...e.props.modes, 'review mode'] } }))
```

- Sites: `UserMessage`, `AssistantMessage`, `ToolUse`, `ToolResult`, `ToolGroup`, `CommandOutput`, `AskUserQuestion`, `Spinner`, `ToolProgress`, `TurnDuration`, `InfoNotice`, `SessionMode`, `PromptHint`, `Pane`, `AbovePrompt`. The permission dialog is not a site; `$.ui.notice(tool_use_id, text)` adds a line under it.
- `next(e)` returns an opaque `{ type: 'engine', ref }`: place it in your `Box`, never walk it. In `AskUserQuestion` the ref must appear exactly once.
- For `UserMessage` with `e.props.isExpanded` (Ctrl+O) return `next(e)`. A rewritten `text` changes only the display.

## B16. A tool for the model

```js
on('session.start', async ($, e, next) => {
  await $.tool.register({ name: 'ticket', description: 'Look up a ticket by id',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }, isDeferred: false })
  return next(e)
})
on('tool.call', { tool: 'mcp__my-mod__ticket' }, async ($, e) => {
  const r = await $.http.fetch('https://tickets.example.com/api/' + encodeURIComponent(e.id))
  return { result: r.ok ? r.text : 'Lookup failed: ' + r.status }
})
```

- Full name `mcp__<plugin>__<name>`. Register in `session.start` (awaited): a tool list that changes mid-session costs a cache rewrite. `isDeferred: false` (2.1.293+) lists it upfront instead of behind ToolSearch.
- Template: `pinboard` (Claude pins decisions through its own tool).

## B17. Call a model: `complete` or `fork`

```js
const r = await $.model.complete({ model: 'haiku', system: 'One word: bug | feature | question.',
  prompt: [{ text: RULES, cache: true }, { text: e.args }], maxTokens: 20, timeoutMs: 15000 })
const label = r.isAnswered ? r.text.trim() : 'unknown'      // API failures do not reject: read isAnswered / reason
const f = await $.model.fork({ prompt: 'Is the task done? Answer yes or no.' })   // the whole conversation, from cache
```

- `complete` for a piece of text you hold; `fork` for questions about this conversation, right after a turn while the cache is warm. `nothing-to-fork` has no `usage`.
- It bills the person's plan or key. Gate it: main loop only, `reason === 'answer'`, the turn changed something, and an off switch in `$.store`.
- Through Bedrock, Vertex or a gateway put the static text at the start of `prompt`, not in `system`.

## B18. Processes, files, network, environment

- `$.process.run(['git','status'], { timeoutMs })` → `{ exitCode, stdout, stderr }` whatever the exit code; rejects if the program cannot start or times out (30 s default, 10 min max): wrap it. No shell: argv is an array. On Windows prefer absolute paths for non-PATH binaries.
- `$.fs.read(path)` or `{ as: 'bytes' }` → `{ base64 }`; `$.fs.write` replaces the whole file; `$.fs.list` is one level; 4 MiB per file; `$.fs.stat(p, { resolve: true }).realPath`.
- `$.http.fetch(url, init)` → `{ status, ok, headers, text }`; 30 s, 5 redirects, 4 MiB; drops `Authorization` on a cross-origin redirect.
- `$.env.get('HOME')` with a literal name. `$.settings.read`, `$.session.usage()` (`context.tokens/window/percent`, `rateLimits`, `cost.usd`), `$.session.messages()` (`{ role, text, toolUses }`, newest 4,096), `$.session.cwd()`, `$.session.root()`, `$.session.repo()`, `$.session.surfaces()` (empty means headless).
- `$.prompt.fill({ text, mode: 'replace' | 'append' | 'insert' })` drafts into the prompt box (template `reply-choices`); `$.ui.copy({ text, surface: e.surface })`; `$.ui.selection()` returns the mouse selection.

## B19. Start a turn from the background, message other sessions

- `$.prompt.submit({ text })` queues a prompt for when the session is idle and resolves when that turn **starts**; never await it inside a hook that runs during a turn. `asUser: true` sends it as the person's words.
- `$.session.send({ to: { sessionId } | { agentId } | address, text })` → `{ isDelivered, reason? }`. Incoming messages pass `session.receive` (`{ consumed: reason }` hides one from Claude). Do not trust the sender's name.

## B20. Subagents

- `$.agent.list()` → `{ id, name, parentId, type, status }`; `agent.spawn` fires on a launch (some named teammates were missed on 2.1.287: track `agentId` on `tool.call`/`turn.complete` too).
- `$.agent.register({...})` declares a subagent type `<plugin>:<name>` (from `session.start` only); `$.agent.spawn({ subagentType })` always runs in the background.

## B21. Grid of cells (`Raster`) and animation (`$.ui.blit`), terminal only

```js
const DEFAULT = 0x01000000
function cellsOf(rows) { return new Uint8Array(Uint32Array.from(rows.flat().flatMap(([ch, fg]) => [ch.codePointAt(0), fg, DEFAULT])).buffer).toBase64() }
if (!('Raster' in $.ui.resolve(e))) return Text({ children: ['This needs the terminal.'] })
Raster({ key: 'grid', columns: 3, rows: 2, cells: cellsOf(rows) })
$.clock.every(100, () => void $.ui.blit({ requestId: PANE, key: 'grid', columns: 3, rows: 2, cells: cellsOf(nextRows()) }).catch(() => {}))
```

- One `Raster` for a grid, never a `Box` per cell; one-cell-wide characters only. The desktop has no `Raster`: draw pixels as `Box` runs (BorjaGM1's `kit/pixels.tsx`), block characters show seams there.
- `Image` (terminal only, kitty and Ghostty, not through tmux or ssh): `source: { png } | { rgba, width, height } | { file, format, generation }`; bump `generation` when a path is reused.

## B22. `Client`: a region with its own keys and pointer

```tsx
<Client key="board" module="./board.tsx" props={{ points }} width={cols} height={rows} />
// board.tsx: export default (props, surface) => { if (surface.state === undefined) { surface.onKey(k => surface.post(k)); surface.every(100, tick) } … }
on('ui.message', { requestId: PANE }, async ($, e) => { /* e.data is what the Client posted */ return {} })
```

- A Client has no `$`; it talks to the hooks module only through `post` → `ui.message`. Failures arrive as `ui.fault`. Ctrl+C, Ctrl+Z and Esc never reach it. Some desktop builds drew a placeholder for it: check first. Games: `examples/community/cc-arcade/`.

## B23. Sound and speech

- `$.audio.play({ asset: 'sounds/done.wav' })` plays a file of the mod; `$.audio.speak(text)` speaks (first 4,096 characters). Typical trigger: `turn.complete` with a long `durationMs`.
- `play` uses `afplay`: macOS only. A Linux or Windows terminal plays nothing and the call still resolves. On Windows run a constant PowerShell script and pass the path in `env`, never in the command text:
  ```js
  await $.process.run(['powershell', '-NoProfile', '-Command', '(New-Object Media.SoundPlayer $env:MOD_WAV).PlaySync()'],
    { env: { MOD_WAV: soundPath }, timeoutMs: 5000 }).catch(() => {})
  ```
- Sound packs and generators: `resources.md` §5.

## B24. A noun on `$` for other mods

- `on('engine.create', async ($, e, next) => ({ ...await next(e), topo }))` plus a contract `types/index.d.ts`: `export type Topo = {...}; declare module 'claude-code' { interface EngineInterface { topo: Topo } }`, with no imports. Dependents list the plugin under `"dependencies"`. Prefer shared `$.state` unless the contract is an action with a result.

## B25. Animate without redraw storms

```tsx
const frame = atom({ plugin: 'my-mod', key: 'frame' } as const, 0)
let ticker: { cancel: () => void } | undefined
on('turn.start', async ($, e, next) => {                    // tick only while something moves
  ticker?.cancel()
  ticker = $.clock.every(120, () => void update($, frame, n => (n + 1) % FRAMES.length).catch(() => {}))
  return next(e)
})
on('turn.complete', async ($, e, next) => {
  const r = await next(e)
  if (e.agentId === undefined) { ticker?.cancel(); ticker = undefined }
  return r
})
```

- Write only when the drawn value changes (`update` returning the same value writes nothing); every write a drawing reads redraws it, and the desktop blinks on each.
- Terminal grids: mount a keyed `Raster` once and push frames with `$.ui.blit` (B21); a `deny` means the site is gone, so stop until it renders again.
- Desktop: one plain `Svg` with SMIL animates by itself; every band redraw rebuilds it, so start each animation at `begin="-<elapsed>s"` to continue in phase.
- A `Client` module (B22) animates on its own clock on the terminal with no hook traffic.
- Wake for the next change of the shown text, not on a fixed tick: `$.clock.after(msUntilTextChanges, …)`.

## B26. Draw on every surface

```tsx
on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
  const below = await next(e)
  const ui = $.ui.resolve(e)
  if (e.surface === 'terminal' && 'Raster' in ui) return <ui.Box flexDirection="column"><ui.Raster key="art" columns={W} rows={H} cells={cells} />{below}</ui.Box>
  if (e.surface === 'desktop' && 'Svg' in ui) return <ui.Box flexDirection="column"><ui.Svg source={svg} alt="Plan progress" width={e.props.bodyColumns * 8} height={24} />{below}</ui.Box>
  return <ui.Box flexDirection="column"><ui.Text>{oneLine}</ui.Text>{below}</ui.Box>
})
```

- Branch on `e.surface` first: the element table can name an element the surface draws as nothing.
- `Svg` needs `alt`, `width` and `height` in pixels (about 8 px per cell of `bodyColumns`); clicks inside it never reach the mod, so lay `Button`s over it.
- VS Code, mobile and Remote Control views draw no mod UI: a toast or the command's text is the fallback.

## B27. Tell the model without the system prompt

```js
on('tool.call', { tool: ['Edit', 'Write'] }, async ($, e, next) => {
  const ran = await next(e)                                           // the edit runs first
  if (ran.deny !== undefined || ran.isError === true) return ran
  const note = await lint($, String(e.file_path))
  return note ? { ...ran, context: [...(ran.context ?? []), note] } : ran   // only the model reads it
})
on('prompt.submit', async ($, e, next) =>
  next({ ...e, context: [...(e.context ?? []), 'Open review threads: 3 (see /threads)'] }))
```

- Works where the built-in guard skips `prompt.compose`. A note on the result arrives exactly when it matters; replace one named block instead of piling notes up.
- A sentence in `tool.describe` (fixed for the session) steers calls before they happen; the deny text corrects them after.

## B28. Do it after the hook returns

```js
on('command.run', { command: 'handoff' }, async ($, e) => {
  $.clock.after(0, () => void $.command.run({ command: 'clear' })
    .then(() => $.prompt.submit({ text: brief, asUser: true })).catch(() => {}))
  return { text: 'Clearing and continuing with the brief.' }
})
```

- `$.command.run` rejects inside a hook the turn is waiting on; `$.prompt.submit` resolves when its turn starts, so awaiting it in such a hook deadlocks; `$.session.compact` is refused mid-turn. Return first, act from a timer.
- Same for heavy work after a tool call or a turn: `void` it from `$.clock.after(0, …)` so the turn never waits.

## B29. State shared by sessions

```js
async function bump($: EngineInterface, id: string) {          // one key per writer: no lost updates
  await $.store.set(`run:${id}`, { at: await $.clock.now(), ok: true })
}
async function board($: EngineInterface) {                       // fold on read
  const keys = (await $.store.keys()).filter(k => k.startsWith('run:'))
  return Promise.all(keys.map(k => $.store.get(k)))
}
```

- `$.store` is one JSON file per plugin that every session and project shares, with no lock: same-key read-modify-write from two sessions loses writes. Prefix keys by project (`hash(await $.session.root())`) and by session where they are per session; prune old keys.
- Only one session should act (play a bed, run a sweep): a lease key with a heartbeat and a takeover delay.
