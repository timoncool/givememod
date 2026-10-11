---
name: givememod
description: "Builds Claude Code mods (function-hook plugins that draw bands above the prompt, panes, toasts and status lines, guard tool calls, add instant /commands and tools) for the conversation in front of you: reads the situation, proposes a fitting one-off mod, builds it from tested templates, loads it live and tunes it to taste; kept mods become favorites. Ships 29 building blocks, 11 tested templates, a decomposition of 3,057 public mods with links, the techniques, reusable assets (glyphs, palettes, icons, sprites, sounds), helper files and tools found by reading 222 mod repositories, curated examples, gotchas with the official limits, a test kit guide and a review checklist. Use when the person says /givememod, give me a mod, make a mod, mod for this chat, сделай мод, мод под этот диалог, придумай мод, a band/bar/line above the prompt, a sidebar or pane, a progress bar, a counter, a status line, a toast, a guard that asks before X, hooks.json modules, register.tsx, ui.render, AbovePrompt, dev-mods, claude plugin validate or test, Claude Mods, function hooks; or asks why a mod does nothing, or whether a third-party mod is safe to install. Also offer one unasked, once per conversation, when a long plan, a batch with a known N, a wait on CI or a deploy, risky commands or a filling context plainly fit a template."
argument-hint: "[what the mod should show or do]"
---

# givememod: a mod for the conversation you are in

A mod is a Claude Code plugin whose `hooks/hooks.json` names a hooks module (`"modules": ["./register.tsx"]`). Its code runs **inside** Claude Code: `on(event, matcher?, ($, e, next) => …)` observes an event, rewrites it (`next({ ...e, x })`) or answers it (return without `next`). Everything outside goes through `$`. A mod can draw (a band above the prompt, a pane, toasts, a status line, restyled transcript rows), hold a tool call until the person answers, add `/commands` that run with no model turn, give Claude tools, and share state between hooks.

Mods need Claude Code 2.1.287+ in the terminal and 2.1.286+ in the desktop Code tab. Only the terminal and the desktop Code tab draw; hooks also run in `claude -p`, the SDK and the VS Code panel, where nothing is drawn. WSL sessions in the desktop app load no plugins.

This skill exists so that any conversation can get its own small, throwaway mod (a plan bar, a counter of files touched, a goal pinned above the prompt, a guard on the one risky command of this task) exactly when it helps, and so that the ones the person likes become favorites.

## Order of trust

1. The types file of the running build: `<mod>/.claude-plugin/types/claude-code/index.d.ts` once a mod has loaded, or the path the built-in `plugin-authoring` skill names before that. Line 1 is the version. Take every field, event and method shape from it (grep `'tool.call'`, `Pane: {`, `export type X`), never from memory.
2. `claude plugin validate <dir>`: what the engine actually reads from the code.
3. The official docs in `references/official/`. They are Anthropic's and are not shipped in the public repository: the first time this skill runs and the folder holds only its README, fetch all ten pages into it at once, from this skill's base directory:
   ```bash
   for p in overview create events interface api test troubleshoot admin reference gallery; do curl -sfL "https://code.claude.com/docs/en/plugins/mods/$p.md" -o "references/official/$p.md"; done
   ```
   Fetch them again after a Claude Code update. `references/api-index.md` lists every event, `$` method and `next` field of the build it was made from, one line each.
4. This skill.
5. Community mods and skills: hypotheses; some describe early-access builds (see "Stale claims" in `references/gotchas.md`).

## The pipeline

### 1. Read the situation and pick a candidate

Use `references/picker.md`: what the person asked, the shape of the work (plan, many files, long jobs, risky commands, subagents, waiting, options at the end of answers), session state, the project, and the person's favorites. Map it to a template or a combination of blocks. Pick the smallest form: a status line before a band, a band before a pane, an observer before a rewriter, zero model calls unless the value needs them.

If a permission rule, a settings hook, a skill or an MCP server does the job, say so in one line and stop.

### 2. Propose in one line (only when nobody asked)

"Can make a mod for this: <what it shows>, <where>, <cost>. Build it?" One candidate, two at most.

Asking is already the yes. "Make me a mod for X" or `/givememod X`: build what X describes, filling the gaps from the conversation. `/givememod` alone: read the situation, build the best candidate straight away, say in one line why it fits, and name the runner-up in one line in case they prefer it.

Unasked, offer once per conversation when the work plainly fits a candidate and will run a while (a long plan, a batch with a known N, a wait on CI or a deploy, a filling context); the bar and the timing are in `references/picker.md`, "Offering one unasked". A declined offer is not repeated.

### 3. Build it live

