import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Pin } from '../types'

const PANE = 'pinboard'
const KINDS = ['decision', 'todo', 'link', 'note'] as const

const pins = atom({ plugin: 'pinboard', key: 'pins' } as const, [] as Pin[])

async function storeKey($: EngineInterface): Promise<string> {
  return `pins:${await $.session.root().catch(() => '')}`
}

async function save($: EngineInterface, list: Pin[]): Promise<void> {
  await update($, pins, () => list)
  await $.store.set(await storeKey($), list).catch(() => {})
}

async function add($: EngineInterface, kind: Pin['kind'], text: string): Promise<Pin> {
  const list = await read($, pins)
  const pin = { id: Math.max(0, ...list.map(p => p.id)) + 1, kind, text, done: false }
  await save($, [...list, pin].slice(-100))
  return pin
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const saved = (await $.store.get(await storeKey($)).catch(() => undefined)) as Pin[] | undefined
    await update($, pins, () => saved ?? [])
    await $.tool.register({
      name: 'pin',
      description: 'Pin a decision, todo, link or note to the pinboard the user sees beside the chat. Use it for decisions made, follow-ups for the user, and important links; keep each pin to one line.',
      inputSchema: {
        type: 'object',
        properties: { kind: { type: 'string', enum: [...KINDS] }, text: { type: 'string' } },
        required: ['kind', 'text'],
      },
      isDeferred: false,
    })
    await $.command
      .register({ name: 'pin', description: 'Open the pinboard, or pin a note: /pin <text>', argumentHint: '[text]', immediate: true })
      .catch(() => {})
    return r
  })

  on('tool.call', { tool: 'mcp__pinboard__pin' }, async ($, e) => {
    const input = e as unknown as { kind?: string; text?: string }
    const kind = (KINDS as readonly string[]).includes(String(input.kind)) ? (input.kind as Pin['kind']) : 'note'
    const text = String(input.text ?? '').trim().slice(0, 300)
    if (!text) return { result: 'Nothing pinned: text is empty.' }
    const pin = await add($, kind, text)
    return { result: `Pinned #${pin.id} (${kind}).` }
  })

  on('command.run', { command: 'pin' }, async ($, e) => {
    const text = e.args.trim()
    if (text) {
      const pin = await add($, 'note', text)
      return { text: `Pinned #${pin.id}: ${text}` }
    }
    const o = await $.ui.open({ id: PANE, title: 'Pins', focus: true, closeOnEscape: true })
    if (o.isPlaced) return {}
    const list = await read($, pins)
    return { text: list.map(p => `#${p.id} ${p.kind}${p.done ? ' (done)' : ''}: ${p.text}`).join('\n') || 'No pins yet.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const open = (await read($, pins)).filter(p => !p.done)
    if (e.props.hasSurvey || open.length === 0) return next(e)
    const todos = open.filter(p => p.kind === 'todo').length
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Text dimColor wrap="truncate-end">{`Pins: ${open.length} open${todos ? ` · ${todos} todo` : ''} · /pin`}</Text>
        {below}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const list = await read($, pins)
    const { Box, Text, Button } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>No pins yet. Claude pins with its pin tool; you pin with /pin text.</Text>}
        {list.map(p => (
          <Box key={`row-${p.id}`} flexDirection="row" columnGap={1}>
            <Button
              key={`done-${p.id}`}
              plain
              label={p.done ? '✓' : '○'}
              onPress={() => void save($, list.map(x => (x.id === p.id ? { ...x, done: !x.done } : x))).catch(() => {})}
            />
            <Text color={p.kind === 'decision' ? 'claude' : p.kind === 'todo' ? 'warning' : 'inactive'}>{p.kind}</Text>
            <Text dimColor={p.done} wrap="wrap">{p.text}</Text>
          </Box>
        ))}
      </Box>
    )
  })
}
