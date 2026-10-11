import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { TouchedFile } from '../types'

const PANE = 'files-touched'
const LIMIT = 500

const files = atom({ plugin: 'files-touched', key: 'files' } as const, [] as TouchedFile[])
const isHidden = atom({ plugin: 'files-touched', key: 'isHidden' } as const, false)

function short(path: string, root: string): string {
  const p = path.replace(/\\/g, '/')
  const r = root.replace(/\\/g, '/').replace(/\/$/, '')
  return r && p.startsWith(r + '/') ? p.slice(r.length + 1) : p
}

function touch(list: TouchedFile[], path: string, kind: 'read' | 'edit' | 'create'): TouchedFile[] {
  const found = list.find(f => f.path === path)
  const base = found ?? { path, reads: 0, edits: 0, created: false }
  const next = {
    ...base,
    reads: base.reads + (kind === 'read' ? 1 : 0),
    edits: base.edits + (kind === 'read' ? 0 : 1),
    created: base.created || kind === 'create',
  }
  return [next, ...list.filter(f => f.path !== path)].slice(0, LIMIT)
}

export const register: Register = on => {
  let root = ''

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    root = await $.session.cwd().catch(() => '')
    await $.command
      .register({ name: 'files', description: 'Files Claude touched this session (pane); /files hide toggles the line', argumentHint: '[hide]', immediate: true })
      .catch(() => {})
    return r
  })

  on('tool.call', { tool: ['Read', 'Edit', 'Write', 'NotebookEdit'] }, async ($, e, next) => {
    const isNew = e.tool === 'Write' ? !(await $.fs.exists(String(e.file_path)).catch(() => true)) : false
    const r = await next(e)
    if (r.deny !== undefined || r.isError === true) return r
    const path = String((e as { file_path?: string; notebook_path?: string }).file_path ?? (e as { notebook_path?: string }).notebook_path ?? '')
    if (!path) return r
    const kind = e.tool === 'Read' ? 'read' : isNew ? 'create' : 'edit'
    await update($, files, list => touch(list, path, kind))
    return r
  })

  on('command.run', { command: 'files' }, async ($, e) => {
    if (e.args.trim() === 'hide') {
      const hidden = !(await read($, isHidden))
      await update($, isHidden, () => hidden)
      return { text: hidden ? 'Files line hidden.' : 'Files line shown.' }
    }
    const o = await $.ui.open({ id: PANE, title: 'Files', focus: true, closeOnEscape: true })
    if (o.isPlaced) return {}
    const list = await read($, files)
    const lines = list.slice(0, 20).map(f => `${f.created ? 'new ' : f.edits ? 'edit' : 'read'} ${short(f.path, root)}`)
    return { text: lines.length ? lines.join('\n') : 'No files touched yet.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, files)
    if (e.props.hasSurvey || list.length === 0 || (await read($, isHidden))) return next(e)
    const created = list.filter(f => f.created).length
    const edited = list.filter(f => f.edits > 0 && !f.created).length
    const readOnly = list.filter(f => f.edits === 0).length
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Text dimColor wrap="truncate-end">
          {`Files: ${readOnly} read · ${edited} edited · ${created} new · /files`}
        </Text>
        {below}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const list = await read($, files)
    const { Box, Text } = $.ui.resolve(e)
    const rows = Math.max(1, e.props.scroll.bodyRows - 1)
    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>No files touched yet.</Text>}
        {list.slice(0, rows).map(f => (
          <Text key={f.path} wrap="truncate-start">
            <Text color={f.created ? 'success' : f.edits ? 'warning' : 'inactive'}>
              {f.created ? 'new  ' : f.edits ? `edit ${f.edits} ` : `read ${f.reads} `}
            </Text>
            {short(f.path, root)}
          </Text>
        ))}
      </Box>
    )
  })
}
