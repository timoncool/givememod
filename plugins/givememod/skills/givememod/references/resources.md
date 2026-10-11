# Resources: assets, data, helper kits and tools from public mods

Gathered on 2026-10-11 by reading 222 mod repositories from the catalogue (`catalog/mods.tsv`) file by file: 475 assets, 908 helper kits, 720 tools. This page keeps what is worth reusing, with the file it lives in and its licence. Licences were checked with `gh api repos/<owner>/<repo>` where the entry says so; everything else is what the repository declares.

**How to reuse.** A hooks module may import only files inside its own plugin folder, so reuse means copying the file into the mod (`hooks/kit/…`). Keep the licence: MIT and Apache-2.0 need the copyright notice (a header comment or a `LICENSE-<name>` file beside it), OFL fonts need their OFL text. "No licence" means read it and write your own. Files that take `$` cannot be shared at all: copy the pure helpers, keep every `$` call in `register.tsx`.

---

## 1. Glyphs to paste (Unicode, no licence needed)

| Use | Glyphs | Seen in |
|---|---|---|
| Bar fill / track | `█ ░`, `━ ─`, `■ □`, `▰ ▱` | context-bar, now-playing, headroom, local-llm |
| Partial cell (eighths) | `▏ ▎ ▍ ▌ ▋ ▊ ▉ █` | usage-bars, slick-bar |
| Sparkline, VU | `▁ ▂ ▃ ▄ ▅ ▆ ▇ █` | composio-pulse, session-equalizer |
| Shade, heatmap | `· ░ ▒ ▓ █` | baselane stats heatmap |
| Pie, countdown | `○ ◔ ◑ ◕ ●`, `◐ ◓ ◑ ◒` | idle-compact, brand-theme |
| Status | `✓ ✗ ○ ◌ ● ◐ ⊘ ▲ ⚠` | glanceflow, ci-pipeline, podside |
| Braille spinner | `⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏` | claude-auto-handoff, diagram-mod |
| Claude-style spinner | `· ✢ ✳ ✶ ✻ ✽ ✻ ✶ ✳ ✢` | claude-local-llm |
| Quadrants (index by a 4-bit mask) | `' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█'` | live-scores `pitch.ts` |
| Half blocks (2 pixels per cell) | `▀` fg = top, bg = bottom; `▄` when only the bottom is set | most pixel mods |
| Box joins (n/s/e/w bits) | `╭ ╮ ╰ ╯ ├ ┤ ┬ ┴ ┼ ┆ ┄` | diagram-mod `render.ts` |
| Transit lines | `━ ╍ ○ ◎ ▣ ▶▶▶ ▮` | transit-map |
| Receipt | 40-column rows, `v^v^` edge, dotted leaders, block-glyph barcode `▏▎▍▌▋▊▉█ ▕` | scope-creep-receipt |

