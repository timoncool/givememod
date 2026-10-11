export type FocusTimer = { label: string; endsAt: number; pausedLeft: number | null } | null

declare module 'claude-code' {
  interface PluginState {
    'focus-timer': { timer: FocusTimer; tick: number }
  }
}
