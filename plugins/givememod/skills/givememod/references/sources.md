# Sources, and how to go deeper

Everything in this skill was gathered on 2026-10-10/11 against Claude Code 2.1.292–2.1.296. When something here disagrees with the running build, the build's types and `claude plugin validate` win.

## Official

| What | Where | Refresh |
|---|---|---|
| Mods documentation (9 pages) | <https://code.claude.com/docs/en/plugins/mods/overview> and siblings | `curl -sL https://code.claude.com/docs/en/plugins/mods/<page>.md` for overview, create, events, interface, api, test, troubleshoot, admin, reference (also `gallery`) |
| Full docs index | <https://code.claude.com/docs/llms.txt> | |
| The built-in `plugin-authoring` skill | ships with Claude Code; `/plugin-authoring` or the Skill tool | writes this build's types file each time it loads |
| Types of the running build | `<mod>/.claude-plugin/types/claude-code/index.d.ts` (written on every load), `claude-code-tools/index.d.ts`, `claude-code-mcp/index.d.ts` | load the mod once |
| Built-in mods with tests | <https://github.com/anthropics/claude-code/tree/main/mods> | `gh api repos/anthropics/claude-code/contents/mods` |
| Sample mods | <https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods> | |
| Design thread from early access | anthropics/claude-code issue 91870 (claims there span builds 259–2.1.272; many are stale) | |

## Catalogues of public mods

