import { expect, mock, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

test('/goal pins a goal with a timer and /goal done clears it', async ($, on) => {
  mock.store(on, {})
  const clock = mock.clock(on, { now: 0 })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.root', () => ({ value: '/repo' }))
  on('command.register', () => ({ value: { command: 'goal' } }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  const set = await $.command.run({ command: 'goal', args: 'ship the login fix', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(set.text).toContain('ship the login fix')
  await clock.advance(5 * 60_000)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'goal-pin', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /ship the login fix/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /5m/ })).toBeDefined()
    await ui.unmount()
  }
  const cleared = await $.command.run({ command: 'goal', args: 'done', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(cleared.text).toBe('Goal cleared.')
})

test('a saved goal comes back on the next turn when no start hook restored it', async ($, on) => {
  mock.store(on, { 'goal:/repo': { text: 'ship the login fix', since: 0 } })
  mock.clock(on, { now: 2 * 60_000 })
  on('session.root', () => ({ value: '/repo' }))
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  await $.turn.start({ text: 'go on', turnId: 't1' })
  const ui = await $.ui.mount({ plugin: 'goal-pin', surface: 'terminal', ...BAND })
  expect(await ui.find({ type: 'Text', text: /ship the login fix/ })).toBeDefined()
  await ui.unmount()
})
