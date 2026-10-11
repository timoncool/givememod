export type ReceiptSettings = { isOn: boolean; toastAfterSeconds: number }

declare module 'claude-code' {
  interface PluginState {
    'turn-receipt': { settings: ReceiptSettings }
  }
}
