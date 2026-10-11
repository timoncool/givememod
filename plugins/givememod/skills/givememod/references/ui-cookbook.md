# Drawing: sites, elements, focus, desktop

Condensed from the official docs (`official/interface.md`, `official/reference.md`), element limits read from the 2.1.292 types (emanueledenaro/claude-skills `mod-ui`), the jamubc/toolbox UI cookbook and desktop measurements by BorjaGM1 and dbrownjave. The types of your build win.

## Render sites and surfaces

| Sites | Raised on |
|---|---|
| `Pane`, `AskUserQuestion`, `UserMessage`, `AssistantMessage`, `ToolUse`, `ToolResult`, `ToolGroup`, `CommandOutput` | every surface |
| `AbovePrompt`, `Spinner`, `SessionMode`, `PromptHint` | terminal, desktop |
| `ToolProgress`, `TurnDuration`, `InfoNotice` | terminal only |

- The permission dialog cannot be redrawn; `$.ui.notice(tool_use_id, text)` adds one line under it.
- No API adds a new transcript row. Rows exist where the engine makes one: a message, a tool call or result, a command's output, a `$.ui.log` line. A rich card: the command returns non-empty `{ text }` and a `ui.render{CommandOutput, props:{command:'mine'}}` hook draws a tree in its place. Treat it as a snapshot: redraws and clicks inside transcript rows are not guaranteed.

## Elements per surface

| Surface | Elements |
|---|---|
| terminal | Box, Text, Button, Input, Select, Link, Code, Markdown, Client, Raster, Image |
| desktop | Box, Text, Button, Input, Select, Svg, Link, Code, Markdown, Client |
| mobile | Box, Text, Button, Svg, Link, Code, Markdown |
| vscode | desktop without Client |

- One element a surface lacks, one unknown prop or a child where none goes, and **the whole tree** is refused; the engine draws its own. The reason is a dim transcript line while hot reloading, otherwise in `--debug`.
- There is no Card, Table, Chart, Progress, Badge or Tabs element: build them from Box and Text.
- `e.surface` does not narrow the element table for TypeScript: test `'Raster' in elements`.

## Props (the ones that matter)

- **Box**: `key`, `hover`, `position` (`relative|absolute`) with `top/left/right/bottom` in cells, `flexDirection`, `flexGrow/Shrink/Wrap`, `alignItems/Self`, `justifyContent`, `gap/columnGap/rowGap`, `width/height/min*` (a number or a whole percent; `"2.5%"` is refused), padding and margin, `borderStyle` (`single|double|round|bold|singleDouble|doubleSingle|classic|arrow|dashed|quote`, anything else draws no border), `borderColor`, `borderDimColor`, `backgroundColor`, `overflow`, `display`.
- **Text**: `color`, `backgroundColor`, `dimColor`, `bold`, `italic`, `underline`, `strikethrough`, `inverse`, `wrap` (`wrap|truncate|truncate-start|truncate-middle|truncate-end`), `hover`. No `key` (tests find Text by its words). Holds strings and Link. A control character refuses the tree; tabs and newlines belong in Markdown and Code only.
- **Button**: `key`, `label`, `hotkey` (one digit or lowercase letter), `action` (a keybinding action such as `app:cycleDiffBase`), `plain`, `dimColor`, `variant` (`primary|secondary`), `role: 'dismiss'`, `autoFocus`, `onPress(e)`.
- **Input** (not mobile): `key`, `label`, `placeholder`, `value`, `submitLabel`, `autoFocus`, `onInput`, `onSubmit`. **Select**: `key`, `label`, `options: [{ value, label? }]` (at least one, unique values), `value`, `onSelect`.
- **Link**: `href` (≤ 2,048), `label`. On desktop only `https:` or `http://localhost`, no `@` in the path (write `%40`), in `new URL(href).href` spelling.
- **Code**: `source`, `language`, `path`, `startLine`, `format: 'diff'` (unparseable hunks draw as plain code), `wrap`. **Markdown**: `text` (not children), `dimColor`, `onLinkPress` with `key`, `pressableLinks`.
- **Svg** (desktop, mobile): `source` ≤ 131,072 starting with `<svg`, required `alt`, `width`/`height` (without them desktop draws 300×150), `isInteractive` (SMIL, `:hover`, `<title>`). For dark mode add `<style>:root{color-scheme:light dark}</style>`. Any prop change reloads the frame and restarts its animation.
- **Client**: `key`, `module` (string literal), `props` (JSON ≤ 100,000), `width`, `height`, `flexGrow`; one per plugin, ≤ 20,000 nodes, 32 deep, 1 s per call.

## Colour and style

- Theme keys: `text`, `inverseText`, `inactive`, `subtle`, `suggestion`, `remember`, `success`, `error`, `warning`, `merged`, `claude`, `permission`, `planMode`, `autoAccept`, `promptBorder`, `bashBorder`, `ide`, `diff*`. Anything else is a raw colour (`'red'`, `'#ff875f'`).
- **Desktop**: theme colour names may come out grey there, pass hex when the exact colour matters; plain spaces between sibling Text pieces collapse, use ` `.
- House rules that make mods feel calm (emanueledenaro mod-ui, from practice):
  - Draw nothing when there is nothing to say.
  - One signal keeps one meaning; colour never carries a state alone (`● green`).
  - Marks instead of emoji: `●` running, `○` queued, `✓` done, `✗` failed, `!` stalled.
  - Relative times (`12m`, `1h 5m`). Align columns by cell count, right-align numbers, drop the least important column first when narrow.
  - A band is 1–3 rows. No reports or long Markdown in the interface.
