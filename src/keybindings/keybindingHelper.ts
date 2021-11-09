import * as monaco from 'monaco-editor'

export function updateKeybindings (editor: monaco.editor.IStandaloneCodeEditor, bindings: monaco.extra.IUserFriendlyKeybinding[]): void {
  (editor as monaco.editor.StandaloneCodeEditor)._standaloneKeybindingService!.setUserKeybindings(bindings)
}
