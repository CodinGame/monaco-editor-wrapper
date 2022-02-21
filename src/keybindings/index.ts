import * as monaco from 'monaco-editor'
import EmacsExtension from '@codingame/monaco-emacs'
import { updateKeybindings } from './keybindingHelper'
import { initVimMode } from './vim'

export function updateEditorKeybindings (
  editor: monaco.editor.IStandaloneCodeEditor,
  keyBindingsMode: 'classic' | 'vim' | 'emacs' = 'classic',
  statusBarElement: Element,
  keyBindings?: monaco.extra.IUserFriendlyKeybinding[]
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
      updateKeybindings(editor, keyBindings ?? [])
      return {
        dispose: () => {
          updateKeybindings(editor, [])
        }
      }
    }
  }
}
