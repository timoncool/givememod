import { expect, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

test('the gauge reads usage after each main-loop turn', async ($, on) => {
  let tokens = 0
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'context-gauge' } }))
  on('session.usage', () => ({ value: { startedAt: 0, rateLimits: [], context: { tokens, window: 200_000 } } }))
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  tokens = 50_000
  await $.turn.complete({ turnId: 't1', answer: 'a', durationMs: 1, isAborted: false, reason: 'answer' })
  tokens = 180_000
  await $.turn.complete({ turnId: 't2', answer: 'a', durationMs: 1, isAborted: false, reason: 'answer' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'context-gauge', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /Context 90%/ })).toBeDefined()
    await ui.unmount()
  }
})
