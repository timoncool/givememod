export type PinnedGoal = { text: string; since: number }

declare module 'claude-code' {
  interface PluginState {
    'goal-pin': { goal: PinnedGoal | null; tick: number; loaded: boolean }
  }
}
