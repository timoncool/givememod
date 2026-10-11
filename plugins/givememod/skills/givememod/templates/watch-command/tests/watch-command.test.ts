import { expect, mock, test } from 'claude-code/testing'

test('/watch polls, shows status and toasts on a change', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  const statuses: (string | undefined)[] = []
  const toasts: string[] = []
  let exitCode = 0
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'watch' } }))
  on('process.run', () => ({ value: { exitCode, stdout: `run ${exitCode}\n`, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('ui.status', ($, e) => (statuses.push(e.text), { value: undefined }))
  on('ui.toast', ($, e) => (toasts.push(String(e.text)), { value: undefined }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  const r = await $.command.run({ command: 'watch', args: '10 npm test', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(r.text).toContain('every 10s')
  expect(statuses[statuses.length - 1]).toContain('ok')
  exitCode = 1
  await clock.advance(10_000)
  expect(toasts[0]).toContain('exit 1')
  const stop = await $.command.run({ command: 'watch', args: 'stop', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(stop.text).toBe('Watch stopped.')
})
