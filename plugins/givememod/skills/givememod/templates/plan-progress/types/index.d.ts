export type PlanTask = { id: string; title: string; active: string; status: 'pending' | 'in_progress' | 'completed' }

declare module 'claude-code' {
  interface PluginState {
    'plan-progress': { tasks: PlanTask[]; isHidden: boolean }
  }
}
