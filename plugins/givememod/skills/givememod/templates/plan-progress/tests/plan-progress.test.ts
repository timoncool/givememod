import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: true, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

function world(on: Parameters<TestBody>[1]) {
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'plan-progress' } }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  on('tool.call', ($, e) =>
    e.tool === 'TaskCreate' ? { result: { task: { id: '7', subject: 'x' } } } : { result: { ok: true } },
  )
}

test('TodoWrite fills the bar on both surfaces', async ($, on) => {
  world(on)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.tool.call({
    tool: 'TodoWrite',
    todos: [
      { content: 'Read code', status: 'completed', activeForm: 'Reading code' },
      { content: 'Fix bug', status: 'in_progress', activeForm: 'Fixing the bug' },
      { content: 'Run tests', status: 'pending', activeForm: 'Running tests' },
    ],
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'plan-progress', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /1\/3/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Fixing the bug/ })).toBeDefined()
    await ui.unmount()
  }
})

test('TaskCreate and TaskUpdate drive the bar', async ($, on) => {
  world(on)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.tool.call({ tool: 'TaskCreate', subject: 'Ship it', description: 'd', activeForm: 'Shipping' })
  await $.tool.call({ tool: 'TaskUpdate', taskId: '7', status: 'completed' })
  const ui = await $.ui.mount({ plugin: 'plan-progress', surface: 'terminal', ...BAND })
  expect(await ui.find({ type: 'Text', text: /1\/1/ })).toBeDefined()
  await ui.unmount()
  const toggled = await $.command.run({ command: 'plan-progress', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(toggled.text).toBe('Plan bar hidden.')
})
