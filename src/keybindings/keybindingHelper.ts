import * as monaco from 'monaco-editor'

export function updateKeybindings (bindings: monaco.extra.IUserFriendlyKeybinding[]): void {
  const keybindingService = monaco.extra.StandaloneServices.get(monaco.extra.IKeybindingService) as monaco.extra.StandaloneKeybindingService
  keybindingService.setUserKeybindings(bindings)
}
