import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { GaugeReading } from '../types'

const HISTORY = 12
const BARS = '▁▂▃▄▅▆▇█'
const SHOW_FROM_PERCENT = 0

const readings = atom({ plugin: 'context-gauge', key: 'readings' } as const, [] as GaugeReading[])
const isHidden = atom({ plugin: 'context-gauge', key: 'isHidden' } as const, false)

function short(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}k` : String(n)
}

async function takeReading($: EngineInterface): Promise<void> {
  const usage = await $.session.usage().catch(() => undefined)
  const context = usage?.context
  if (!context || !context.window || !context.tokens) return
  const reading = {
    tokens: context.tokens,
    window: context.window,
    percent: Math.round(context.percent ?? (context.tokens / context.window) * 100),
  }
  await update($, readings, list => [...list, reading].slice(-HISTORY))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command
      .register({ name: 'context-gauge', description: 'Show or hide the context gauge', immediate: true })
      .catch(() => {})
    await takeReading($)
    return r
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId === undefined) await takeReading($)
    return r
  })

  on('session.compact', async ($, e, next) => {
    const r = await next(e)
    await takeReading($)
    return r
  })

  on('command.run', { command: 'context-gauge' }, async $ => {
    const hidden = !(await read($, isHidden))
    await update($, isHidden, () => hidden)
    return { text: hidden ? 'Context gauge hidden.' : 'Context gauge shown.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, readings)
    const now = list[list.length - 1]
    if (e.props.hasSurvey || !now || now.percent < SHOW_FROM_PERCENT || (await read($, isHidden))) return next(e)
    const top = Math.max(...list.map(r => r.tokens), 1)
    const spark = list.map(r => BARS[Math.min(BARS.length - 1, Math.floor((r.tokens / top) * (BARS.length - 1)))]).join('')
    const color = now.percent >= 85 ? 'error' : now.percent >= 60 ? 'warning' : 'success'
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Text wrap="truncate-end">
          <Text color={color}>{`Context ${now.percent}%`}</Text>
          <Text dimColor>{` ${short(now.tokens)} / ${short(now.window)}`}</Text>
          {e.props.bodyColumns >= 50 ? <Text color={color}>{`  ${spark}`}</Text> : ''}
        </Text>
        {below}
      </Box>
    )
  })
}
