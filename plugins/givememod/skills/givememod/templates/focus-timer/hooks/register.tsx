import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { FocusTimer } from '../types'

const timer = atom({ plugin: 'focus-timer', key: 'timer' } as const, null as FocusTimer)
const tick = atom({ plugin: 'focus-timer', key: 'tick' } as const, 0)

function clockText(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

async function onTick($: EngineInterface): Promise<void> {
  const t = await read($, timer)
  if (!t || t.pausedLeft !== null) return
  const now = await $.clock.now()
  if (now >= t.endsAt) {
    await update($, timer, () => null)
    $.ui.toast(`Timer done: ${t.label}`)
    return
  }
  await update($, tick, n => n + 1)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    $.clock.every(1_000, () => void onTick($).catch(() => {}))
    await $.command
      .register({ name: 'timer', description: 'Countdown above the prompt: /timer <minutes> [label] · /timer stop', argumentHint: '<minutes> [label] | stop', immediate: true })
      .catch(() => {})
    return r
  })

  on('command.run', { command: 'timer' }, async ($, e) => {
    const [first, ...rest] = e.args.trim().split(/\s+/)
    const minutes = Number(first)
    if (!first || first === 'stop' || !(minutes > 0)) {
      await update($, timer, () => null)
      return { text: first && first !== 'stop' ? 'Usage: /timer <minutes> [label]' : 'Timer stopped.' }
    }
    const label = rest.join(' ') || 'focus'
    const now = await $.clock.now()
    await update($, timer, () => ({ label, endsAt: now + minutes * 60_000, pausedLeft: null }))
    return { text: `Timer: ${minutes} min, ${label}.` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const t = await read($, timer)
    await read($, tick)
    if (e.props.hasSurvey || !t) return next(e)
    const left = t.pausedLeft ?? t.endsAt - (await $.clock.now())
    const { Box, Text, Button } = $.ui.resolve(e)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Box flexDirection="row" columnGap={2}>
          <Text>
            <Text color="claude" bold>{clockText(left)}</Text>
            <Text dimColor>{` ${t.label}`}</Text>
          </Text>
          <Button
            key="pause"
            plain
            label={t.pausedLeft === null ? 'pause' : 'resume'}
            onPress={async () => {
              const now = await $.clock.now()
              await update($, timer, cur =>
                !cur ? cur : cur.pausedLeft === null ? { ...cur, pausedLeft: cur.endsAt - now } : { ...cur, endsAt: now + cur.pausedLeft, pausedLeft: null },
              )
            }}
          />
          <Button key="stop" plain label="stop" onPress={() => void update($, timer, () => null).catch(() => {})} />
        </Box>
        {below}
      </Box>
    )
  })
}
