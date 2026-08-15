import assert from 'node:assert/strict'
import test from 'node:test'
import { renderText, runDoctor, summarize } from '../src/core.js'

test('healthy read-only surface passes core checks', () => {
  const checks = runDoctor({ toolNames: ['read_file', 'search'], pluginIds: ['agentfuse'], approvalAvailable: true, requireAgentFuse: true })
  assert.equal(checks.find((c) => c.id === 'run-code-surface')?.status, 'pass')
  assert.equal(checks.find((c) => c.id === 'agentfuse-presence')?.status, 'pass')
  assert.equal(summarize(checks).fail, 0)
})

test('run_code is fail by default', () => {
  const checks = runDoctor({ toolNames: ['read_file', 'run_code'] })
  assert.equal(checks.find((c) => c.id === 'run-code-surface')?.status, 'fail')
})

test('side-effect-looking names warn without claiming danger classification', () => {
  const checks = runDoctor({ toolNames: ['read_file', 'write_file', 'git_push'] })
  const check = checks.find((c) => c.id === 'side-effect-surface')
  assert.equal(check?.status, 'warn')
  assert.deepEqual(check?.evidence, ['git_push', 'write_file'])
})

test('required AgentFuse missing fails', () => {
  const checks = runDoctor({ toolNames: ['read_file'], requireAgentFuse: true, pluginIds: [] })
  assert.equal(checks.find((c) => c.id === 'agentfuse-presence')?.status, 'fail')
})

test('render is stable and does not include raw tool arguments', () => {
  const text = renderText(runDoctor({ toolNames: ['search', 'read_file'] }))
  assert.match(text, /DSH Agent Doctor/)
  assert.match(text, /Summary:/)
})
