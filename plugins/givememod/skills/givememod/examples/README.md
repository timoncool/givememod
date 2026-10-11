# Examples

Real mods to read and borrow from. They are kept as files to read, not to load as they are: the community folders hold the main hooks module (and its types contract where it has one), not every helper file; follow the link for the whole mod.

## Official samples (Anthropic, Apache-2.0)

From [anthropics/claude-code-playground › claude-code/mods](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods). Each `.mjs` keeps its license header; each has its README beside it.

| File | What it teaches |
|---|---|
| `official/token-weather.mjs` | a band built from `$.session.usage()` after each main-loop turn, a block-character sparkline, width-aware layout. Note: it reads `e.hasSurvey` / `e.bodyColumns`; the props live under `e.props` |
| `official/blast-radius.mjs` | holding a risky Bash call inside `tool.call`: measure what it would change, open a pane with Proceed/Cancel, poll inside a `$` call, `next.signal.aborted`, a 10-minute cap, fall back to the band when the pane cannot be placed, one hold at a time |
| `official/replay-theater.mjs` | recording a turn's file edits and stepping through the diffs in a pane |

Built-in mods with tests, the best reference for structure: [anthropics/claude-code › mods](https://github.com/anthropics/claude-code/tree/main/mods) (`diff`, `agents-md`, `sec-default`, `telemetry`).

## Community (MIT, license file in each folder)

| Folder | Source | What it teaches |
|---|---|---|
| `community/hamzafer-context-bar/` | [hamzafer/claude-code-mods › context-bar](https://github.com/hamzafer/claude-code-mods/tree/main/mods/context-bar) | stacked context bar by `/context` category, atoms that survive reloads, `/command` toggle kept in `$.store`, `session.compact` refresh |
| `community/hamzafer-agent-radar/` | [hamzafer/claude-code-mods › agent-radar](https://github.com/hamzafer/claude-code-mods/tree/main/mods/agent-radar) | one band line per running subagent from `agent.spawn` + `tool.call` with `agentId`, finished agents linger 30 s, a `/radar` pane |
| `community/hamzafer-glance/` | [hamzafer/claude-code-mods › glance](https://github.com/hamzafer/claude-code-mods/tree/main/mods/glance) | one line of "what needs you" from MCP tools (`$.mcp.call`) on a 5-minute poll with a 1-minute countdown tick that costs no fetch |
| `community/hamzafer-cache-clock/` | [hamzafer/claude-code-mods › cache-clock](https://github.com/hamzafer/claude-code-mods/tree/main/mods/cache-clock) | working around "plugins cannot register a status line": a setup command that wraps the person's own statusLine script |
| `community/cc-arcade/` | [sezaakgun/cc-arcade](https://github.com/sezaakgun/cc-arcade) | games as `Client` surface modules (`boards/*.tsx`) with their own frame clock and keys, `ui.message` back to the hooks module, pause on `turn.complete`, a pet fed by tool calls, best scores in `$.store`; pure game logic in separate testable modules |
| `community/image-view/` | [jarrodwatts/claude-image-view](https://github.com/jarrodwatts/claude-image-view) (fork [GGGODLIN/cc-mod-image-view](https://github.com/GGGODLIN/cc-mod-image-view)) | thumbnails of pasted images above the prompt: pasting raises no `prompt.edit`, so the draft is polled every 200 ms; `Image` with kitty graphics, `UserMessage` restyling |

More of the best, by job, with links: `../references/landscape.md`. Reusable assets and helper kits harvested from public mods: `../references/resources.md`.
