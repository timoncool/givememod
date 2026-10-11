import { expect, mock, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

function world(on: Parameters<TestBody>[1]) {
  mock.store(on, {})
  const clock = mock.clock(on, { now: 0 })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'starter' } }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  return clock
}

test('a force push is denied and other Bash runs', async ($, on) => {
  world(on)
  on('tool.call', () => ({ result: { stdout: '', stderr: '', interrupted: false } }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  const denied = await $.tool.call({ tool: 'Bash', command: 'git push origin main --force' })
  expect(denied.deny).toContain('Force pushes are blocked')
  const ran = await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(ran.deny).toBeUndefined()
})

test('the band shows the last turn and /starter hides it', async ($, on) => {
  const clock = world(on)
  on('tool.call', () => ({ result: 'ok' }))
  on('prompt.submit', ($, e) => ({ text: e.text }))
  on('turn.complete', () => ({ text: '' }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'composer' } })
  await $.tool.call({ tool: 'Read', file_path: 'a.md' })
  await clock.advance(3000)
  await $.turn.complete({ turnId: 't1', answer: 'done', durationMs: 3000, isAborted: false, reason: 'answer' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'starter-mod', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /Last turn: 3s, 1 tool calls/ })).toBeDefined()
    await ui.unmount()
  }
  const toggled = await $.command.run({ command: 'starter', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(toggled.text).toBe('Starter band hidden.')
})

test('a hidden band stays hidden after a turn starts with no start hook run', async ($, on) => {
  mock.store(on, { isHidden: true })
  mock.clock(on, { now: 0 })
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  await $.turn.start({ text: 'hi', turnId: 't1' })
  await $.turn.complete({ turnId: 't1', answer: 'done', durationMs: 1000, isAborted: false, reason: 'answer' })
  const ui = await $.ui.mount({ plugin: 'starter-mod', surface: 'terminal', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Last turn/ })).toBeUndefined()
  await ui.unmount()
})
