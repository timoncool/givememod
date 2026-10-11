import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { StarterTurn } from '../types'

const PLUGIN = 'starter-mod'
const BLOCKED = /\bgit\s+push\b.*--force(?!-with-lease)\b/

const last = atom({ plugin: 'starter-mod', key: 'last' } as const, null as StarterTurn | null)
const isHidden = atom({ plugin: 'starter-mod', key: 'isHidden' } as const, false)
const loaded = atom({ plugin: 'starter-mod', key: 'loaded' } as const, false)

async function loadHidden($: EngineInterface) {
  const saved = await $.store.get('isHidden').catch(() => undefined)
  await update($, isHidden, () => saved === true)
  await update($, loaded, () => true)
}

export const register: Register = on => {
  let startedAt = 0
  let tools = 0

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await loadHidden($)
    await $.command
      .register({ name: 'starter', description: 'Show or hide the starter band', immediate: true })
      .catch(err => $.ui.log(`${PLUGIN}: /starter not registered: ${String(err)}`, { to: 'debug' }))
    return r
  })

  on('classic.SessionStart', { source: ['clear', 'resume', 'fork'] }, async ($, e, next) => {
    await loadHidden($)
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if (!(await read($, loaded))) await loadHidden($)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    startedAt = await $.clock.now()
    tools = 0
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    tools += 1
    if (BLOCKED.test(String(e.command))) {
      return { deny: 'Force pushes are blocked by starter-mod. Push a new branch instead.' }
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'starter-mod guard failed, the command was not run.' }))

  on('tool.call', { tool: /^(?!Bash$)/ }, ($, e, next) => {
    tools += 1
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId !== undefined) return r
    const seconds = Math.round(((await $.clock.now()) - startedAt) / 1000)
    await update($, last, () => ({ seconds, tools }))
    return r
  })

  on('command.run', { command: 'starter' }, async $ => {
    const hidden = !(await read($, isHidden))
    await update($, isHidden, () => hidden)
    await $.store.set('isHidden', hidden)
    return { text: hidden ? 'Starter band hidden.' : 'Starter band shown.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const turn = await read($, last)
    if (e.props.hasSurvey || turn === null || (await read($, isHidden))) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Text dimColor wrap="truncate-end">
          {`Last turn: ${turn.seconds}s, ${turn.tools} tool calls`}
        </Text>
        {below}
      </Box>
    )
  })
}
