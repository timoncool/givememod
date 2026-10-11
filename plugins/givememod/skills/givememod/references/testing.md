# Testing a mod

`claude plugin test <dir>` runs every `*.test.ts(x)` against the engine's own `$`, with no session, sign-in or network. Official guide: `official/test.md`. Every template in `templates/` has a passing test to copy.

## How the kit is wired

- A test gets `($, on)`. `$` is the engine. Hooks the test registers with `on` sit **beneath** the plugin, where Claude Code would be, and nothing is beneath them: a call they leave unanswered throws `no implementation for <event>`.
- Answer `$` nouns with `{ value }`: `on('session.cwd', () => ({ value: '/repo' }))`. Answer events with their own result shape: `session.start` → `{ cwd }`, `turn.start` → `{ turnId }`, `turn.complete` → `{ text }`, `tool.call` → `{ result }` or `{ deny }`, `prompt.fill` → `{ isFilled: true }`.
- `mock.store(on, entries)`, `mock.env(on, vars)`, `mock.clock(on, { now })` answer those nouns from memory. The clock moves only on `await clock.advance(ms)`; `await clock.settle()` resolves what is due now.
- Plugins load at the test's first call on `$`: register the test's hooks first.
- `test(name, { plugins, options, timeoutMs }, body)`: inline plugins beside yours (loaded from their `register` source alone, so write literals inside), `userConfig` values, a timeout (5 s default).

## A world that most mods need

```ts
import { expect, mock, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const
const PANE = {
  component: 'Pane',
  requestId: 'my-pane',
  props: { title: 'Mine', isFocused: true, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 20 }, view: {} },
} as const

function world(on: Parameters<Parameters<typeof test>[1]>[1]) {
  mock.store(on, {})
  const clock = mock.clock(on, { now: 0 })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.root', () => ({ value: '/repo' }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('tool.register', ($, e) => ({ value: { tool: `mcp__my-mod__${e.name}` } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))   // the engine's own empty drawing beneath you
  return clock
}
```

## Drive the mod

```ts
await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
await $.tool.call({ tool: 'Edit', file_path: '/repo/a.ts', old_string: 'a', new_string: 'b' })   // answered by on('tool.call', …)
await $.turn.start({ turnId: 't1' })
await $.turn.complete({ turnId: 't1', answer: 'done', durationMs: 3000, isAborted: false, reason: 'answer' })
const r = await $.command.run({ command: 'my-cmd', args: '' })
await clock.advance(60_000)
```

## Test a drawing on every surface it claims

```ts
for (const surface of ['terminal', 'desktop'] as const) {
  const ui = await $.ui.mount({ plugin: 'my-mod', surface, ...BAND })
  expect(await ui.find({ type: 'Text', text: /1\/3/ })).toBeDefined()   // Text has no key: find by words
  await ui.press({ key: 'choice-1' })                                   // Buttons by key
  await ui.unmount()
}
```

- `ui.find({ type, text | key })`, `ui.findAll`, `ui.press({ key })`, `ui.input({ key, text, kind? })`, `ui.redraw(props)`, `ui.drawn()` (JSON of the whole tree).
- JSX splits `caret at {n}%` into separate children; draw captions as one template string so a search can match them.
- No `toBeCloseTo`: round before comparing.

## `$.ui.ask` in tests

It is an `AskUserQuestion` tool call underneath:

```ts
on('tool.call', ($, e) => {
  if (e.tool !== 'AskUserQuestion') return { result: 'ok' }
  const q = (e as unknown as { questions: { question: string }[] }).questions
  return { result: { questions: q, answers: { [q[0].question]: 'Run it' } } } as never   // { deny: 'x' } = dismissed
})
```

## Streaming events

Drive `$.turn.step(...)` with `.next()` until `done` and read `value` (after `for await`, `stream.result` came back `undefined` on 2.1.287).

## What a green run does not prove

That it looks right on screen, that real tools return what you stubbed, or what a model call costs. Say "tests pass, not seen on screen" until the person has seen it. See it for real: `claude --plugin-dir <abs path>` or the session's dev-mods folder.

## Gate before handing over

1. `claude plugin validate <dir>`: `hooks:` and `calls:` match the plan; guards carry `.catch`.
2. `claude plugin test <dir>`: green, each behaviour seen failing once.
3. `tsc -p <dir>` once a load has laid `.claude-plugin/types/` (validate and test do not type-check).
