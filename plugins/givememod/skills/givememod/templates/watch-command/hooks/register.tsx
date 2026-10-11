import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { WatchState } from '../types'

const DEFAULT_EVERY_MS = 30_000

const watch = atom({ plugin: 'watch-command', key: 'watch' } as const, null as WatchState)

function lastLine(text: string): string {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  return (lines[lines.length - 1] ?? '').slice(0, 120)
}

async function poll($: EngineInterface): Promise<void> {
  const w = await read($, watch)
  if (!w) return
  let exitCode: number | null = null
  let line = ''
  try {
    const r = await $.process.run(w.argv, { timeoutMs: Math.min(w.everyMs, 120_000) })
    exitCode = r.exitCode
    line = lastLine(r.stdout || r.stderr)
  } catch (err) {
    line = String(err).slice(0, 120)
  }
  if (w.exitCode !== null && exitCode !== w.exitCode) $.ui.toast(`watch: ${w.argv.join(' ')} → exit ${exitCode}`)
  const ok = exitCode === 0 ? 'ok' : `exit ${exitCode ?? '?'}`
  $.ui.status(`watch ${w.argv[0]}: ${ok}${line ? ` · ${line}` : ''}`)
  await update($, watch, cur => (cur ? { ...cur, exitCode, lastLine: line, at: Date.now() } : cur))
}

export const register: Register = on => {
  let timer: { cancel(): void } | undefined

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const w = await read($, watch)
    if (w) timer = $.clock.every(w.everyMs, () => void poll($).catch(() => {}))
    await $.command
      .register({ name: 'watch', description: 'Rerun a command on a timer: /watch [seconds] <command> · /watch stop', argumentHint: '[seconds] <command> | stop', immediate: true })
      .catch(() => {})
    return r
  })

  on('command.run', { command: 'watch' }, async ($, e) => {
    const words = e.args.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0 || words[0] === 'stop') {
      timer?.cancel()
      timer = undefined
      await update($, watch, () => null)
      $.ui.status(undefined)
      return { text: 'Watch stopped.' }
    }
    const seconds = /^\d+$/.test(words[0] ?? '') ? Number(words.shift()) : DEFAULT_EVERY_MS / 1000
    const everyMs = Math.max(5, seconds) * 1000
    timer?.cancel()
    await update($, watch, () => ({ argv: words, everyMs, exitCode: null, lastLine: '', at: 0 }))
    timer = $.clock.every(everyMs, () => void poll($).catch(() => {}))
    await poll($)
    return { text: `Watching \`${words.join(' ')}\` every ${everyMs / 1000}s. /watch stop ends it.` }
  })
}
