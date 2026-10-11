export type Pin = { id: number; kind: 'decision' | 'todo' | 'link' | 'note'; text: string; done: boolean }

declare module 'claude-code' {
  interface PluginState {
    pinboard: { pins: Pin[] }
  }
}
