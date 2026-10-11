import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const MAX = 5

const options = atom({ plugin: 'reply-choices', key: 'options' } as const, [] as string[])

export function parseOptions(answer: string): string[] {
  const lines = answer.trim().split(/\r?\n/)
  const tail: string[] = []
  for (let i = lines.length - 1; i >= 0 && tail.length < 12; i--) {
    const line = (lines[i] ?? '').trim()
    if (!line) {
      if (tail.length) break
      continue
    }
    const m = /^(?:\d+[.)]|[-*•]|\(?[A-Ea-e]\))\s+(.+)$/.exec(line)
    if (!m) break
    tail.unshift((m[1] ?? '').replace(/\*\*/g, '').trim())
  }
  return tail.length >= 2 ? tail.slice(0, MAX) : []
}

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId !== undefined || e.isAborted) return r
    await update($, options, () => parseOptions(e.answer))
    return r
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, options, () => [])
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, options)
    if (e.props.hasSurvey || e.props.isWorking || list.length === 0) return next(e)
    const { Box, Button } = $.ui.resolve(e)
    const width = Math.max(12, Math.floor(e.props.bodyColumns / Math.min(list.length, 3)) - 4)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
          {list.map((text, i) => (
            <Button
              key={`choice-${i}`}
              plain
              hotkey={String(i + 1)}
              label={text.length > width ? `${text.slice(0, width - 1)}…` : text}
              onPress={() => void $.prompt.fill({ text, mode: 'replace' }).catch(() => {})}
            />
          ))}
        </Box>
        {below}
      </Box>
    )
  })
}
