<div align="center">

# givememod

**Say /givememod and Claude Code builds a mod for the task in front of you.**

[![License](https://img.shields.io/github/license/timoncool/givememod?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/timoncool/givememod?style=flat-square)](https://github.com/timoncool/givememod/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/timoncool/givememod?style=flat-square)](https://github.com/timoncool/givememod/commits)
[![Page](https://img.shields.io/badge/page-givememod-4fc1e9?style=flat-square)](https://timoncool.github.io/givememod/)

**[English](README.md)** · **[Русский](README_RU.md)** · **[中文](README_ZH.md)**

<img src="docs/teaser-en.gif" alt="Seven tasks in the Claude Code desktop app and terminal: each time /givememod reads the situation and builds the mod that fits it: a plan bar, a hold on risky commands, a test watcher, a context gauge, a files pane, answer buttons, a kept favorite" width="860">

</div>

givememod is a Claude Code skill that makes Claude Code mods on demand. It reads the conversation you are in, proposes a small mod that fits it (a progress bar of the plan, a counter of files touched, a guard on the one risky command of this task, a watcher on your tests), builds it from tested templates, loads it live and tunes it until you like it. The mods you like become favorites; the rest disappear with the session.

## Why

Since October 2026 Claude Code has [mods](https://code.claude.com/docs/en/plugins/mods/overview): small plugins that run inside Claude Code and can draw a band above the prompt, open a sidebar, hold a tool call until you answer, or add a command that answers instantly. More than 3,000 public mods appeared in the first weeks. Most are general products. What is missing is the small mod you want for *this* task: the bar for this migration, the checklist for this bug, the guard for this deploy. givememod writes that one in a minute, and knows what the 3,000 others already figured out.

## Features

- **One command** — `/givememod a progress bar for this refactor`, or just "make me a mod for this"
- **Reads the situation** — plan in play, many files, long jobs, risky commands, subagents, waiting on CI, answers ending in options: it proposes the mod that fits, and on a long task offers one by itself, once
- **11 tested templates** — plan progress, files touched, context gauge, turn receipt, goal pin, risky-command hold, command watcher, reply buttons, pinboard with a tool for Claude, focus timer, blank starter; each passes `claude plugin validate` and its tests
- **Loads live** — written into the session's mods folder, it appears when the reply ends; every tweak reloads the same way
- **Favorites** — keep a mod and it goes to your skills folder, where Claude Code loads it in every session with no install; the next time a similar task comes up it is proposed first
- **The whole corpus inside** — 29 building blocks with code, a drawing cookbook, every documented trap with the official limits, the test kit, a review checklist for third-party mods
- **A map of 3,057 public mods** — what people build, why, how, and the best example for each job, every one linked
- **What the best mods know** — 222 mod repositories read file by file: the techniques, glyphs, palettes, icons, sprites, sounds, helper files and tools worth reusing, each with its source and licence
- **Zero tokens by default** — the templates make no model calls and add nothing to the context

## Quick Start

Paste this into Claude Code (terminal or the desktop Code tab):

```text
Install the Claude Code plugin givememod from https://github.com/timoncool/givememod. In the shell run `claude plugin marketplace add timoncool/givememod`, then `claude plugin install givememod@givememod`, and check that `claude plugin list` shows givememod enabled. Then tell me to run /reload-plugins (or restart Claude Code) so that /givememod appears, and after that to type /givememod in any conversation.
```

Or by hand, in any terminal:

```bash
claude plugin marketplace add timoncool/givememod
claude plugin install givememod@givememod
```

Mods need Claude Code 2.1.287+ (2.1.286+ in the desktop Code tab). The plugin is installed for your user, so it is there in terminal and desktop sessions alike; inside a terminal session `/plugin install givememod@givememod` works too.

## Usage

```text
/givememod a bar of the plan above the prompt
/givememod hold any rm -rf or force push until I confirm
/givememod watch `npm test` every 20 seconds
/givememod which mod would help here?
make me a mod that counts the files you touch
```

The first time a mod is written in a session, Claude Code asks **Enable hot reloading for this session?** — choose **Enable for this session**. The mod appears when the reply ends; ask for changes and each one reloads the same way.

| Template | What you get |
|---|---|
| `plan-progress` | `Plan ███░░ 3/5 · Fixing the bug`, read from Claude's own task list |
| `files-touched` | `Files: 4 read · 2 edited · 1 new` and a `/files` pane |
| `context-gauge` | `Context 62% 124k / 200k ▂▃▅▆` |
| `turn-receipt` | a line under each answer: time, tools, files changed, failures; a toast on long turns |
| `goal-pin` | the goal of the conversation pinned above the prompt with a timer |
| `risky-hold` | `rm -rf`, `reset --hard`, force push, `DROP` wait for your **Run it** |
| `watch-command` | a command rerun on a timer, its state under the prompt, a toast when it changes |
| `reply-choices` | numbered options at the end of an answer become buttons |
| `pinboard` | decisions, todos and links Claude pins through its own tool, in a sidebar |
| `focus-timer` | a countdown above the prompt |
| `starter` | the blank skeleton for anything else |

**Keep a mod**: say "keep this one". It is copied to `~/.claude/skills/<name>/` (or to the project's `.claude/skills/` to keep it for one project) and noted in `~/.claude/givememod/FAVORITES.md`. Claude Code loads a folder there with a `plugin.json` as `<name>@skills-dir` from the next session, with nothing to install; `claude plugin disable <name>@skills-dir` switches it off.

**Other things it does**: explains why a mod does nothing, reviews a third-party mod before you install it (what it can reach, what it costs per turn), and answers "who already built X?" from the map of public mods.

## What is inside

| Part | Contents |
|---|---|
| `SKILL.md` | the pipeline: situation → candidate → build → check → tune → favorite |
| `references/picker.md` | situation → template table, the one-line proposal, the usual tweaks |
| `references/blocks.md` | 29 building blocks with code: band, pane, tabs, guard, hold, `tool.check`, prompt rewrite, timers, state, restyling Claude Code's own rows, model tools, model calls, Raster and blit, Client modules, sound, nouns, animation without redraw storms, every surface, talking to the model, deferred actions, state shared by sessions |
| `references/ui-cookbook.md` | render sites, elements per surface, focus and hotkeys, the hint line, desktop quirks measured |
| `references/gotchas.md` | every documented trap as symptom → cause → fix, the official limits, what the built-in guard skips, open issues, stale early-access claims |
| `references/testing.md` | the `claude-code/testing` kit with stubs that work |
| `references/review-and-cost.md` | vetting a third-party mod, prompt-cache cost, composing mods |
| `references/landscape.md` | 3,057 public mods decomposed: 17 jobs, the mechanisms, the best examples, ideas worth stealing, crowded vs open niches |
| `references/techniques.md` | how the best mods solve recurring problems, each move linked to the file that does it |
| `references/resources.md` | glyphs, palettes, icons, pixel art, sounds, data tables, helper files and tools from public mods, with licences |
| `references/api-index.md` | every event, `$` method and `next` field of the API, one line each, generated from the types of the build |
| `references/catalog/mods.tsv` | every public mod with stars, link, hooks, calls and reach |
| `templates/` | 11 mods with tests |
| `examples/` | Anthropic's sample mods and the best community mods, with licenses |

## How it works

1. **Situation**: what you asked, the shape of the work, session state, the project, your favorites.
2. **Candidate**: the smallest mod that helps; `/givememod` builds it at once and names the runner-up, and unasked it is only offered, in one line.
3. **Build**: a template copied into the session's mods folder and adapted with the building blocks, following the rules the loader enforces.
4. **Check**: `claude plugin validate` and `claude plugin test` before you see it.
5. **Tune**: shorter, under the prompt, in a sidebar, only while Claude works, another colour, ask before X.
6. **Favorite**: kept mods go to your skills folder, load in every session and are proposed first next time.

## Other Projects by [@timoncool](https://github.com/timoncool)

| Project | Description |
|---------|-------------|
| [Angry Switcher](https://github.com/timoncool/angry-switcher) | Swear at Claude Code all you like, it reads the clean version |
| [satori](https://github.com/timoncool/satori) | Self-learning loop for Claude Code: corrections become skills |
| [telegram-api-mcp](https://github.com/timoncool/telegram-api-mcp) | Full Telegram Bot API as MCP server |
| [civitai-mcp-ultimate](https://github.com/timoncool/civitai-mcp-ultimate) | Civitai API as MCP server |
| [trail-spec](https://github.com/timoncool/trail-spec) | TRAIL — cross-MCP content tracking protocol |
| [ACE-Step Studio](https://github.com/timoncool/ACE-Step-Studio) | AI music studio — songs, vocals, covers, videos |
| [VideoSOS](https://github.com/timoncool/videosos) | AI video production in the browser |

## Authors

- **Nerual Dreming** — [Telegram](https://t.me/nerual_dreming) | [neuro-cartel.com](https://neuro-cartel.com) | [ArtGeneration.me](https://artgeneration.me)

## Acknowledgements

Built on Anthropic's [mods documentation](https://code.claude.com/docs/en/plugins/mods/overview), the [built-in mods](https://github.com/anthropics/claude-code/tree/main/mods) and [sample mods](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods). The map of public mods comes from [karanb192/awesome-claude-code-mods](https://github.com/karanb192/awesome-claude-code-mods). Traps and patterns were merged from the community mod skills listed in [`references/sources.md`](plugins/givememod/skills/givememod/references/sources.md) — BeLazy167, Sstobo, DannyMac180, jclfocused, ysoftman, BorjaGM1, emanueledenaro, jamubc, tomada1114, nogu66, karanb192 and others. Example mods by [hamzafer](https://github.com/hamzafer/claude-code-mods), [sezaakgun](https://github.com/sezaakgun/cc-arcade) and [jarrodwatts](https://github.com/jarrodwatts/claude-image-view) (MIT).

## Support the Author

I build open-source software and do AI research. Most of what I create is free and available to everyone. Your donations help me keep creating without worrying about where the next meal comes from =)

**[All donation methods](https://github.com/timoncool/ACE-Step-Studio/blob/master/DONATE.md)** | **[dalink.to/nerual_dreming](https://dalink.to/nerual_dreming)** | **[boosty.to/neuro_art](https://boosty.to/neuro_art)**

- **BTC:** `1E7dHL22RpyhJGVpcvKdbyZgksSYkYeEBC`
- **ETH (ERC20):** `0xb5db65adf478983186d4897ba92fe2c25c594a0c`
- **USDT (TRC20):** `TQST9Lp2TjK6FiVkn4fwfGUee7NmkxEE7C`

## Star History

<a href="https://github.com/timoncool/givememod/stargazers">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="docs/stars-dark.svg" />
   <source media="(prefers-color-scheme: light)" srcset="docs/stars-light.svg" />
   <img alt="Star History Chart" src="docs/stars-light.svg" />
 </picture>
</a>

## License

MIT. Example mods keep their own licenses (MIT, Apache-2.0), with the license file beside them.
