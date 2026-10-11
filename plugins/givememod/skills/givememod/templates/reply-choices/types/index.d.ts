export type ReplyChoice = string

declare module 'claude-code' {
  interface PluginState {
    'reply-choices': { options: ReplyChoice[] }
  }
}
