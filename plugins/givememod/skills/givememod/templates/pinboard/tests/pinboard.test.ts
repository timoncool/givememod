import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  component: 'Pane',
  requestId: 'pinboard',
  props: { title: 'Pins', isFocused: true, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 20 }, view: {} },
} as const

test('Claude pins through its tool, the user through /pin, and both show in the pane', async ($, on) => {
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.root', () => ({ value: '/repo' }))
  on('tool.register', ($, e) => ({ value: { tool: `mcp__pinboard__${e.name}` } }))
  on('command.register', () => ({ value: { command: 'pin' } }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  const r = await $.tool.call({ tool: 'mcp__pinboard__pin', kind: 'decision', text: 'Use Postgres, not SQLite' } as never)
  expect(String(r.result)).toContain('Pinned #1')
  const c = await $.command.run({ command: 'pin', args: 'ask Vadim about the deploy window', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(c.text).toContain('Pinned #2')
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'pinboard', surface, ...PANE })
    expect(await ui.find({ type: 'Text', text: /Use Postgres/ })).toBeDefined()
    await ui.press({ key: 'done-1' })
    await ui.unmount()
  }
})
