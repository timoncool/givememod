# Templates

Eleven small, complete mods to copy and adapt. Each folder is a plugin (`.claude-plugin/plugin.json`, `hooks/hooks.json`, `hooks/register.tsx`, `types/index.d.ts`, `tests/*.test.ts`) and passes `claude plugin validate` and `claude plugin test` on Claude Code 2.1.292. None calls a model; none adds text to the context on its own.

| Template | Shows | Events and calls | Toggle | Typical tweaks |
|---|---|---|---|---|
| `plan-progress` | `Plan ███░░ 3/5 · Fixing the bug` from Claude's own `TodoWrite`/`TaskCreate`/`TaskUpdate` calls | `tool.call` ×3, `ui.render{AbovePrompt}`, `$.state` | `/plan-progress` | bar width, show only while working, stage names |
| `files-touched` | `Files: 4 read · 2 edited · 1 new · /files` and a pane listing them | `tool.call{Read,Edit,Write,NotebookEdit}`, `$.fs.exists`, band + `Pane` | `/files hide` | count Bash writes, group by folder, hint line instead of band |
| `context-gauge` | `Context 62% 124k / 200k ▂▃▅▆` | `turn.complete`, `session.compact`, `$.session.usage` | `/context-gauge` | show only above a threshold (`SHOW_FROM_PERCENT`), add limits or cost |
| `turn-receipt` | a line under each answer: `1m 15s · 3 tool calls (Edit 2, Bash 1) · 1 files changed · 1 failed`, a toast on long turns | `turn.start`, `tool.call`, `turn.complete` → `{ text }`, `$.ui.toast` | `/receipt on|off|toast N` | add tokens from `e.usage`, cost, sound |
| `goal-pin` | `Goal ship the login fix  12m` above the prompt, kept per project | `$.store`, `$.clock.every`, `classic.SessionStart` plus a `turn.start` restore | `/goal <text>` · `/goal done` | stronger reminder through `prompt.submit` context (costs tokens) |
| `risky-hold` | holds `rm -rf`, `reset --hard`, force push, `DROP`, migrations until **Run it** | `tool.call{Bash,PowerShell}` + `$.ui.ask` + `.catch` (fail closed) | remove the folder | add patterns to `RISKY`, add a pane with what it would change (`examples/official/blast-radius.mjs`) |
| `watch-command` | `⚠ watch npm: ok · 42 passed` under the prompt, a toast when the exit code changes | `$.clock.every`, `$.process.run`, `$.ui.status`, `$.ui.toast` | `/watch [seconds] <command>` · `/watch stop` | parse a percentage into a band bar, wake the session on failure (`$.prompt.submit`, ask first) |
| `reply-choices` | numbered options at the end of an answer become buttons; a digit in an empty prompt or a click drafts it | `turn.complete`, `prompt.submit`, `$.prompt.fill` | none | send instead of draft, accept lettered options |
| `pinboard` | a pane of decisions, todos and links; Claude pins through its own `mcp__pinboard__pin` tool, you with `/pin <text>` | `$.tool.register`, `tool.call{mcp__pinboard__pin}`, `Pane`, `$.store` per project | `/pin` | kinds, per-session instead of per-project, export to a file |
| `focus-timer` | `18:42 review [pause] [stop]` above the prompt, a toast at the end | `$.clock.every`, band Buttons | `/timer <minutes> [label]` · `/timer stop` | pomodoro cycles, sound (`$.audio.play`), pause while Claude works |
| `starter` | the blank skeleton: a band, a `/starter` toggle kept in `$.store`, a fail-closed Bash guard, reload after `/clear` (also on `turn.start` where `classic.*` hooks are skipped), tests on both surfaces | everything a first mod needs | `/starter` | rename and replace |

`risky-hold`, `turn-receipt` and the `starter` guard hook `tool.call` on Bash. While [#92533](https://github.com/anthropics/claude-code/issues/92533) is open, that makes every Bash call of an `Agent(isolation: "worktree")` subagent refused: leave them out of sessions that use worktree subagents. `focus-timer`'s sound idea plays only on macOS.

## Copying one

1. Copy the folder to `~/.claude/dev-mods/<session-id>/<name>/` (live in this session) or to a repo folder (`claude --plugin-dir`).
2. Renaming? Change `plugin.json` `name`, every `atom({ plugin: '<name>' … })`, the `PluginState` key in `types/index.d.ts`, the `mount({ plugin })` in tests, and for `pinboard` the tool name `mcp__<name>__pin`.
3. Edit, then `claude plugin validate .` and `claude plugin test .` in the folder.
