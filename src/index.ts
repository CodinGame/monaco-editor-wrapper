import * as monaco from 'monaco-editor'
import { createEditor, registerEditorOpenHandler, registerTextModelContentProvider } from './monaco'
import { defineVSCodeTheme } from './theme'
import { updateUserConfiguration, registerConfigurations, registerDefaultConfigurations, onConfigurationChanged, getConfiguration } from './configuration'
import { getMonacoLanguage, loadLanguage } from './languages'
import { updateKeybindings, updateEditorKeybindingsMode } from './keybindings'
import { getThemeData, getThemes } from './theme/registry'
import type { IVSCodeTheme } from './theme/tools'

export * from './tools'

export {
  monaco,
  createEditor,

  defineVSCodeTheme,
  getThemes,
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
  registerEditorOpenHandler,
  loadLanguage
}

export type {
  IVSCodeTheme
}
