import * as monaco from 'monaco-editor'
import { updateUserKeybindings } from '@codingame/monaco-vscode-keybindings-service-override'

export async function updateKeybindings (bindingsJson: string): Promise<void> {
  await updateUserKeybindings(bindingsJson)
}

class PromiseDisposable implements monaco.IDisposable {
  constructor (private promise: Promise<monaco.IDisposable>) {}

  dispose (): void {
    this.promise.then(disposable => disposable.dispose(), console.error)
  }
}

export function updateEditorKeybindingsMode (
  editor: monaco.editor.IStandaloneCodeEditor,
  keyBindingsMode: 'classic' | 'vim' | 'emacs' = 'classic',
  statusBarElement: Element
): monaco.IDisposable {
  switch (keyBindingsMode) {
    case 'vim': {
      return new PromiseDisposable(import('./vim').then(({ initVimMode }) => {
        return initVimMode(editor, statusBarElement)
      }))
    }
    case 'emacs': {
      return new PromiseDisposable(import('monaco-emacs').then(({ default: EmacsExtension }) => {
        const emacsExtension = new EmacsExtension(editor)
        emacsExtension.start()
        return emacsExtension
      }))
    }
    default: {
      return {
        dispose: () => {}
      }
    }
  }
}