- Load the built-in skill `plugin-authoring` with the Skill tool. It names the session's mods folder, `~/.claude/dev-mods/<session-id>/`, the types file of this build, and starts the hot-reload watch.
- **Before the first write**, tell the person in their language, in one line: a dialog "Enable hot reloading for this session?" will appear; "Enable for this session" loads the mod when this reply ends.
- Copy the closest template from `templates/` into `~/.claude/dev-mods/<session-id>/<name>/` (keep the template's plugin name unless it clashes; renaming means changing `plugin.json`, every `atom({ plugin: … })` literal and the `PluginState` key together). Adapt `hooks/register.tsx` with `references/blocks.md`. Drawing details: `references/ui-cookbook.md`. For the look (glyphs, colours, an icon, a sprite, a sound) and for pure helper files worth copying (cell width, Raster packing, shell parsing), take them from `references/resources.md` with their licence; for how other mods solved the same problem, `references/techniques.md`.
- The templates' labels are English. In a conversation held in another language, write what the person sees (band text, pane rows, toasts, command replies) in that language; keep command names, plugin names and model-facing instructions in English.
- For a mod meant for a repository or for sharing, write it in the repo instead and load it with `claude --plugin-dir <absolute path>` (or `CLAUDE_CODE_PLUGIN_DIRS` in the `env` block of `~/.claude/settings.json` for desktop sessions). Never `git init` inside dev-mods; gitignore `.claude-plugin/types/`.

### 4. Rules the loader enforces (a violation means the mod does not load)

- Spell every call in full: `$.store.get(…)`. Never `const ui = $.ui`, destructuring `$`, or a computed index. Pass `$` only to functions declared at the **top level of the same file**, and to `read`/`update` from `claude-code`.
- Event names are string literals; matchers are object literals (a value, an array or a regex). One matcherless hook per event per module.
- Imports: relative files of the plugin and the bare `claude-code` only. No Node, npm, `require`, dynamic `import()`, `setTimeout`/`setInterval` (use `$.clock.after/every`), no `WebAssembly`.
- JSX only in `.tsx`/`.jsx`; never declare `h` or `Fragment` or an `@jsx` pragma; elements come from `$.ui.resolve(e)`.
- `atom({ plugin: 'x', key: 'y' } as const, initial)` with literals, held in a `const`; every key declared in `types/index.d.ts` (`declare module 'claude-code' { interface PluginState { … } }`, a real exported type, no `export {}`), and that file named in `plugin.json` → `"types"`.
- `focus`, `closeOnEscape`, `holdToasts`, `autoFocus` take only `true`: omit them otherwise.
- Plugin names must not start with `claude-`, `anthropic-`, `anthropics-`, `cc-plugin-`.

### 5. Semantics that break mods most often

- **Fail-open by default.** A hook that throws, outruns its 10 s own-time budget (time inside `next` and `$` calls is free, `$.clock.sleep` is not) or returns a wrong shape is skipped. Every guard gets `.catch(($, e, next) => next.called ? next(e) : { deny: 'why' })`.
- `{ deny }` after `await next(e)` undoes nothing: decide before `next`. Answering `tool.call` without `next` skips the person's settings `PreToolUse` guards; never return `allow` from `tool.check` unless asked.
- State: module variables reset on every reload; `$.state` lasts until the session ends or `/clear`, `/resume`, `/branch` (after which `session.start` does not fire: reload in `classic.SessionStart` with `source: ['clear','resume','fork']`); `$.store` survives sessions (4 MiB, shared, re-read before writing).
- `ui.render` only reads: no `$.state.set`, files, processes or model calls there.
- `turn.complete`, `turn.step` and `tool.call` fire for subagents too: check `e.agentId === undefined`.
- A pane opened unasked needs 144 columns: check `isPlaced` and fall back to the band, a toast or text.
- The band is shared: draw `{await next(e)}` below your rows, yield to `e.props.hasSurvey`, size to `e.props.bodyColumns`. (The official token-weather sample reads `e.hasSurvey`/`e.bodyColumns`: a bug, the props live under `e.props`.)
- `$.command.register` throws on a taken name and skips the rest of the hook: register last or catch.
- Text in `{ deny }`, `{ result }` and a command's `{ text }` is read by the model: write it as an instruction.
- `$.ui.ask` is an `AskUserQuestion` call underneath: the question ends with `?`, 2–4 labels, the safe one first.
- Where the built-in guard loads (Team or Enterprise sign-in, managed settings), an installed mod's `classic.*`, `prompt.compose`, `prompt.section` and `prompt.context` hooks never run: restore after `/clear` on `turn.start` too, and reach the model through `prompt.submit` or tool-result `context`.
- Any `tool.call` hook on Bash breaks Bash inside `Agent(isolation: "worktree")` subagents ([#92533](https://github.com/anthropics/claude-code/issues/92533)): say so before building a Bash guard for someone who uses them.
- `$.command.run` rejects, and an awaited `$.prompt.submit` deadlocks, inside a hook the turn waits on: return, then act from `$.clock.after(0, …)`.
- `$.audio.play` sounds only on macOS.

All traps with symptoms: `references/gotchas.md`.

### 6. Check and hand over

1. `claude plugin validate <dir>`: `hooks:` and `calls:` match the plan, guards show `with .catch`.
2. `claude plugin test <dir>`: the template's test adapted to the change, green (`references/testing.md`).
3. Once loaded, `tsc -p <dir>` (validate and test do not type-check). A headless 2.1.295 load writes no types ([#100837](https://github.com/anthropics/claude-code/issues/100837)): type-check after the interactive load, or against the types file `plugin-authoring` names.
4. Seen live: the mod loads at the end of this reply (dev-mods) or on save (`--plugin-dir`). A refused drawing shows as a dim line `<mod>: ui.render (X) refused: <reason>`.
5. Tell the person: where it lives, what it shows, its toggle command, its cost, what was verified (validate, tests) and what was not (how it looks on screen until they see it). Offer one-line tweaks (`references/picker.md`, "Tune it").

### 7. Favorites: keep the mods the person likes

When the person likes a mod ("keep it", "сохрани", "в избранное", "use this every time"), with their yes:

1. Copy its folder out of dev-mods (cleaned after `cleanupPeriodDays`), without `.claude-plugin/types/`, into a skills folder. A folder there that carries `.claude-plugin/plugin.json` is a skills-directory plugin: it loads in place as `<name>@skills-dir` from the next session start or `/reload-plugins`, with no marketplace and no install, in the terminal and the desktop app alike.
   - every project: `~/.claude/skills/<name>/`;
   - one project only: `<project>/.claude/skills/<name>/`, which also shares it with everyone who clones the repository.
2. Add one line to `~/.claude/givememod/FAVORITES.md`: `- <name>: <what it shows> · <where it lives> · propose when <situation>`. The picker reads this file first.
3. Tell the person how to switch it off: `claude plugin disable <name>@skills-dir`, or `"<name>@skills-dir": false` under `enabledPlugins` in a settings file (project settings switch it off for one project).

Where an organization sets a plugin allowlist (`strictKnownMarketplaces`) without a `{ "source": "skills-dir" }` entry, skills-directory plugins do not load: use the dev-mods copy for the session and say why. A `--plugin-dir` or installed plugin of the same name wins over the skills folder; the copy in `~/.claude/skills/` wins over the project's. To share a favorite beyond one repository, give it a marketplace (the "Share a mod" row below).

## Other requests

| Request | Do |
|---|---|
| "Why does my mod do nothing?" | `references/gotchas.md`, then `references/official/troubleshoot.md`; `claude --debug-file ./mod.log --plugin-dir <dir>` and grep the mod's name |
| "Is this mod safe to install?" | `references/review-and-cost.md`: validate without loading, read every call that needs a reason, give a verdict |
| "What mods exist / ideas?" | `references/landscape.md` (jobs, mechanisms, best examples with links, open niches); the full table `references/catalog/mods.tsv`; live catalogue <https://mods.aidojo.si/> |
| "How do good mods do X?" | `references/techniques.md` (18 problem areas, each move with the file that does it) |
| "Make it look better / add a sound / an icon" | `references/resources.md` (glyphs, palettes, icons, pixel art, sounds, helper files, tools) |
| "Show me how X is done" | `references/blocks.md`, `templates/`, `examples/` |
| Share a mod | marketplace file beside `plugin.json` (`"source": "./"`), bump `version` each release, README says the tested Claude Code version; install line `/plugin install <mod> --marketplace <owner>/<repo>` |

## Files

| File | Read when |
|---|---|
| `references/picker.md` | step 1–2 and tuning: situation → candidate |
| `references/blocks.md` | building: 29 blocks with code |
| `references/ui-cookbook.md` | drawing: sites, elements per surface, focus, desktop quirks |
| `references/gotchas.md` | anything fails; the official limits; the built-in guard; open issues |
| `references/testing.md` | writing or fixing tests |
| `references/review-and-cost.md` | third-party mods, token cost, composing mods |
| `references/landscape.md` | what people build and why, with links to the best mods |
| `references/techniques.md` | how the best mods solve recurring problems: band sharing, animation, surfaces, guards, model calls, state across sessions |
| `references/resources.md` | glyphs, palettes, icons, sprites, sounds, data tables, helper files to copy, tools around mods, with licences |
| `references/api-index.md` | every event, `$` method and `next` field, one line each (Claude Code 2.1.293; rebuilt by `scripts/api_index.py`) |
| `references/catalog/mods.tsv` | every public mod: stars, link, hooks, `$` calls, reach, description |
| `references/official/` | the official documentation |
| `references/sources.md` | where everything comes from, and how to refresh it |
| `templates/` | 11 tested mods to start from (`templates/README.md`) |
| `examples/` | the official samples and the best community mods (`examples/README.md`) |
