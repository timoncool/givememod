export type StarterTurn = { seconds: number; tools: number }

declare module 'claude-code' {
  interface PluginState {
    'starter-mod': { last: StarterTurn | null; isHidden: boolean; loaded: boolean }
  }
}
