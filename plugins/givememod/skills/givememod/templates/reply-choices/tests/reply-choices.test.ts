import { expect, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

const ANSWER = 'Done. What next?\n\n1. Add tests for the parser\n2. **Ship** the fix to main\n3. Write the changelog'

test('numbered options at the end of an answer become buttons that fill the prompt', async ($, on) => {
  const filled: string[] = []
  on('turn.complete', () => ({ text: '' }))
  on('prompt.fill', ($, e) => (filled.push(e.text), { isFilled: true }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  await $.turn.complete({ turnId: 't', answer: ANSWER, durationMs: 1, isAborted: false, reason: 'answer' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'reply-choices', surface, ...BAND })
    await ui.press({ key: 'choice-1' })
    await ui.unmount()
  }
  expect(filled[0]).toBe('Ship the fix to main')
})

test('an answer without a trailing list draws nothing', async ($, on) => {
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  await $.turn.complete({ turnId: 't', answer: 'All done, tests pass.', durationMs: 1, isAborted: false, reason: 'answer' })
  const ui = await $.ui.mount({ plugin: 'reply-choices', surface: 'terminal', ...BAND })
  expect(await ui.find({ type: 'Button' })).toBeUndefined()
  await ui.unmount()
})