Rules that cost people a release:
- A `Raster` cell takes one printable width-1 BMP character, or the whole tree is refused (types: `RasterProps.cells`). No emoji, CJK or combining marks there.
- Emoji in `Text`: use default-presentation emoji without `U+FE0F`; a VS16 turns a text symbol into a 2-cell emoji and terminals disagree on its width.
- Nerd Font codepoints only with a fallback (`JetsonChan/CC-Usage-Band` ships Nerd / Unicode / ASCII sets: [register.tsx#L19-L31](https://github.com/JetsonChan/CC-Usage-Band/blob/main/usage-band/hooks/register.tsx#L19-L31)).
- Terminals set to draw ambiguous-width characters two columns wide break half-block art.

## 2. Colour

**Theme keys** follow the person's theme (dark, light, daltonized, ANSI) in `Text color`/`backgroundColor`: `text inverseText inactive subtle suggestion remember success error warning merged claude permission planMode autoAccept promptBorder bashBorder ide diffAdded diffRemoved diffAddedDimmed diffRemovedDimmed diffAddedWord diffRemovedWord` (`ThemeKey` in the types). A tone map used by several kits: accent `claude`, ok `success`, warn `warning`, bad `error`, dim `inactive`, faint `subtle` ([mishgoldenberg design.md](https://github.com/mishgoldenberg/claude-mods/blob/main/docs/design.md#L7-L36), MIT).

**Fixed colours** where a theme key cannot go (`Svg`, `Raster`): Claude orange `#D97757` / `0xd77757`, track grey `rgb(127,127,127)`, warn `#E0A23A`, critical `#E5534B` ([claude-pro-kit pro-hud](https://github.com/VedantAndhale/claude-pro-kit/blob/main/plugins/pro-hud/hooks/register.tsx#L27-L36)). Desktop dark surfaces: clay `#D97757`, hover `#E3876A`, ink `#1A0F0A`, fills `#373737/#434343/#2C2C2C` ([claude-editor-context controls.tsx](https://github.com/talbarina/claude-editor-context/blob/main/plugins/editor-context/hooks/controls.tsx#L44-L56), MIT). `Raster` colour `0x01000000` means the terminal's default; a frame paints at most 1,024 distinct fg/bg pairs and maps the rest to the nearest.

| Palette set | What | Licence |
|---|---|---|
| [hellosverre/claude-skins themes](https://github.com/hellosverre/claude-skins/tree/main/hooks/themes) | 15 skins (tokyo-night, dracula, nord, gruvbox, catppuccin, rose-pine, …), 15 roles each, light and dark | MIT; check each original palette's licence |
| [allianceoptima/claude-theme-studio presets.ts](https://github.com/allianceoptima/claude-theme-studio/blob/main/theme-studio/hooks/presets.ts) | 441 contrast-checked palettes in 63 collections, plus HSL scheme generators (neon, pastel, jewel, earthy, analogous, mono) | MIT, colours only |
| [hoobnn-agent-mods hud themes.ts](https://github.com/hoobnn/hoobnn-agent-mods/blob/main/claude-code/hud/hooks/themes.ts) | 12 HUD themes: palette, glyph set, separator, gradient, powerline, mascot faces per mood | MIT |
| [theonly1me looks themes.ts](https://github.com/theonly1me/claude-code-mods/blob/main/plugins/looks/hooks/looks/themes.ts) | 4 transcript themes (Retro CRT, Punk, Synthwave, Zen) with spinner and done words | MIT |
| [cc-arcade doom.tsx](https://github.com/sezaakgun/cc-arcade/blob/main/hooks/boards/doom.tsx#L20-L52) | colour-blind-safe palette (Okabe-Ito) with the critical pairs to test | MIT |
| [pourya7 pixels.ts](https://github.com/pourya7/claude-code-mods/blob/main/co-op/hooks/pixels.ts#L8-L25) | PICO-8 16 colours keyed by one letter | MIT |
| [robdmac/flow fire-palette.ts](https://github.com/robdmac/flow/blob/main/hooks/fire-palette.ts) | blackbody, gas, smoke ramps quantized to 48 steps for the 1,024-pair limit | MIT |
| [r3al1tym/isobar palette.ts](https://github.com/r3al1tym/isobar/blob/main/hooks/render/palette.ts) | OKLab-stepped ramps on the 4-bit grid `Raster` actually paints, with 256-colour twins | MIT |
| [alex2481kobe peek palette.ts](https://github.com/alex2481kobe/claude-mods/blob/main/plugins/peek/hooks/palette.ts#L10-L33) | xterm-256 cube and greys with a precomputed CIE Lab table | Apache-2.0 |
| [context-canary NOTES.md](https://github.com/Nachx639/context-canary/blob/main/design/NOTES.md) | 20-colour named sprite palette with a role table | MIT |

Colour maths to copy: WCAG luminance/contrast and `ensureContrast` that nudges toward black or white until 4.5:1 ([claude-theme-studio color.ts](https://github.com/allianceoptima/claude-theme-studio/blob/main/theme-studio/hooks/color.ts), MIT); nearest xterm-256 ([CC-Usage-Band](https://github.com/JetsonChan/CC-Usage-Band/blob/main/usage-band/hooks/register.tsx#L54-L74), MIT); reading the OS theme and Omarchy colours ([zycck plan-progress](https://github.com/zycck/claude-mods/blob/main/plugins/plan-progress/hooks/register.tsx#L30-L62), MIT); colour-blindness check with the Machado 2009 matrices and CIEDE2000 ([robdmac/flow cvd-check.ts](https://github.com/robdmac/flow/blob/main/scripts/cvd-check.ts), MIT).

## 3. Icons

| Set | Form | Licence |
|---|---|---|
| [glanceflow look.ts](https://github.com/Antreas-Strb/glanceflow/blob/master/glanceflow/hooks/look.ts) | 27 line icons on a 24×24 grid (check, alert, clock, play, pause, plan, history, eye, bell, lock, file, spark, …), each with a one-cell terminal glyph and a 5-tone palette: the best pairing of desktop `Svg` and terminal text | MIT |
| [claude-editor-context register.tsx](https://github.com/talbarina/claude-editor-context/blob/main/plugins/editor-context/hooks/register.tsx) | Tabler outline icons as raw path markup, wrapped by `iconSvg(name, color)` into 24×24 stroke SVG | Tabler MIT |
| [terminal-browser icons.tsx](https://github.com/zenbu-labs/terminal-browser/blob/main/browser/src/ui/icons.tsx) | Lucide icons with arcs rewritten as cubics (`M L Q C Z` only) plus an `arcPath()` converter | Lucide ISC, repo MIT |
| [CC-Usage-Band](https://github.com/JetsonChan/CC-Usage-Band/blob/main/usage-band/hooks/register.tsx#L221-L230) | 10×10 stroke icons (layers, target) inline | MIT |
| [y-hirakaw docs/colors](https://github.com/y-hirakaw/claude-code-mods/tree/main/docs/colors) | 12×12 colour swatches for file states | MIT |
| [cache-tax status-icons.ts](https://github.com/karanb192/cache-tax/blob/main/hooks/status-icons.ts) + [generator](https://github.com/karanb192/cache-tax/blob/main/tools/generate-status-icons.py) | state icons as desktop SVG and 96×64 PNG for a terminal `Image` band, recoloured per theme with a contrast edge | MIT; the cube mark is the author's |
| [cc-tamagotchi svg.ts](https://github.com/davidurco/cc-tamagotchi/blob/main/hooks/pet/svg.ts#L124-L133) | eight 7×7 one-bit device icons as string rows | MIT |

More icons on demand: [Lucide](https://lucide.dev) (ISC) and [Tabler Icons](https://tabler.io/icons) (MIT) paths drop straight into an `Svg` source; keep their notice. Do not ship third-party logos or Anthropic's Clawd mascot (several mods draw it; it is a trademark).

## 4. Pixel art, sprites, bitmap fonts, animation

| What | Where | Licence |
|---|---|---|
| 3×5 pixel font, digits and A–Z | [theonly1me shared/pixel/font.ts](https://github.com/theonly1me/claude-code-mods/blob/main/shared/pixel/font.ts) | MIT |
| 5×7 bitmap font, A–Z 0–9 punctuation | [OneWave session-wrapped font.ts](https://github.com/OneWave-AI/claude-code-mods/blob/main/session-wrapped/hooks/font.ts) | MIT |
| 8×10 digits and a two-frame running horse | [devbrothers taxi-meter](https://github.com/devbrother2024/devbrothers-mods/blob/main/plugins/taxi-meter/hooks/register.ts#L64) | MIT |
| Canary in 4 hand-drawn sizes × 5 frames, `sprites.json`, a validating build script and an offline `preview.html` | [context-canary design](https://github.com/Nachx639/context-canary/blob/main/design/sprites.json) | MIT |
| One-bit creatures with eye/mouth slots, egg and evolution stages | [cc-tamagotchi sprites.ts](https://github.com/davidurco/cc-tamagotchi/blob/main/hooks/pet/sprites.ts) | MIT |
| 13×9 hero with walk frames plus 20 props, 21-key letter palette | [Claude-Fables sprites.ts](https://github.com/henrik-thevibe/Claude-Fables/blob/main/hooks/sprites.ts#L34) | MIT |
| 8×8 text-mask monsters and pickups | [cc-arcade doom.tsx](https://github.com/sezaakgun/cc-arcade/blob/main/hooks/boards/doom.tsx#L59-L88) | MIT |
| Chrome-dino sprites with leg and wing frames | [musingfox dino.ts](https://github.com/musingfox/cc-plugins/blob/main/games/hooks/dino.ts#L28-L62) | MIT |
| 15 band scenes and pets drawn in code (half blocks) | [hoobnn spinner scenes.ts](https://github.com/hoobnn/hoobnn-agent-mods/blob/main/claude-code/spinner/hooks/scenes.ts) | MIT (some scenes are fan homages) |
| 11 procedural scenes (aquarium, bonsai, city, fire, life, lofi, matrix, stars, train, weather, pulse) with `Scene {start, step, hear, paint}` | [claude-ambient scenes](https://github.com/barisdemirhan/claude-ambient/tree/main/hooks/scenes) | MIT |
| Breathing animations as pure functions of progress | [Mindful-Claude shapes.ts](https://github.com/halluton/Mindful-Claude/blob/main/hooks/breath/shapes.ts) | MIT |
| One-column sailboat and waves that never break width | [firstmate ship sprite](https://github.com/kunchenguid/firstmate/blob/main/.claude/mods/firstmate-calm/lib/fm-calm-working-ship-sprite.ts#L33) | MIT |
| Text pets (cat, dog, blob, robot, ghost, duck) × 8 moods with face slots | [Singh-AP buddy art.ts](https://github.com/Singh-AP/awesome-claude-mods/blob/main/mods/fun/buddy/hooks/art.ts) | MIT |
| Device sprites (bulb, fan, blind, lock) as 7×12 dot maps | [Vortitron bulbs.ts](https://github.com/Vortitron/home-assistant-mcp/blob/main/claude-plugin/vome-automation/hooks/bulbs.ts) | MIT |

## 5. Sounds

`$.audio.play` plays a file through `afplay` on macOS; a Linux or Windows terminal plays nothing (types: `$.audio.play`). Windows mods that want sound run PowerShell `System.Media.SoundPlayer` through `$.process.run`, passing the path in `env`, never in the command text ([rostech radio](https://github.com/DJPalefaceSD/rostech-mods/blob/main/plugins/radio/hooks/register.ts#L16), [zycck plan-progress](https://github.com/zycck/claude-mods/blob/main/plugins/plan-progress/hooks/register.tsx#L1209)). At most 4 clips play at once.

| What | Where | Licence |
|---|---|---|
| 8 packs (arcade, minimal, nature, office, retro, scifi, zen, bead-chime) × pass / fail / deny / done, 16 kHz mono, ≤ 0.45 s, synthesized | [baselane-sh/mods sound assets](https://github.com/baselane-sh/mods/tree/main/engines/sound/assets) | MIT |
| Deterministic WAV synthesizer for those packs (seeded noise, byte-identical reruns) | [gen-sounds.mjs](https://github.com/baselane-sh/mods/blob/main/scripts/gen-sounds.mjs) | MIT |
| WAV synthesis inside the mod, no files: cheer, boo, gasp, siren | [OneWave sportscaster wav.ts](https://github.com/OneWave-AI/claude-code-mods/blob/main/sportscaster/hooks/wav.ts) | MIT |
| Two-note chime with a WAV and base64 encoder that need no Node | [Singh-AP done-ding chime.ts](https://github.com/Singh-AP/awesome-claude-mods/blob/main/mods/notifications/done-ding/hooks/chime.ts) | MIT |
| Bell plus Schroeder room plus limiter | [HeyCubit make-sounds.mjs](https://github.com/HeyCubit/effortless/blob/main/sounds/make-sounds.mjs) | MIT |
| Seeded noise, low-pass, decay, −6 dBFS peak | [az9713 make-sounds](https://github.com/az9713/claude-mod-pack/blob/main/mod-pack/scripts/make-sounds.js) | MIT |
| Pentatonic loop beds with wrapped loops, browser audition page | [claude-ambient synth.js](https://github.com/barisdemirhan/claude-ambient/blob/main/tools/sound/synth.js) | MIT |
| 11 scene soundscapes from sox/ffmpeg recipes | [robdmac/flow sounds](https://github.com/robdmac/flow/tree/main/sounds) | MIT |

Skip: movie voice clips (`vinta/hal-9000`, film copyright) and unlicensed WAVs (`tylergraydev/cc-mods`, `charlie947/mod-maker`): synthesize your own with the generators above.

## 6. Fonts (for demo pages and videos; mods draw with the terminal's font)

Monocraft subset as two base64 WOFF2 strings ([Claude-Fables monocraft.ts](https://github.com/henrik-thevibe/Claude-Fables/blob/main/hooks/monocraft.ts), OFL), JetBrains Mono and Inter ([terminal-browser fonts](https://github.com/zenbu-labs/terminal-browser/tree/main/pixel/engine/assets/fonts), OFL), Geist and JetBrains Mono ([claude-composio-mods video/media](https://github.com/tridha643/claude-composio-mods/tree/main/video/media), OFL), CJK subsets with the char lists they were cut from ([Bearisbug fonts](https://github.com/Bearisbug/cc-mods/tree/main/brand/promo/intro/fonts), OFL).

## 7. Data tables

| Table | Where | Licence |
|---|---|---|
| Secret formats (20+ kinds: AWS, GitHub, Anthropic, OpenAI, Slack, Stripe, JWT, npm, PyPI, HF, PEM, URL passwords) and secret file paths | [Singh-AP secret-shield patterns.ts](https://github.com/Singh-AP/awesome-claude-mods/blob/main/mods/safety/secret-shield/hooks/patterns.ts) | MIT |
| Secret patterns with ordering notes (private key, AWS secret by name, many GitLab prefixes) | [pradyb secret-scrub](https://github.com/pradyb/claude-mods/blob/main/secret-scrub/hooks/register.ts#L6) | MIT |
| Keys plus PII (phones, IBAN, cards, addresses), money words, private paths | [nateherkai privacy.mjs](https://github.com/nateherkai/claude-code-mods/blob/main/recording-mode/hooks/privacy.mjs#L9-L90) | see repo |
| Entropy layer (≥ 20 chars, ≥ 4.3 bits/char) with word and camelCase rejection | [orchestkit secrets-veil](https://github.com/yonatangross/orchestkit/blob/main/mods/secrets-veil/hooks/register.ts#L275) | see repo |
| Prompt-injection defanging: fake turn markers, fake tags, invisible characters | [ccdwyer/quarantine sanitize.ts](https://github.com/ccdwyer/quarantine/blob/main/hooks/sanitize.ts) | MIT |
| Fake credentials spliced from halves, so tests pass secret scanners and push protection | [baselane fixtures.ts](https://github.com/baselane-sh/mods/blob/main/engines/guard/tests/fixtures.ts#L1-L13) | MIT |
| Risky commands: `rm -r`, force push, migrations of prisma, supabase, drizzle, knex, sequelize, rails, alembic, typeorm; wrapper list | [blast-radius](https://github.com/hamzafer/claude-code-mods/blob/main/mods/blast-radius/hooks/register.tsx#L14-L15) | MIT |
| Risky commands including Windows forms (`rmdir /s`, `del /s`, `Remove-Item -Recurse`) | [az9713 blast-radius.ts](https://github.com/az9713/claude-mod-pack/blob/main/mod-pack/hooks/blast-radius.ts#L8) | MIT |
| Rule file format: deny / ask / rewrite / note per tool and field, with a citation | [pourya7 tripwire.json](https://github.com/pourya7/claude-code-mods/blob/main/tripwire/examples/tripwire.json) | MIT |
| Test, build and lint programs with subcommands (npm/pnpm/yarn/bun, just, deno, make, gradle, mvn, pytest, jest, cargo, go, dotnet) | [task-line README](https://github.com/muellerei/task-line/blob/main/README.md#failing-checks) | MIT |
| Test runners plus "not a run" flags (`--collect-only`, `--list`, `|| true`) | [speedrun-splits](https://github.com/ccdwyer/speedrun-splits/blob/main/hooks/register.tsx#L28) | MIT |
| Summary parsers for vitest, jest, pytest, bun, cargo, go, mocha, rspec | [OneWave boss-fight fight.ts](https://github.com/OneWave-AI/claude-code-mods/blob/main/boss-fight/hooks/fight.ts) | MIT |
| Model prices per MTok with family fallbacks (dated; re-check before use) | [cache-tax](https://github.com/karanb192/cache-tax/blob/main/hooks/register.ts#L12), [chai-meter prices.ts](https://github.com/ShriD5/claude-mods/blob/main/chai-meter/hooks/prices.ts#L11-L40) | MIT |
| Prompt-cache TTL precedence (`FORCE_PROMPT_CACHING_5M` > `CLAUDE_CODE_PROMPT_CACHE_TTL` > `promptCacheTtl` > `ENABLE_PROMPT_CACHING_1H` > subscription) | [cache-timer](https://github.com/arasovic/claude-code-mods/blob/main/cache-timer/hooks/register.tsx#L8-L23) | see repo |
| East Asian Width ranges, Unicode 17.0.0 | [rtl-terminal wide.ts](https://github.com/MohammedSaud404/rtl-terminal/blob/main/hooks/wide.ts) | MIT |
| Emoji that take two cells outside the wide blocks | [task-line cells.ts](https://github.com/muellerei/task-line/blob/main/hooks/cells.ts#L8-L52) | MIT |
| "(Recommended)" in 13 languages, full-width parentheses included | [ask-autopick pick.ts](https://github.com/KilimcininKorOglu/claude-code-mods/blob/main/plugins/ask-autopick/hooks/pick.ts) | MIT |
| Ten-language UI tables and a map from Claude Code's `language` setting values to codes | [hoobnn i18n](https://github.com/hoobnn/hoobnn-agent-mods/tree/main/claude-code/hud/hooks/hud/i18n), [lang.ts](https://github.com/hoobnn/hoobnn-agent-mods/blob/main/claude-code/kit/lang.ts#L14-L27) | MIT |
| Typed i18n bundles: English is the full shape, others partial with fallback | [devohmycode say.ts](https://github.com/devohmycode/claude-mods/blob/main/claude-cockpit-mod/hooks/say/say.ts) | MIT |
| Spinner word packs as present/past pairs | [Singh-AP spinner-packs](https://github.com/Singh-AP/awesome-claude-mods/blob/main/mods/fun/spinner-packs/hooks/packs.ts) | MIT |
| Achievement badges with predicates | [baselane achievements.ts](https://github.com/baselane-sh/mods/blob/main/engines/stats/hooks/rules/achievements.ts#L8-L30) | MIT |
| Hook payload fixtures for 20+ classic events and transcript samples | [Agulhas logbook fixtures](https://github.com/Agulhas-Labs/claude-plugins/tree/main/plugins/logbook/tests/fixtures) | Apache-2.0 |

## 8. Helper kits (pure code, copy into the mod)

**Cell width and fitting.** One file that does width, cut-with-ellipsis and a sanitiser for control, bidi and zero-width characters: [task-line cells.ts](https://github.com/muellerei/task-line/blob/main/hooks/cells.ts) (MIT). Alternatives: [linear-mod text.ts](https://github.com/SaharCarmel/linear-mod/blob/main/linear-mod/hooks/text.ts) (also `safeHref`, `relativeTime`), grapheme-aware width without a library in [aside-widget](https://github.com/oMaN-Rod/claude-code-widgets/blob/main/plugins/aside-widget/hooks/register.tsx), `Intl.Segmenter` widths in [zycck plan-progress](https://github.com/zycck/claude-mods/blob/main/plugins/plan-progress/hooks/register.tsx#L768-L803), Markdown table to box grid with a column allocator in [pituto grilla.ts](https://github.com/betoescobar46/pituto/blob/main/plugins/grid-tables/hooks/grilla.ts).

**Width-adaptive bands.** Drop whole segments by priority, never cut a figure: [baselane band view](https://github.com/baselane-sh/mods/blob/main/engines/band/hooks/view.tsx#L14-L15), [headroom fit(segs)](https://github.com/vihrea1337/headroom/blob/main/hooks/core.ts#L222-L233), nine detail levels in [taskline layout.ts](https://github.com/pepperonas/taskline/blob/main/hooks/layout.ts), render at detail 2/1/0 and take the first that fits in [CC-Usage-Band](https://github.com/JetsonChan/CC-Usage-Band/blob/main/usage-band/hooks/register.tsx#L99-L150).

**Raster packers and pixel canvases.** `Grid`, quantize to ≤ 1,000 pairs, pack to base64: [isobar raster.ts](https://github.com/r3al1tym/isobar/blob/main/hooks/render/raster.ts) (MIT). Endian-independent packer with an eighths table: [devohmycode raster.ts](https://github.com/devohmycode/claude-mods/blob/main/claude-cockpit-mod/hooks/raster/raster.ts). Half-block canvas with sprites, gradients, seeded RNG and run merging: [claude-ambient kit.ts](https://github.com/barisdemirhan/claude-ambient/blob/main/hooks/kit.ts). Quadrant fit, braille map, noise: [flow pixels.ts](https://github.com/robdmac/flow/blob/main/hooks/pixels.ts). Half blocks, big blocks, braille from one bitmap: [cc-tamagotchi paint.ts](https://github.com/davidurco/cc-tamagotchi/blob/main/hooks/pet/paint.ts). Braille canvas with Bresenham and clipping: [codebase-galaxy](https://github.com/ccdwyer/codebase-galaxy/blob/main/hooks/galaxy.ts#L555-L713). Lab quantiser with Floyd–Steinberg: [peek palette.ts](https://github.com/alex2481kobe/claude-mods/blob/main/plugins/peek/hooks/palette.ts#L53-L80) (Apache-2.0).

**Images.** Pure-JS PNG decoder, resize and half-block packing: [vignettes png.ts](https://github.com/tibzejoker/claude-mods/blob/main/vignettes/hooks/png.ts). Store-only PNG encoder (crc32, adler32): [session-wrapped png.ts](https://github.com/OneWave-AI/claude-code-mods/blob/main/session-wrapped/hooks/png.ts). JPEG and GIF decoders vendored with their licences: [cc-inline-images vendor](https://github.com/nnemirovsky/cc-inline-images/tree/main/hooks/vendor). PNG size from 32 base64 characters of the IHDR and tile fitting at a 2:1 cell: [claude-image-view layout.ts](https://github.com/jarrodwatts/claude-image-view/blob/main/hooks/layout.ts). Cells to PNG to SVG under the 131,072-character cap: [flow svg.ts](https://github.com/robdmac/flow/blob/main/hooks/svg.ts).

**SVG for the desktop.** Text measure and linear-time ellipsis: [claude-skins svg-kit.ts](https://github.com/hellosverre/claude-skins/blob/main/hooks/svg-kit.ts). Measured advance tables for Segoe UI and Arial: [issue-map fit.ts](https://github.com/romtaugranot/issue-map/blob/main/src/pane/fit.ts#L12). Band builder with an Inter advance table and a SMIL shine: [CC-Usage-Band](https://github.com/JetsonChan/CC-Usage-Band/blob/main/usage-band/hooks/register.tsx#L153-L342). Bitmap to animated SVG with one path per frame: [cc-tamagotchi svg.ts](https://github.com/davidurco/cc-tamagotchi/blob/main/hooks/pet/svg.ts#L23-L108). `resumeAt(svg, seconds)` so a redrawn SVG continues mid-animation: [Claude-Fables svg.ts](https://github.com/henrik-thevibe/Claude-Fables/blob/main/hooks/svg.ts#L982).

**Charts and meters.** Stacked bar with a rounding fix-up and a legend packer: [context-bar](https://github.com/hamzafer/claude-code-mods/blob/main/mods/context-bar/hooks/register.tsx#L137-L182). Six bar styles (bars, pacman, beer, tank, battery, hourglass): [usage-bars styles.ts](https://github.com/pepperonas/usage-bars/blob/main/hooks/styles.ts). Gauge with half-step and pace marker: [slick-bar](https://github.com/mustafa89/my-claude-code-mods/blob/main/slick-bar/hooks/register.tsx#L121-L170). Heatmap of 12 weeks: [baselane heatmap.ts](https://github.com/baselane-sh/mods/blob/main/engines/stats/hooks/rules/heatmap.ts#L4-L32). Candles: [tw-stock board.tsx](https://github.com/darrell-tw/darrelltw-mods/blob/main/mods/tw-stock-mod/hooks/board.tsx#L783-L860).

**Reading shell commands (guards).** Split into simple commands, follow `sh -c` and `eval`, strip wrappers: [baselane shell.ts](https://github.com/baselane-sh/mods/blob/main/engines/guard/hooks/shell.ts) (MIT). Linear-time heredoc skipping and wrapper skipping: [task-line shell.ts](https://github.com/muellerei/task-line/blob/main/hooks/shell.ts). Tokens with source offsets plus an in-place rewriter: [frame x-mod-guard shell.ts](https://github.com/dvakatsiienko/frame/blob/main/home/.claude/plugin-x/mods/x-mod-guard/hooks/shell.ts), [rewrite.ts](https://github.com/dvakatsiienko/frame/blob/main/home/.claude/plugin-x/mods/x-mod-guard/hooks/rules/rewrite.ts). The real program behind `sudo`, `timeout`, `xargs`, `find -exec`, and the files a command writes: [quarantine](https://github.com/ccdwyer/quarantine/blob/main/hooks/sanitize.ts). Syntax check with `bash -n` or PowerShell's parser before running: [bash-quoting-rescue](https://github.com/seanrobertwright/claude-mods). Windows Bash/PowerShell mix-ups: [ClaudeMods shell-guard](https://github.com/youllook/ClaudeMods/blob/main/plugins/shell-guard/hooks/register.ts).

**Markdown, code, diagrams.** Mermaid to terminal text with a vendored beautiful-mermaid and an art defect checker: [claude-mermaid](https://github.com/Conte777/claude-mermaid/blob/main/mermaid-inline/hooks/diagrams.ts), [defects.ts](https://github.com/Conte777/claude-mermaid/blob/main/mermaid-inline/hooks/defects.ts). 17 diagram kinds: [claude-skins mermaid.ts](https://github.com/hellosverre/claude-skins/blob/main/hooks/mermaid.ts). highlight.js 11.12.0 vendored as ES source (BSD-3-Clause): [file-explorer vendor](https://github.com/jessewaites/claude-mods/tree/main/file-explorer/hooks/vendor/highlight). LaTeX to terminal images: [claude-latex-math render.sh](https://github.com/atomashevic/claude-latex-math/blob/main/bin/render.sh). Right-to-left in one copy-in file: [rtl-kit](https://github.com/barmoshe/bar-mods/blob/main/rtl-kit/hooks/rtl.tsx).

**Model replies.** Parser that survives fences, bullets, numbering, JSON arrays and preambles: [next-steps](https://github.com/hamzafer/claude-code-mods/blob/main/mods/next-steps/hooks/register.tsx). Tolerant JSON-array extraction: [holdtime generate.ts](https://github.com/ItsRohith-A/holdtime/blob/main/content/generate.ts#L64-L90). Sanitiser for model or tool text before drawing: [claude-whisper](https://github.com/jessetsai1024/claude-whisper/blob/main/hooks/whisper.ts#L30-L53).

**Notifications.** osascript → notify-send → toast with phone push over ntfy: [Singh-AP notifications](https://github.com/Singh-AP/awesome-claude-mods/tree/main/mods/notifications). Sound, speech and toast on all three OSes with first-that-works: [glanceflow](https://github.com/Antreas-Strb/glanceflow/blob/master/glanceflow/hooks/glance.tsx#L330-L400).

**Formatters.** `68.4k`, signed numbers, fit and right-align: [context-lens format.ts](https://github.com/Arunjay4213/claude-mods/blob/main/plugins/context-lens/hooks/format.ts). `1h30m` parser and formatter, money: [cache-tax](https://github.com/karanb192/cache-tax/blob/main/hooks/register.ts#L48). Bytes, rates, ages, percents, eighth-cell bars: [taskline format.ts](https://github.com/pepperonas/taskline/blob/main/hooks/format.ts).

**Test worlds** (on top of `claude-code/testing`): journal of every blit, toast and log with deny switches ([firstmate support.ts](https://github.com/kunchenguid/firstmate/blob/main/.claude/mods/firstmate-calm/tests/support.ts#L67)); knobs for forks, failing writes and gates ([ctx-handoff test-world.ts](https://github.com/cablate/ctx-handoff-mod)); ask dialog that answers, hangs or is dismissed ([spare10 world.ts](https://github.com/chrisns/spare10-mod/blob/main/tests/helpers/world.ts)); `mountBand` with an engine row beneath ([task-line test-support.tsx](https://github.com/muellerei/task-line/blob/main/hooks/test-support.tsx)); racing store writes ([cache-warmer world.ts](https://github.com/paulbkim-dev/claude-code-cache-warmer/blob/main/tests/world.ts)).

## 9. Tools around mods

| Job | Tool |
|---|---|
| Static check | `claude plugin validate --strict` (and `--json` for scripts); a reach gate that diffs the reported hooks and calls against an allow file: [ground-rules check-reach.mjs](https://github.com/ivanvyd/ground-rules/blob/main/scripts/check-reach.mjs); a risk taxonomy of events and calls: [modwall classify.ts](https://github.com/RadTech-Solutions/modwall/blob/main/hooks/classify.ts); a linter for silent failures (`$` bound to a name, a second unmatched hook, `.catch` calling `next` twice): [devohmycode /forge](https://github.com/devohmycode/claude-mods/blob/main/claude-forge-mod/README.md) |
| Release check | validate, test, tsc, a `beneath` test for every band mod, duplicate command and pane ids: [jaaaackieLai](https://github.com/jaaaackieLai/claude-mods) |
| CI | pinned Claude Code from npm, SHA-pinned actions, validate and test per manifest: [arasovic ci.yml](https://github.com/arasovic/claude-code-mods/blob/main/.github/workflows/ci.yml); Windows/macOS/Linux matrix: [ground-rules](https://github.com/ivanvyd/ground-rules/blob/main/.github/workflows/ci.yml); weekly run against `latest` to catch API drift: [topic-filter-mod](https://github.com/lperezmo/topic-filter-mod/blob/main/.github/workflows/test.yml). Pin 2.1.293–2.1.294 when CI type-checks: a headless 2.1.295 load writes no `.claude-plugin/types/` ([#100837](https://github.com/anthropics/claude-code/issues/100837)) |
| Install check | install into a throwaway `CLAUDE_CONFIG_DIR` and confirm the plugins appear: [smoke-install.mjs](https://github.com/ivanvyd/ground-rules/blob/main/scripts/smoke-install.mjs) |
| Live session in a pty | node-pty + @xterm/headless, reload verdict from `--debug-file`, hover and click by SGR mouse events: [frame live.ts](https://github.com/dvakatsiienko/frame/blob/main/home/.claude/plugin-x/mods/live.ts); tmux with model answers from aimock fixtures: [claude-mermaid E2E](https://github.com/galElmalah/claude-mods); Windows pty with pywinpty + pyte: [pty_drive.py](https://github.com/ucsandman/Agnostic-AI/blob/master/labs/claude-mods/tools/pty_drive.py) |
| See a band as the desktop draws it | renders a mod's `AbovePrompt` with the installed app's own renderer into PNG, without opening the app: [effortless render-band](https://github.com/HeyCubit/effortless/blob/main/tools/render-band/README.md) |
| Screenshots and demos | `tmux capture-pane -e -p` → SVG with window chrome: [ansi-to-svg.mjs](https://github.com/Singh-AP/awesome-claude-mods/blob/main/scripts/ansi-to-svg.mjs); → HTML: [ansi2html.mjs](https://github.com/theonly1me/claude-code-mods/blob/main/tools/ansi2html.mjs); → GIF: [cc-tamagotchi record.mjs](https://github.com/davidurco/cc-tamagotchi/blob/main/scripts/record.mjs); one VHS tape per mod: [pourya7 demos](https://github.com/pourya7/claude-code-mods/tree/main/demos); recorded pty replayed through xterm.js to MP4: [cc-mods capture.py](https://github.com/roaringsoul404/cc-mods/blob/main/media/capture.py) |
| Vendoring a library | hooks modules load no npm and are capped at 1 MiB: bundle to one ESM file with esbuild and assert licences ([claude-skins vendor build](https://github.com/hellosverre/claude-skins/blob/main/scripts/vendor/build.mjs)); keep crypto closures byte-identical except the one import rewrite ([925 vendor](https://github.com/herman925/925-cc-plugins/tree/main/team-orchestrator/hooks/vendor)) |
| Debugging other mods | `on('*')` with `next.trace`: [xray](https://github.com/ucsandman/Agnostic-AI/blob/master/labs/claude-mods/lab/xray); failure attribution and timings per plugin: [modscope](https://github.com/CommunityPokeOrg/claude-code-modscope/blob/main/plugins/modscope); breakpoints on tool calls: [claude-devtools-mod](https://github.com/NMenzel/claude-devtools-mod) |
| Distribution | marketplace generated from every `plugin.json`: [inema-mods gerar-marketplace.py](https://github.com/inematds/inema-mods/blob/main/scripts/gerar-marketplace.py); release only when tag equals `plugin.json` version: [taskrail release.yml](https://github.com/drolosoft/taskrail/blob/main/.github/workflows/release.yml) |

## 10. Services mods call

ntfy.sh (phone push by POST), LRCLIB (synced lyrics), OSV.dev and the npm, PyPI, Go, crates and Packagist registries (dependency checks), GitHub through `gh` (60 unauthenticated requests an hour otherwise), Linear GraphQL, Telegram Bot API (`getUpdates` refuses while a webhook is set), Google News RSS, ESPN's undocumented scoreboard, wttr.in, and claude.ai connectors through `$.mcp.call` with the session's own credentials. Every one of these sends data out: say so in the mod's README and keep the request behind an option.
