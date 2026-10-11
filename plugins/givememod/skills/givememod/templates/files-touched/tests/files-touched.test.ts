import { expect, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

test('reads, edits and new files are counted on both surfaces', async ($, on) => {
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: '/repo' }))
  on('command.register', () => ({ value: { command: 'files' } }))
  on('fs.exists', ($, e) => ({ value: e.path === '/repo/old.ts' }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  on('tool.call', () => ({ result: 'ok' }))
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.tool.call({ tool: 'Read', file_path: '/repo/a.ts' })
  await $.tool.call({ tool: 'Edit', file_path: '/repo/a.ts', old_string: 'a', new_string: 'b' })
  await $.tool.call({ tool: 'Write', file_path: '/repo/new.ts', content: 'x' })
  await $.tool.call({ tool: 'Read', file_path: '/repo/b.ts' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'files-touched', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /1 read · 1 edited · 1 new/ })).toBeDefined()
    await ui.unmount()
  }
})
