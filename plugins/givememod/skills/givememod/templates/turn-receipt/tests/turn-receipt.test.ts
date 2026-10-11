import { expect, test } from 'claude-code/testing'

test('a receipt line closes the turn', async ($, on) => {
  const toasts: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'receipt' } }))
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', ($, e) => (toasts.push(String(e.text)), { value: undefined }))
  on('tool.call', ($, e) => (e.tool === 'Bash' ? { result: { stdout: '', stderr: 'x', interrupted: false }, isError: true } : { result: 'ok' }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.turn.start({ text: '', turnId: 't1' })
  await $.tool.call({ tool: 'Edit', file_path: '/a.ts', old_string: 'a', new_string: 'b' })
  await $.tool.call({ tool: 'Edit', file_path: '/a.ts', old_string: 'b', new_string: 'c' })
  await $.tool.call({ tool: 'Bash', command: 'npm test' })
  const done = await $.turn.complete({ turnId: 't1', answer: 'ok', durationMs: 75_000, isAborted: false, reason: 'answer' })
  expect(done.text).toContain('1m 15s')
  expect(done.text).toContain('3 tool calls (Edit 2, Bash 1)')
  expect(done.text).toContain('1 files changed')
  expect(done.text).toContain('1 failed')
  expect(toasts[0]).toContain('Turn done')
})
