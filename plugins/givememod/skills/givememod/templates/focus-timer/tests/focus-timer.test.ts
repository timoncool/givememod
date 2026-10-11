import { expect, mock, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

test('/timer counts down above the prompt and toasts at the end', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  const toasts: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'timer' } }))
  on('ui.toast', ($, e) => (toasts.push(String(e.text)), { value: undefined }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({ children: [] }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'timer', args: '2 review', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  await clock.advance(30_000)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'focus-timer', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /1:30/ })).toBeDefined()
    await ui.unmount()
  }
  await clock.advance(91_000)
  expect(toasts[0]).toContain('review')
})
