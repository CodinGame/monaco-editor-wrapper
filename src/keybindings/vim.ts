import { IDisposable } from 'monaco-editor'
import * as monacoVim from 'monaco-vim'
import * as monaco from 'monaco-editor'
import { getConfiguration, onConfigurationChanged } from '../configuration'

interface VimKeybindingConfiguration {
  before?: string[]
  after?: string[]
}

interface VimConfiguration {
  insertModeKeyBindings: VimKeybindingConfiguration[]
  normalModeKeyBindings: VimKeybindingConfiguration[]
  visualModeKeyBindings: VimKeybindingConfiguration[]
}

function mapVimKeyBindings (keybindingConfig: VimKeybindingConfiguration[] | undefined, mode: string) {
  if (keybindingConfig != null) {
    for (const item of keybindingConfig) {
      if (item.after != null && item.before != null) {
        monacoVim.VimMode.Vim.map(item.before.join(''), item.after.join(''), mode)
      }
    }
  }
}
function unmapVimKeyBindings (keybindingConfig: VimKeybindingConfiguration[] | undefined, mode: string) {
  if (keybindingConfig != null) {
    for (const item of keybindingConfig) {
      if (item.after != null && item.before != null) {
        monacoVim.VimMode.Vim.unmap(item.before.join(''), mode)
      }
    }
  }
}

let unmapPrevious: () => void = () => {}
onConfigurationChanged(() => {
  unmapPrevious()
  const config = getConfiguration<VimConfiguration | undefined>(undefined, 'vim')
  mapVimKeyBindings(config?.insertModeKeyBindings, 'insert')
  mapVimKeyBindings(config?.normalModeKeyBindings, 'normal')
  mapVimKeyBindings(config?.visualModeKeyBindings, 'visual')

  unmapPrevious = () => {
    unmapVimKeyBindings(config?.insertModeKeyBindings, 'insert')
    unmapVimKeyBindings(config?.normalModeKeyBindings, 'normal')
    unmapVimKeyBindings(config?.visualModeKeyBindings, 'visual')
  }
})

export function initVimMode (editor: monaco.editor.IStandaloneCodeEditor, statusBarElement: Element): IDisposable {
  return monacoVim.initVimMode(editor, statusBarElement)
}
