import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { ReceiptSettings } from '../types'

const settings = atom({ plugin: 'turn-receipt', key: 'settings' } as const, { isOn: true, toastAfterSeconds: 60 } as ReceiptSettings)

function duration(ms: number): string {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

export const register: Register = on => {
  let tools: Record<string, number> = {}
  let changed = new Set<string>()
  let failed = 0

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command
      .register({ name: 'receipt', description: 'Turn receipts on or off; /receipt toast <seconds> sets the long-turn toast', argumentHint: '[on|off|toast N]', immediate: true })
      .catch(() => {})
    return r
  })

  on('turn.start', ($, e, next) => {
    tools = {}
    changed = new Set()
    failed = 0
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId !== undefined) return r
    tools[e.tool] = (tools[e.tool] ?? 0) + 1
    if (r.deny !== undefined || r.isError === true) failed += 1
    else if (e.tool === 'Edit' || e.tool === 'Write' || e.tool === 'NotebookEdit') {
      const path = (e as { file_path?: string; notebook_path?: string }).file_path ?? (e as { notebook_path?: string }).notebook_path
      if (path) changed.add(path)
    }
    return r
  })

  on('command.run', { command: 'receipt' }, async ($, e) => {
    const [verb, value] = e.args.trim().split(/\s+/)
    if (verb === 'toast' && Number(value) > 0) {
      await update($, settings, s => ({ ...s, toastAfterSeconds: Number(value) }))
      return { text: `Long-turn toast after ${Number(value)}s.` }
    }
    const isOn = verb === 'on' ? true : verb === 'off' ? false : !(await read($, settings)).isOn
    await update($, settings, s => ({ ...s, isOn }))
    return { text: isOn ? 'Turn receipts on.' : 'Turn receipts off.' }
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId !== undefined || e.isAborted) return r
    const s = await read($, settings)
    if (!s.isOn) return r
    const total = Object.values(tools).reduce((a, b) => a + b, 0)
    const top = Object.entries(tools)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, n]) => `${name} ${n}`)
      .join(', ')
    const parts = [
      duration(e.durationMs),
      total ? `${total} tool calls (${top})` : 'no tools',
      changed.size ? `${changed.size} files changed` : '',
      failed ? `${failed} failed` : '',
    ].filter(Boolean)
    if (e.durationMs >= s.toastAfterSeconds * 1000) $.ui.toast(`Turn done in ${duration(e.durationMs)}`)
    return { ...r, text: [r.text, parts.join(' · ')].filter(Boolean).join(' · ') }
  })
}
