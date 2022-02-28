import * as monaco from 'monaco-editor'

const keybindingService = monaco.extra.StandaloneServices.get(monaco.extra.IKeybindingService) as monaco.extra.StandaloneKeybindingService

export function updateKeybindings (bindings: monaco.extra.IUserFriendlyKeybinding[]): void {
  keybindingService.setUserKeybindings(bindings)
}
