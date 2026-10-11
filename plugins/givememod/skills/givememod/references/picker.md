# Picker: read the situation, propose a mod, tune it

The goal: in a few seconds, from the conversation in front of you, name one small mod that would make this task more visible, safer or faster, build it from a template, and adjust it to taste. A good one-off mod lives for one conversation and is thrown away; a mod the person keeps becomes a favorite (SKILL.md, step 7).

## 1. Read the situation

Look at, in this order:

1. **What the person asked for, word for word.** "Make me a mod that…" settles it; skip to step 3.
2. **The shape of the work in this conversation.** A plan or todo list in play, many files being edited, a long-running command or deploy, a migration with N steps, risky commands, subagents or workflows, repeated questions ("status?", "how much is left?"), waiting on CI or a PR, images or Markdown being produced, long answers ending in options.
3. **Session state.** Context fill, plan limits, cost, cache warmth (`$.session.usage()`); how long the session has run; compactions so far.
4. **The project.** Language and tooling (`package.json`, `Cargo.toml`, `pyproject.toml`), git state, CI provider, dev servers, the domain (music, games, trading, docs, infra).
5. **Favorites.** `~/.claude/givememod/FAVORITES.md` if it exists: a kept mod that fits beats a new one.

## 2. Situation → candidate

| Situation in the conversation | Candidate | Start from | More in |
|---|---|---|---|
| A plan, checklist or todo list drives the work | progress bar of Claude's own task list | `templates/plan-progress` | landscape §2.9 |
| Many files are being read and edited | files-touched line + `/files` pane | `templates/files-touched` | §2.1 (Files) |
| Long session, context filling, compactions coming | context gauge with sparkline | `templates/context-gauge` | §2.1, §2.2 |
| "What did that turn do?", long autonomous turns | receipt line under each answer + toast on long turns | `templates/turn-receipt` | §2.8 |
| The goal drifts, many side quests | pinned goal with elapsed time | `templates/goal-pin` | §2.4 (Scope) |
| Destructive commands, prod, migrations, `rm`, force push | hold risky commands until approved | `templates/risky-hold` | §2.3 |
| Waiting on tests, CI, a deploy, a build, a port | rerun a command on a timer, status + toast on change | `templates/watch-command` | §2.5, §2.11 |
| Answers end with numbered options | options as buttons, digit fills the prompt | `templates/reply-choices` | §2.6 |
| Decisions, todos for the person, links pile up | pinboard Claude writes through its own tool | `templates/pinboard` | §2.7 |
| Focus block, deadline, break reminder, timed task | countdown above the prompt | `templates/focus-timer` | §2.14 |
| Anything else that needs a band, a command and a guard | the blank skeleton | `templates/starter` | blocks.md |
| Subagents or workflows running | one line per running subagent | blocks B3 + B20 + B7 | §2.1 (Subagents), `examples/community/hamzafer-agent-radar` |
| A migration or batch job with a known N | progress band fed by a counter file or log | blocks B13 + B3 | §2.5 (long jobs) |
| Images, Markdown, Mermaid, HTML produced | preview pane or inline rendering | blocks B4 + B15 + B21 | §2.12 |
| Repeated "status?" questions | instant `/status` command with no model turn | block B2 | §2.6 |
| Secrets in outputs | mask in tool results before the model reads them | block B9 (rewrite result) | §2.3 (Secrets) |
| The person waits a lot | game, pet or ambient scene shown only while working | blocks B3 (`isWorking`) + B22 | §2.14, `examples/community/cc-arcade` |
| Project data matters (studio queue, store orders, trading) | themed band from the project's own CLI or local API | blocks B13 + B18 + B3 | §2.11 |
| Cost or plan limits are a concern | limits and cost band | block B3 + `$.session.usage()` | §2.1 (Limits), §2.2 |
| Long idle gaps between prompts | cache countdown, compact or warn before a cold send | blocks B13 + B12 | §2.2 |

Combine when several fit: one plugin, one `AbovePrompt` hook, one row per concern, `next(e)` when there is nothing to say. Three rows is the ceiling for a band.

Before proposing, check what would stop it working here:

- **Worktree subagents in use** (`Agent` with `isolation: "worktree"`): any mod that hooks `tool.call` on Bash (`risky-hold`, `turn-receipt`, the `starter` guard) makes their Bash calls refused ([#92533](https://github.com/anthropics/claude-code/issues/92533)). Propose something else or say it.
- **Team or Enterprise sign-in, or managed settings**: installed mods' `classic.*`, `prompt.compose`, `prompt.section`, `prompt.context` hooks are skipped. Reach the model through `prompt.submit` or tool-result context (`techniques.md` §6).
- **Where it must draw**: the terminal and the desktop Code tab draw; VS Code, `claude -p`, Remote Control views and cloud sessions do not. Sound plays only on macOS.
- **Windows**: match `PowerShell` beside `Bash`; run `.cmd` tools through `cmd /c`.

For more ideas than the table: `landscape.md` (what 3,057 public mods do), `techniques.md` (how the good ones do it), `resources.md` (glyphs, palettes, icons, sprites, sounds, helper files to copy).

## 3. Propose in one line, then build

### Offering one unasked

The skill may offer a mod when nobody asked, so that a fitting one appears by default. The bar is high, because an offer interrupts:

- the work will run for a while yet (a plan of five or more steps, a migration or batch with a known N, a wait on CI, a deploy or a long command, a session already near its context limit);
- one row of the table above fits plainly, and a template covers it;
- nothing in the conversation says the person wants no extras, and no offer was declined in this conversation;
- a favorite that fits goes first: "Turn on <favorite> for this?" instead of building anew.

Offer once per conversation, at a natural pause (after a plan is agreed, before a long run starts), as the last line of a reply, never in the middle of a fix. A "no" closes the subject for the conversation.

### The offer

When nobody asked, offer one candidate (two at most), each in one line with what it shows, where, and its cost:

> Can make a mod for this: a plan bar above the prompt from your task list (12 steps), plus a line of files touched. No model calls. Build it?

Then, on a yes, build from the template in the session's dev-mods folder (SKILL.md, steps 3–6). A request is the yes: "make me a mod for X" or `/givememod X` builds X; `/givememod` alone builds the best candidate at once and names the runner-up in one line.

## 4. Tune it

The person will ask for changes. The usual ones and where they live:

| They say | Change |
|---|---|
| "Shorter / one line / less noise" | trim the text, `wrap="truncate-end"`, drop the least important part, show only when relevant |
| "Put it under the prompt instead" | move from `AbovePrompt` to `PromptHint` `tail` (B15) or `$.ui.status` |
| "Make it a sidebar" | add a `Pane` and a `/command` that opens it (B4) |
| "Colour / style" | theme keys (`success`, `warning`, `error`, `claude`, `inactive`), hex on desktop |
| "Only while Claude works" | `if (!e.props.isWorking) return next(e)` |
| "Show it only after N / above X%" | a threshold constant at the top of `register.tsx` |
| "Russian labels / my language" | change the strings; keep model-facing text (command replies) short |
| "Also tell Claude" | return the fact in a command's `{ text }`, or add one `context` line in `prompt.submit` (costs tokens every turn: say so) |
| "Ask me before X" | a `tool.call` hold (B10) |
| "Keep it next time" | promote to a favorite (SKILL.md, step 7) |
| "Turn it off" | its toggle command, or delete the mod folder |

## 5. Not a mod

Say so in one line and stop when a cheaper tool does the job: a fixed allow/deny is a permission rule; a script you already have on an event is a settings hook; instructions you keep pasting are a skill; reaching an outside system is an MCP server (official/overview.md, "Compare mods…").
