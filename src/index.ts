import * as monaco from 'monaco-editor'
import { createEditor, registerEditorOpenHandler, registerTextModelContentProvider } from './monaco'
import { addVSCodeTheme } from './theme'
import { updateUserConfiguration, registerConfigurations, registerDefaultConfigurations, onConfigurationChanged, getConfiguration } from './configuration'
import { getMonacoLanguage } from './languages'
import { updateKeybindings, updateEditorKeybindingsMode } from './keybindings'
import { getThemeData } from './theme/registry'
import type { IVSCodeTheme } from './theme/tools'

export * from './tools'

export {
  monaco,
  createEditor,

  addVSCodeTheme,
  getThemeData,

  registerConfigurations,
  registerDefaultConfigurations,
  updateUserConfiguration,
  getConfiguration,
  onConfigurationChanged,
  updateEditorKeybindingsMode,
  updateKeybindings,

  getMonacoLanguage,
  registerTextModelContentProvider,
  registerEditorOpenHandler
}

export type {
  IVSCodeTheme
}
