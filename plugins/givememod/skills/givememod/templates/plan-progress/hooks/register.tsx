import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { PlanTask } from '../types'

const BAR_CELLS = 12

const tasks = atom({ plugin: 'plan-progress', key: 'tasks' } as const, [] as PlanTask[])
const isHidden = atom({ plugin: 'plan-progress', key: 'isHidden' } as const, false)

function bar(done: number, total: number, cells: number): string {
  const filled = total === 0 ? 0 : Math.round((done / total) * cells)
  return '█'.repeat(filled) + '░'.repeat(cells - filled)
}

function clip(text: string, width: number): string {
  return text.length <= width ? text : `${text.slice(0, Math.max(1, width - 1))}…`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command
      .register({ name: 'plan-progress', description: 'Show or hide the plan progress bar', immediate: true })
      .catch(() => {})
    return r
  })

  on('tool.call', { tool: 'TodoWrite' }, async ($, e, next) => {
    const r = await next(e)
    if (e.agentId !== undefined || r.deny !== undefined || r.isError === true) return r
    const list = (e.todos ?? []).map((t, i) => ({
      id: String(i),
      title: t.content,
      active: t.activeForm || t.content,
      status: t.status,
    }))
    await update($, tasks, () => list)
    return r
  })

  on('tool.call', { tool: 'TaskCreate' }, async ($, e, next) => {
    const r = await next(e)
    if (e.agentId !== undefined || r.deny !== undefined || r.isError === true) return r
    const created = (r.result as { task?: { id?: string } } | undefined)?.task
    const id = created?.id ?? `t${Date.now()}`
    await update($, tasks, list => [
      ...list.filter(t => t.id !== id),
      { id, title: e.subject, active: e.activeForm || e.subject, status: 'pending' as const },
    ])
    return r
  })

  on('tool.call', { tool: 'TaskUpdate' }, async ($, e, next) => {
    const r = await next(e)
    if (e.agentId !== undefined || r.deny !== undefined || r.isError === true) return r
    await update($, tasks, list =>
      e.status === 'deleted'
        ? list.filter(t => t.id !== e.taskId)
        : list.map(t =>
            t.id !== e.taskId
              ? t
              : {
                  ...t,
                  title: e.subject ?? t.title,
                  active: e.activeForm ?? t.active,
                  status: e.status && e.status !== 'deleted' ? e.status : t.status,
                },
          ),
    )
    return r
  })

  on('classic.SessionStart', { source: ['clear', 'resume', 'fork'] }, async ($, e, next) => {
    await update($, tasks, () => [])
    return next(e)
  })

  on('command.run', { command: 'plan-progress' }, async $ => {
    const hidden = !(await read($, isHidden))
    await update($, isHidden, () => hidden)
    return { text: hidden ? 'Plan bar hidden.' : 'Plan bar shown.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, tasks)
    if (e.props.hasSurvey || list.length === 0 || (await read($, isHidden))) return next(e)
    const done = list.filter(t => t.status === 'completed').length
    const current = list.find(t => t.status === 'in_progress')
    const width = e.props.bodyColumns
    const cells = width < 60 ? 6 : BAR_CELLS
    const head = `Plan ${bar(done, list.length, cells)} ${done}/${list.length}`
    const tail = current ? ` · ${current.active}` : done === list.length ? ' · done' : ''
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Text wrap="truncate-end">
          <Text color={done === list.length ? 'success' : 'claude'}>{head}</Text>
          <Text dimColor>{clip(tail, Math.max(8, width - head.length - 1))}</Text>
        </Text>
        {below}
      </Box>
    )
  })
}
