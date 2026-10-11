# Review a mod, price it, compose it

Use this before loading someone else's mod, and on your own before handing it over. Sources: the official admin page (`official/admin.md`), DannyMac180's ModSmith cost review and composition notes, Autopsias' review checklist, jclfocused's house rules.

## 1. Read what the engine reads

```bash
claude plugin validate --json <dir>
```

The `hooks:` and `calls:` lines are complete: the engine refuses a mod whose calls it cannot read statically. `env reads:`, `state reads/writes:` and `gating hook with/without .catch:` lines follow. Read the whole hooks module and everything it imports, `Client` modules included. Never load a third-party mod before this.

## 2. Calls that need a reason

| Call | What it can do | Ask |
|---|---|---|
| `$.process.run` / `.spawn` | run anything as the person, outside the Bash sandbox | which argv? any part from the model or a file? |
| `$.fs.write` | write any file the person can; permission rules do not cover it | under which root? checked with `realPath`? |
| `$.http.fetch` | send data off the machine | which host? what goes in the body? |
| `$.env.get`, `$.settings.read` | read secrets kept in env or settings | does any of it leave the machine? |
| `$.env.set`, `$.config.set` | change what later commands and MCP servers see | what, and is it put back? |
| `$.mcp.call` | call connected MCP tools with their credentials, no permission prompt | which server and tool? |
| `$.model.complete` / `.fork` | spend the person's plan | how often, gated how? |
| `$.prompt.submit`, `$.agent.spawn` | start turns and agents on its own | when, and saying what? |
| `$.session.send` / `session.receive` | message or swallow messages between sessions | why? |
| `$.session.authorize` | an auth handle to a first-party host | why does it need credentials? |
| `$.fs.read` of `~/.claude/` | read `.credentials.json`, transcripts of every project, other plugins' stores | which file, and why? |
| `$.tool.call` | run Claude's own tools (desktop session tools included) from the mod | which tool, and is the person asked? |

Every `$` call is an event the mods loaded above it can hook and read, request headers and bodies included; `ui.copy` is hooked before the clipboard write. A secret a mod puts in a `$` call is visible to every mod above it, and a redactor sees only what passes beneath it: chain order matters (`CLAUDE_CODE_PLUGIN_DIRS` order is chain order *(reported)*).

Where the built-in guard loads (Team or Enterprise sign-in, managed settings), an installed mod cannot change the system prompt, managed `CLAUDE.md`, managed hooks' decisions or settings reads; it can still read and write files, start processes, use the network, rewrite tool calls and prompts and approve calls an `ask` rule would prompt for. A `deny` rule still holds against Claude's tools, not against the mod's own `$.fs` and `$.process` (`official/admin.md`).

## 3. Hooks that need a reason

| Hook | Risk |
|---|---|
| `tool.call` answering without `next` | the person's settings `PreToolUse` guards never run for that call |
| `tool.check` returning `allow` | skips permission prompts; can approve what a settings hook blocked |
| `prompt.submit`, `session.append`, `prompt.section/compose/context` | rewrite what the model reads: an injection path |
| `ui.render{AskUserQuestion}` | redraws the dialog Claude asks the person in |
| `plugin.register` returning `refuse`, `engine.create` | decide which mods load and which nouns exist |
| a hook that never calls `next` | replaces every mod beneath it and the engine's behaviour |

## 4. Quality bar

- Guards fail closed (`.catch`), decide before `next`, use `realPath` for paths, put the safe answer first (Enter refuses).
- Waits live inside `$` calls (10 s own-time budget; 50 ms for `prompt.edit`).
- Render hooks only read state: no files, processes or model calls in `ui.render`.
- Panes check `isPlaced` and fall back; drawing mods say what they do where nothing draws.
- State in the right place (variable / `$.state` / `$.store`), lists capped, `$.store` writes caught.
- Tests exist for every branch of a guard; `validate --strict` clean or each warning named.
- Names legal (no `claude-` prefix); README says the Claude Code version it was tested on.
- README lists the footprint `validate` prints (hooks, calls, env reads) and what leaves the machine; a mod that hooks Bash warns about worktree subagents ([#92533](https://github.com/anthropics/claude-code/issues/92533)).
- No `package.json` or lockfile in the shipped plugin folder (a marketplace install would run npm there *(reported)*).

## 5. Cost per turn and the prompt cache

The cache is a prefix: tools, then system prompt, then messages. Changing an early part re-bills everything after it.

| Changes the prefix | What to do instead |
|---|---|
| `prompt.section` / `prompt.compose` text that differs between calls | stable text for the session |
| `tool.describe` answers that vary; `$.tool.register` after turn one | fixed descriptions, register in `session.start` |
| `prompt.context` changes | set once |
| `$.ui.invalidate` on `prompt.*` or `tool.describe` from a timer | only on a person's action |
| `turn.step` switching model or effort per request | decide once per task (`e.index === 0`), say the cost in the README |
| `$.session.append` notes | append-only keeps the cache, but every row is re-sent: keep them short |

Where model calls multiply: `turn.complete` (also for subagents), `turn.step` (every request), `tool.call` (every tool), `prompt.submit` (every prompt). Never in `ui.render`. Gates: `e.agentId === undefined`, `e.reason === 'answer'` and not aborted, something worth checking happened, a `/x off` switch in `$.store`, a rate limit.

`fork` vs `complete`: fork for questions about this conversation (served from the cache right after a turn; pays the whole prefix when cold or after `/model`); complete for a piece of text you hold (name a small model, set `maxTokens`).

Measure, do not guess: log `turn.complete`'s `e.usage` (cache read vs written) with the mod on and off; compare a fork's `usage.cache_read_input_tokens` with `(await $.session.usage()).context.tokens`.

Timers: a timer that calls `$.prompt.submit` starts a full turn (the whole context re-sent, at full price if the cache went cold). Keep-warm pings are real requests.

## 6. Composition

- Pass the chain on: return `next(e)` first when not acting; rewrite with `next({ ...e, changed })`; answer without `next` only for your own command or tool, narrowed by a matcher.
- Draw with others: `{await next(e)}` in band and pane trees; append to `modes` and `tail`, never replace them; yield to `hasSurvey`.
- Own your state; others change it only by hooking `state.set` for your `plugin`/`key` (contribute, veto, observe). Read back what landed after your own write.
- Order: first registered is outermost; tiers go prepend → user → append → builtin → core; `dependencies` run beneath their dependents. On the way down the inner rewrite wins; on the way up the outer one does. A mod cannot reorder itself: write position-sensitive behaviour in the README.
- Publish a contract others can import: one self-contained `types/index.d.ts`, named in `plugin.json`; change it additively.
- Hotkey clashes: list your hotkeys in the README; digits are shared by every band.

## 7. The report

```
Mod: <name> <version> by <author>
Verdict: LOAD | LOAD WITH CHANGES (<which>) | DO NOT LOAD (<finding>)
Tokens per turn: 0 | ~N on turns where X | one fork (~context from cache + ≤ maxTokens out)
Cache impact: none | one-off at <event> | every turn: <hook>
Off switch: </command> | none
Reach: L0 draws and remembers | L1 reads | L2 writes, runs or drives Claude | L3 network
It can touch: <capability: what, where, narrowed how>
It changes: <what the model reads or runs>
Open questions: <what the source does not say>
```
