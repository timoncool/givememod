# Changelog

## 1.0.1 — 2026-10-11

- Favorites go to a skills folder (`~/.claude/skills/<name>/`, or the project's `.claude/skills/` for one project), where Claude Code loads them as `<name>@skills-dir` with nothing to install, in the terminal and the desktop app; the local favorites marketplace is gone.
- `references/api-index.md`: every event (107 plus 33 classic), `$` method (81) and `next` field of Claude Code 2.1.293, one line each, built by `scripts/api_index.py` from the types file.
- The official docs are fetched in one go, all ten pages, the first time the skill runs.
- Gotchas: which copy of a same-named plugin loads, and why a mod kept in a skills folder may not.
- Sources: three more mod skills read (ngicks statusline and handle-events, the 2.1.273 snapshot of `plugin-authoring`).
- Templates, from a code review: `risky-hold` holds `rm -r -f`, `rm --recursive` and `TRUNCATE` without `TABLE`; `watch-command` runs the command through `cmd /c` on Windows (so `npm test` works) and answers `/watch 10` with the usage; `pinboard` writes atomically (parallel pins no longer overwrite each other) and keeps `/pin` when the tool name is taken; `starter` lets `--force-with-lease` through; `plan-progress` numbers a task with no id as the engine does. The `/clear` resets in `plan-progress` and `files-touched` are gone: `$.state` resets by itself.
- Catalogue: the verinoda link points where the repository moved. `docs/screenshots/`: desktop and terminal frames in three languages.

## 1.0.0 — 2026-10-11

First release.

- `/givememod`: reads the conversation, proposes a fitting mod in one line, builds it from a template in the session's mods folder, checks it with `claude plugin validate` and `claude plugin test`, tunes it on request. `/givememod <what>` builds what is described; on a long task the skill offers one mod by itself, once per conversation. Labels follow the language of the conversation.
- Favorites: kept mods go to `~/.claude/skills/<name>/` (or the project's `.claude/skills/`), where Claude Code loads them as `<name>@skills-dir` with no install; listed in `~/.claude/givememod/FAVORITES.md` and proposed first next time.
- 11 templates with tests: plan-progress, files-touched, context-gauge, turn-receipt, goal-pin, risky-hold, watch-command, reply-choices, pinboard, focus-timer, starter.
- References: picker, 29 building blocks, UI cookbook, gotchas with the official limits and the open issues that affect mods, testing, review and cost, sources.
- Landscape: 3,057 public mods decomposed into 17 jobs with mechanisms, best examples, unique ideas and open niches; the full catalogue as `catalog/mods.tsv`.
- Techniques and resources: 222 public mod repositories read file by file; the moves worth copying in 18 problem areas, and the glyphs, palettes, icons, sprites, sounds, data tables, helper files and tools worth reusing, each linked with its licence.
- `goal-pin` and `starter` restore their state on the next turn where the built-in guard skips `classic.*` hooks (Team, Enterprise, managed settings).
- Examples: Anthropic's sample mods (Apache-2.0) and community mods by hamzafer, sezaakgun and jarrodwatts (MIT).
