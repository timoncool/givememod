# Changelog

## 1.0.0 — 2026-10-11

First release.

- `/givememod`: reads the conversation, proposes a fitting mod in one line, builds it from a template in the session's mods folder, checks it with `claude plugin validate` and `claude plugin test`, tunes it on request. `/givememod <what>` builds what is described; on a long task the skill offers one mod by itself, once per conversation. Labels follow the language of the conversation.
- Favorites: kept mods go to `~/.claude/givememod/` as a local marketplace, listed in `FAVORITES.md` and proposed first next time.
- 11 templates with tests: plan-progress, files-touched, context-gauge, turn-receipt, goal-pin, risky-hold, watch-command, reply-choices, pinboard, focus-timer, starter.
- References: picker, 29 building blocks, UI cookbook, gotchas with the official limits and the open issues that affect mods, testing, review and cost, sources.
- Landscape: 3,057 public mods decomposed into 17 jobs with mechanisms, best examples, unique ideas and open niches; the full catalogue as `catalog/mods.tsv`.
- Techniques and resources: 222 public mod repositories read file by file; the moves worth copying in 18 problem areas, and the glyphs, palettes, icons, sprites, sounds, data tables, helper files and tools worth reusing, each linked with its licence.
- `goal-pin` and `starter` restore their state on the next turn where the built-in guard skips `classic.*` hooks (Team, Enterprise, managed settings).
- Examples: Anthropic's sample mods (Apache-2.0) and community mods by hamzafer, sezaakgun and jarrodwatts (MIT).
