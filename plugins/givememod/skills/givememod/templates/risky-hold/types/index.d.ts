export type RiskyLog = { command: string; answer: string }

declare module 'claude-code' {
  interface PluginState {
    'risky-hold': { log: RiskyLog[] }
  }
}
