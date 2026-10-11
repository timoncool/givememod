export type WatchState = { argv: string[]; everyMs: number; exitCode: number | null; lastLine: string; at: number } | null

declare module 'claude-code' {
  interface PluginState {
    'watch-command': { watch: WatchState }
  }
}