- Single-width glyphs for bars: `▁▂▃▄▅▆▇█`, `░▒▓█`, frames `╭─╮│╰╯`. Emoji and wide characters break width maths.

## Sizes and redraws

- Band: `e.props.bodyColumns` (width without the `[-]` mark), `maxRows` (at most half the terminal including the prompt); taller scrolls. Pane: `e.props.bodyColumns`, `e.props.scroll.bodyRows`. Under ~48–72 columns shorten labels; `flexWrap="wrap"` on button rows, clip every name.
- A width change redraws by itself; a height-only change does not.
- `$.ui.invalidate('ui.render')` redraws **every** site of the mod; a `$.state` write redraws only its readers. Limit: 10 per second (30 in the terminal for the shown pane, the expanded band and the hint line); extra calls fold.
- Animation: a clock bumps a `redraw` atom that only the animated drawing reads; 125 ms (8 fps) stays in budget; for a `Raster` use `$.ui.blit` with no render pass. A still scene should cost nothing. On desktop, redraws every 140 ms lose clicks: redraw there only on news.
- A tree draws its first 100,000 characters of text; draw only what is visible.

## Keyboard and focus

- A mod never reads the keyboard. A key reaches its controls only while the pane or band has focus: `focus: true` from a command or a press, Ctrl+X Tab, or a click. Focus is granted only over an empty prompt.
- With focus: Tab and arrows move or scroll, Enter presses, a hotkey presses its Button (while an `Input` has focus all printable keys go into it), PgUp/PgDn/Home/End scroll, Ctrl+X + arrow resizes the pane, Ctrl+X X closes it, Esc returns focus to the prompt (and closes with `closeOnEscape`).
- Tab and arrows cannot be rebound: games steer with WASD.
- A global key: a plugin cannot register one. Bind a chord in `~/.claude/keybindings.json` → `Global` to an action with no engine handler (`app:cycleDiffBase`) and give a Button `action: 'app:cycleDiffBase'`; the chord presses it while it is mounted, even inside `Box display="none"` (ysoftman, checked on 2.1.296). Show the hint only to people who bound it (read `keybindings.json`).

## The hint line under the prompt (`PromptHint`)

- The best place for key hints and tiny indicators: it takes no row above the prompt. `next({...e, props:{...e.props, tail:[e.props.tail, 'mine'].filter(Boolean).join(' · ')}})`; the engine appends the tail dimmed and cuts it. Keep the other mods' `tail`.
- Hidden chord Buttons belong here (in a column `Box` beside the `next(...)` result): the band unmounts when collapsed, the hint line does not.

## Desktop: confirmed behaviour (2.1.286, Claude desktop 2.19675, macOS)

- No `Raster` or `Image`: pixel art is `Box` runs (one band column is about 7.5 px, one row about 20 px). Block characters (`▀▄█`) show seams.
- `Client` drew only a placeholder for some people: check first.
- Items in a row align by text baseline; `alignItems="center"` does not change that. Pin labels with `position="absolute"`.
- A `role="dismiss"` Button as the last item of a row draws as the band's corner ✕; elsewhere as a "Hide" pill.
- The desktop's `Spinner` row is one line tall and disappears when the reply ends: draw `AbovePrompt` for anything that should stay.
- Typing arrives through `prompt.edit` (50 ms budget), not `PromptHint.isDraft`. Once `e.text === ''` arrived while the box held a draft: keep your own copy. Pasting an image raises no `prompt.edit`: poll the draft.
- `$.session.compact` rejects on desktop and in the SDK: use `$.prompt.submit({ text: '/compact' })`.
- A dev mod reloads when the turn ends: the person sees a change after the reply, not during it.

## Redraw Claude Code's own parts: cheat sheet

| Want | How |
|---|---|
| words after the spinner | `Spinner` → `next({...e, props:{...e.props, suffix}})` |
| a mode label in the footer | `SessionMode` → append to `e.props.modes` (keep the others) |
| a tail under the prompt | `PromptHint` → `props.tail` |
| a card for your command's output | `CommandOutput` with matcher `props:{command:'x'}` |
| your own tool row or result | `ToolResult` / `ToolUse`, check `e.props.tool` |
| a reply theme | `AssistantMessage` (+ `UserMessage`, `ToolGroup`, `TurnDuration`) |
| a line under the answer | `turn.complete` → `{ ...r, text }` |
| the question dialog | `AskUserQuestion`: your elements **above** the `next(e)` ref, the ref exactly once |

## Where nothing draws

`claude -p`, the SDK, the VS Code panel, cloud sessions, WSL sessions in the desktop app. A drawing mod should still do something there: a command's text (≤ 10 lines), a `$.ui.log` line, or step aside quietly. Detect with `$.session.surfaces()` (empty means headless) or `e.surface`.
