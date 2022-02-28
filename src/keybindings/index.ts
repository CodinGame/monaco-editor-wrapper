import * as monaco from 'monaco-editor'
import EmacsExtension from '@codingame/monaco-emacs'
import { initVimMode } from './vim'

const keybindingService = monaco.extra.StandaloneServices.get(monaco.extra.IKeybindingService) as monaco.extra.StandaloneKeybindingService

export function updateKeybindings (bindings: monaco.extra.IUserFriendlyKeybinding[]): void {
  keybindingService.setUserKeybindings(bindings)
}

export function updateEditorKeybindingsMode (
  editor: monaco.editor.IStandaloneCodeEditor,
  keyBindingsMode: 'classic' | 'vim' | 'emacs' = 'classic',
  statusBarElement: Element
): monaco.IDisposable {
  switch (keyBindingsMode) {
    case 'vim': {
      return initVimMode(editor, statusBarElement)
    }
    case 'emacs': {
      const emacsExtension = new EmacsExtension(editor)
      emacsExtension.start()
      return emacsExtension
    }
    default: {
      return {
        dispose: () => {}
      }
    }
  }
}
