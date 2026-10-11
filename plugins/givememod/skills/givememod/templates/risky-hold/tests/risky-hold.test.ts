import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

const OK = { result: { stdout: '', stderr: '', interrupted: false } }

function answering(on: Parameters<TestBody>[1], pick: () => string | null) {
  on('tool.call', ($, e) => {
    if (e.tool !== 'AskUserQuestion') return OK
    const answer = pick()
    if (answer === null) return { deny: 'dismissed' }
    const q = (e as unknown as { questions: { question: string }[] }).questions
    return { result: { questions: q, answers: { [q[0]?.question ?? '']: answer } } } as never
  })
}

test('a risky command waits for Run it, refuses otherwise, and plain commands pass', async ($, on) => {
  let answer = 'Refuse'
  answering(on, () => answer)
  const refused = await $.tool.call({ tool: 'Bash', command: 'rm -rf build' })
  expect(refused.deny).toContain('did not approve')
  answer = 'Run it'
  const ran = await $.tool.call({ tool: 'Bash', command: 'git push origin main --force' })
  expect(ran.deny).toBeUndefined()
  const plain = await $.tool.call({ tool: 'Bash', command: 'ls -la' })
  expect(plain.deny).toBeUndefined()
})

test('a dismissed question refuses', async ($, on) => {
  answering(on, () => null)
  const r = await $.tool.call({ tool: 'Bash', command: 'git reset --hard HEAD~3' })
  expect(r.deny).toBeDefined()
})

test('split and long rm flags and TRUNCATE without TABLE are held; rm without -r is not', async ($, on) => {
  answering(on, () => 'Refuse')
  for (const command of ['rm -r -f build', 'rm --recursive --force dist', 'psql -c "TRUNCATE users;"']) {
    const r = await $.tool.call({ tool: 'Bash', command })
    expect(r.deny).toContain('did not approve')
  }
  const single = await $.tool.call({ tool: 'Bash', command: 'rm -f notes.txt' })
  expect(single.deny).toBeUndefined()
})
