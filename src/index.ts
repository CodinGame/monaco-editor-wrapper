import * as monaco from 'monaco-editor'
import { createEditor, registerTextModelContentProvider } from './monaco'
import { addVSCodeTheme } from './theme'
import { updateUserConfiguration, registerDefaultConfigurations, onConfigurationChanged, getConfiguration } from './configuration'
import { getMonacoLanguage } from './languages'
import { updateEditorKeybindings } from './keybindings'
import { getThemeData } from './theme/registry'
import type { IVSCodeTheme } from './theme/tools'

export * from './tools'

export {
  monaco,
  createEditor,

  addVSCodeTheme,
  getThemeData,

  registerDefaultConfigurations,
  updateUserConfiguration,
  getConfiguration,
  onConfigurationChanged,
  updateEditorKeybindings,

  getMonacoLanguage,
  registerTextModelContentProvider
}

export type {
  IVSCodeTheme
}
