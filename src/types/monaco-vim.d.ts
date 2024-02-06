declare module 'monaco-vim' {
  import * as monaco from 'monaco-editor'
  export const initVimMode: (
    editor: monaco.editor.ICodeEditor,
    statusBarElement: Element
  ) => monaco.IDisposable
  export const VimMode: {
    Vim: {
      map (lhs: string, rhs: string, ctx: string): void
      unmap (lhs: string, ctx: string): void
    }
  }
}
