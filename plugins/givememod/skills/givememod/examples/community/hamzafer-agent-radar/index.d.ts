export type RadarAgent = {
  id: string
  description: string
  type: string
  status: 'running' | 'done' | 'failed'
  startedAt: number
  endedAt?: number
  tools: number
  last: string
}

declare module 'claude-code' {
  interface PluginState {
    'agent-radar': { agents: RadarAgent[]; selected: string | null; now: number }
  }
}
