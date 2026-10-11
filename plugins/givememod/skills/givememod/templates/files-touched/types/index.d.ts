export type TouchedFile = { path: string; reads: number; edits: number; created: boolean }

declare module 'claude-code' {
  interface PluginState {
    'files-touched': { files: TouchedFile[]; isHidden: boolean }
  }
}
