import type { Context } from '@deepseek-ai/cordis'
import { renderText, runDoctor, type DoctorInput } from './core.js'

export const name = 'dsh-agent-doctor'
export const inject = ['commands', 'tools']

export interface Config {
  readonly requireAgentFuse?: boolean
  readonly forbidRunCode?: boolean
  readonly pluginIds?: readonly string[]
  readonly approvalAvailable?: boolean
}

function inspectRuntime(ctx: Context, agent: unknown, config: Config): DoctorInput {
  let toolNames: string[] = []
  try {
    toolNames = [...(ctx.tools?.schemas(agent) ?? [])].map((schema) => schema.name)
  } catch {
    toolNames = []
  }

  return {
    toolNames,
    pluginIds: config.pluginIds ?? [],
    approvalAvailable: config.approvalAvailable,
    requireAgentFuse: config.requireAgentFuse ?? false,
    forbidRunCode: config.forbidRunCode ?? true,
  }
}

export function apply(ctx: Context, config: Config = {}): void {
  if (!ctx.commands?.register) return
  ctx.commands.register({
    name: 'doctor',
    description: 'Inspect the effective DSH tool surface and selected safety composition signals.',
    async handler(invocation) {
      const checks = runDoctor(inspectRuntime(ctx, invocation.agent, config))
      return { kind: 'success', text: renderText(checks) }
    },
  })
}

export * from './core.js'
