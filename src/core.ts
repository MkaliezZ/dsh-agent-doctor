export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info'

export interface DoctorCheck {
  readonly id: string
  readonly status: CheckStatus
  readonly summary: string
  readonly evidence?: readonly string[]
}

export interface DoctorInput {
  readonly toolNames: readonly string[]
  readonly pluginIds?: readonly string[]
  readonly approvalAvailable?: boolean
  readonly requireAgentFuse?: boolean
  readonly forbidRunCode?: boolean
}

const sideEffectPattern = /(?:^|[_-])(bash|shell|terminal|exec|execute|write|edit|delete|remove|move|rename|git|push|deploy|send|post|payment)(?:$|[_-])/i

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

export function runDoctor(input: DoctorInput): readonly DoctorCheck[] {
  const tools = uniqueSorted(input.toolNames)
  const plugins = uniqueSorted(input.pluginIds ?? [])
  const checks: DoctorCheck[] = []

  checks.push({
    id: 'tool-surface-present',
    status: tools.length > 0 ? 'pass' : 'warn',
    summary: tools.length > 0 ? `${tools.length} model-visible tools detected` : 'No model-visible tools detected',
    evidence: tools,
  })

  const runCodeVisible = tools.includes('run_code')
  checks.push({
    id: 'run-code-surface',
    status: runCodeVisible && (input.forbidRunCode ?? true) ? 'fail' : runCodeVisible ? 'warn' : 'pass',
    summary: runCodeVisible ? 'Reserved run_code transport is model-visible' : 'run_code is not model-visible',
  })

  const risky = tools.filter((name) => sideEffectPattern.test(name))
  checks.push({
    id: 'side-effect-surface',
    status: risky.length === 0 ? 'pass' : 'warn',
    summary: risky.length === 0 ? 'No obvious side-effect tool names detected' : `${risky.length} potentially side-effecting tool names detected`,
    evidence: risky,
  })

  const hasAgentFuse = plugins.some((id) => /agentfuse/i.test(id))
  checks.push({
    id: 'agentfuse-presence',
    status: hasAgentFuse ? 'pass' : (input.requireAgentFuse ?? false) ? 'fail' : 'info',
    summary: hasAgentFuse ? 'AgentFuse plugin appears in the effective composition' : 'AgentFuse plugin was not reported in the effective composition',
  })

  if (input.approvalAvailable !== undefined) {
    checks.push({
      id: 'approval-service',
      status: input.approvalAvailable ? 'pass' : 'warn',
      summary: input.approvalAvailable ? 'Approval service reported available' : 'Approval service was not reported available',
    })
  }

  return checks
}

export function summarize(checks: readonly DoctorCheck[]): { pass: number; warn: number; fail: number; info: number } {
  const summary = { pass: 0, warn: 0, fail: 0, info: 0 }
  for (const check of checks) summary[check.status] += 1
  return summary
}

export function renderText(checks: readonly DoctorCheck[]): string {
  const lines = ['DSH Agent Doctor', '']
  for (const check of checks) {
    lines.push(`[${check.status.toUpperCase()}] ${check.id}: ${check.summary}`)
    for (const evidence of check.evidence ?? []) lines.push(`  - ${evidence}`)
  }
  const totals = summarize(checks)
  lines.push('', `Summary: ${totals.pass} pass, ${totals.warn} warn, ${totals.fail} fail, ${totals.info} info`)
  return lines.join('\n')
}