| Catalogue | Notes |
|---|---|
| [karanb192/awesome-claude-code-mods](https://github.com/karanb192/awesome-claude-code-mods), site <https://mods.aidojo.si/> | nightly scanner: clones candidates, runs `claude plugin validate`, records hooks, `$` calls, reach, stars. Raw data: `gh api -H "Accept: application/vnd.github.raw" repos/karanb192/awesome-claude-code-mods/contents/data/mods.json` (≈ 9 MB) |
| [wh000wh000/awesome-claude-mods](https://github.com/wh000wh000/awesome-claude-mods) | evidence-graded index, 20 languages |
| [Singh-AP/awesome-claude-mods](https://github.com/Singh-AP/awesome-claude-mods) | tested one-command installs |
| [saksham10arora-dotcom/awesome-claude-mods](https://github.com/saksham10arora-dotcom/awesome-claude-mods) | each entry validated, tagged with what it can touch |
| [whyashthakker/awesome-claude-code-mods](https://github.com/whyashthakker/awesome-claude-code-mods) | 100+ small utility mods with source |
| [AgriciDaniel/claude-mods-brain](https://github.com/AgriciDaniel/claude-mods-brain) | source-cited Obsidian knowledge base about mods |

`catalog/mods.tsv` here is a snapshot of the karanb192 data (2026-10-10, 3,352 entries, 3,057 after removing exact copies): `stars, name, url, copies, reach, validate, pushed, hooks, calls, draws, desc`. Rebuild it from a fresh `mods.json` when you need newer data.

## The repository read (techniques, resources, traps)

On 2026-10-11 the 222 most useful repositories of the catalogue (by stars and by unusual mechanisms) were read file by file: hooks modules, helpers, assets, tests, CI and READMEs. That reading produced 1,313 techniques, 475 assets, 908 helper kits, 720 tools and 1,161 traps. `techniques.md`, `resources.md` and the *(reported)* rows of `gotchas.md` keep what was worth keeping, each with the file it came from. Licences in `resources.md` were checked with `gh api repos/<owner>/<repo>`; claims about the engine were checked against the 2.1.293 types, the official limits table and the `sec-default` source, and the rest are marked as reported.

To read a repository the same way: `gh api repos/<owner>/<repo>/git/trees/<branch>?recursive=1` for the file list, `gh api -H "Accept: application/vnd.github.raw" repos/<owner>/<repo>/contents/<path>` for a file.

## Community skills about mods (read in full, merged here)

| Skill | What it added |
|---|---|
| [BeLazy167/claude-mods-skill](https://github.com/BeLazy167/claude-mods-skill) | workflow, examples to copy, gotchas table |
| [Sstobo/skills › claude-mod](https://github.com/Sstobo/skills/tree/main/skills/claude-mod) | hook model, state lifetimes, symptom table |
| [DannyMac180/skills › modsmith](https://github.com/DannyMac180/skills/tree/main/modsmith) | patterns, cost and prompt-cache review, composition, testing traps |
| [jclfocused/claude-agents › claude-mods](https://github.com/jclfocused/claude-agents/tree/main/skills/claude-mods) | validator and test-kit rules, runtime facts, review red flags |
| [ysoftman/myenv › mod-authoring](https://github.com/ysoftman/myenv/tree/main/.claude/skills/mod-authoring) | panes and tabs behaviour, keybinding chords, the hint line, load paths |
| [BorjaGM1/claude-code-mod-kit](https://github.com/BorjaGM1/claude-code-mod-kit) | desktop drawing measured: pixels from Box runs, caret tracking, Svg rules, animation |
| [emanueledenaro/claude-skills › mod-ui](https://github.com/emanueledenaro/claude-skills/tree/main/mod-ui) | visual language, element limits per surface |
| [jamubc/toolbox › drawing-claude-code-mod-ui](https://github.com/jamubc/toolbox/tree/main/.claude/skills/drawing-claude-code-mod-ui) | UI cookbook: Raster, blit, Client, images, tabs |
| [tomada1114/tomada-claude-plugins › building-function-hook-mods](https://github.com/tomada1114/tomada-claude-plugins/tree/main/tomada-kit/skills/building-function-hook-mods) | event families, tiers, early-access traps (several now stale) |
| [nogu66/claude-code › create-mods](https://github.com/nogu66/claude-code/tree/main/create-mods) | three-layer architecture from cc-arcade, idea menu |
| [armandli/get-skilled › create-mod](https://github.com/armandli/get-skilled/tree/main/skills/create-mod) | static analysis rules, limits |
| [japan-da-man/claude-code › add-mod](https://github.com/japan-da-man/claude-code/tree/main/plugins/mod-dev/skills/add-mod) | marketplace mode, test stubs, mount props |
| [karanb192/claude-code-mods › mod-builder](https://github.com/karanb192/claude-code-mods/tree/main/plugins/mod-builder/skills/mod-builder) | build pipeline with proof, reach grading, forbidden claims |
| [Autopsias/gearbox-routing › mods](https://github.com/Autopsias/gearbox-routing/tree/master/harness/skills/mods) | "is a mod due" bar, review checklist |
| [Esposter/Esposter › claude-mods](https://github.com/Esposter/Esposter/tree/main/.agents/skills/claude-mods) | conventions forced by the loader |
| [dbrownjave/claude-token-saver › mod-authoring](https://github.com/dbrownjave/claude-token-saver/tree/main/.claude/skills/mod-authoring) | desktop rules learned from bugs |
| [codecast-sh/codecast › cast-mod](https://github.com/codecast-sh/codecast/tree/main/packages/cli/skills/cast-mod) | a different product's "mod" system (not Claude Code), useful contrast |
| [promptadvisers/claude-mods-starter-kit](https://github.com/promptadvisers/claude-mods-starter-kit) | ten mods with beginner guides and a build-your-own template |
| [ngicks/agents-package › mods/statusline](https://github.com/ngicks/agents-package/tree/main/mods/statusline) | a skill folder that is also a mod (`@skills-dir`), a status row under the hint line with a width budget |
| [ngicks/crabswarm › mods/handle-events](https://github.com/ngicks/crabswarm/tree/main/mods/handle-events) | an outside event stream fed into the session between turns, with acks and restarts; options through `pluginConfigs["<name>@skills-dir"]` |
| [ucsandman/claude-harness › labs/claude-mods](https://github.com/ucsandman/claude-harness/tree/main/labs/claude-mods) | a snapshot of the official `plugin-authoring` skill from 2.1.273, useful to see what changed since |

## Going deeper on a topic

- **How does mod X do it?** Find it in `catalog/mods.tsv` (grep the name or a word of the description), open its `url`, read `hooks/` with `gh api -H "Accept: application/vnd.github.raw" repos/<owner>/<repo>/contents/<path>`.
- **Who already built Y?** Grep `catalog/mods.tsv` descriptions; filter by hooks (`AbovePrompt`, `tool.check`) or calls (`$.ui.blit`, `$.model.fork`) in the `hooks`/`calls` columns.
- **Is a claim still true?** Grep the types file of your build, then `claude plugin validate` a two-line probe mod.
- **Newest catalogue data**: re-download `mods.json` (above).
