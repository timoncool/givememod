import { atom, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { RiskyLog } from '../types'

const RISKY: { label: string; pattern: RegExp }[] = [
  { label: 'recursive delete', pattern: /\brm\s(?:[^|;&\n]*\s)?(?:-[a-z]*r[a-z]*|--recursive)\b|\bRemove-Item\b.*-Recurse/i },
  { label: 'discard changes', pattern: /\bgit\s+(reset\s+--hard|clean\s+-[a-z]*f|checkout\s+--\s+\.|restore\s+\.)/ },
  { label: 'force push', pattern: /\bgit\s+push\b.*(--force\b|-f\b|--force-with-lease\b)/ },
  { label: 'database wipe', pattern: /\b(DROP\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE\s+(TABLE\s+)?\w+)\b|\bDELETE\s+FROM\s+\w+\s*;?\s*$/i },
  { label: 'migration or deploy', pattern: /\b(migrate\s+(reset|fresh)|db:drop|terraform\s+destroy|kubectl\s+delete)\b/ },
]

const log = atom({ plugin: 'risky-hold', key: 'log' } as const, [] as RiskyLog[])

function classify(command: string): string | undefined {
  return RISKY.find(r => r.pattern.test(command))?.label
}

export const register: Register = on => {
  on('tool.call', { tool: ['Bash', 'PowerShell'] }, async ($, e, next) => {
    const command = String((e as { command?: string }).command ?? '')
    const label = classify(command)
    if (!label) return next(e)
    let answer = 'Refuse'
    try {
      answer = await $.ui.ask(`Run this ${label}? ${command.slice(0, 300)}`, ['Refuse', 'Run it'])
    } catch {
      answer = 'Refuse'
    }
    await update($, log, l => [...l, { command, answer }].slice(-50))
    if (answer !== 'Run it') {
      return { deny: `risky-hold: the user did not approve this ${label}. Do not retry it; explain what you wanted to do and ask first.` }
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'risky-hold: the guard failed, so this command was not run.' }))
}
