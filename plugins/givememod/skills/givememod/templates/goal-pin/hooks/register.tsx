import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { PinnedGoal } from '../types'

const goal = atom({ plugin: 'goal-pin', key: 'goal' } as const, null as PinnedGoal | null)
const tick = atom({ plugin: 'goal-pin', key: 'tick' } as const, 0)
const loaded = atom({ plugin: 'goal-pin', key: 'loaded' } as const, false)

function elapsed(ms: number): string {
  const m = Math.floor(ms / 60_000)
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`
}

async function restore($: EngineInterface): Promise<void> {
  const root = await $.session.root().catch(() => '')
  const saved = (await $.store.get(`goal:${root}`).catch(() => undefined)) as PinnedGoal | undefined
  await update($, goal, () => saved ?? null)
  await update($, loaded, () => true)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await restore($)
    $.clock.every(60_000, () => void update($, tick, n => n + 1).catch(() => {}))
    await $.command
      .register({ name: 'goal', description: 'Pin the goal of this conversation above the prompt', argumentHint: '<text> | done', immediate: true })
      .catch(() => {})
    return r
  })

  on('classic.SessionStart', { source: ['clear', 'resume', 'fork'] }, async ($, e, next) => {
    await restore($)
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if (!(await read($, loaded))) await restore($)
    return next(e)
  })

  on('command.run', { command: 'goal' }, async ($, e) => {
    const root = await $.session.root().catch(() => '')
    const text = e.args.trim()
    if (!text || text === 'done') {
      await update($, goal, () => null)
      await $.store.delete(`goal:${root}`).catch(() => {})
      return { text: 'Goal cleared.' }
    }
    const pinned = { text, since: await $.clock.now() }
    await update($, goal, () => pinned)
    await $.store.set(`goal:${root}`, pinned).catch(() => {})
    return { text: `Goal for this conversation: ${text}. Keep the work on it and say so when something is off-goal.` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const g = await read($, goal)
    await read($, tick)
    if (e.props.hasSurvey || !g) return next(e)
    const now = await $.clock.now()
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Text wrap="truncate-end">
          <Text color="claude" bold>Goal </Text>
          <Text>{g.text}</Text>
          <Text dimColor>{`  ${elapsed(now - g.since)}`}</Text>
        </Text>
        {below}
      </Box>
    )
  })
}
