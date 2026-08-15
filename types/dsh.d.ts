declare module '@deepseek-ai/cordis' {
  export interface Context {
    commands?: {
      register(definition: {
        name: string
        description: string
        handler(invocation: { agent: unknown; rawInput: string; signal: AbortSignal }): Promise<{ kind: 'success' | 'error'; text?: string }> | { kind: 'success' | 'error'; text?: string }
      }): () => void
    }
    tools?: {
      schemas(agent?: unknown): readonly { name: string }[]
    }
    [key: string]: unknown
  }
}
