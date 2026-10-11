export type GaugeReading = { tokens: number; window: number; percent: number }

declare module 'claude-code' {
  interface PluginState {
    'context-gauge': { readings: GaugeReading[]; isHidden: boolean }
  }
}
