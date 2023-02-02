import * as monaco from 'monaco-editor'
import { createEditor, registerEditorOpenHandler, registerTextModelContentProvider } from './monaco'
import { defineVSCodeTheme } from './theme'
import { updateUserConfiguration, registerConfigurations, registerDefaultConfigurations, onConfigurationChanged, getConfiguration, getUserConfiguration } from './configuration'
import { getMonacoLanguage, loadLanguage } from './languages'
import { updateKeybindings, updateEditorKeybindingsMode } from './keybindings'
import './style'
export * from './tools'

export {
  monaco,
  createEditor,

  defineVSCodeTheme,

  registerConfigurations,
  registerDefaultConfigurations,
  updateUserConfiguration,
  getUserConfiguration,
  getConfiguration,
  onConfigurationChanged,
  updateEditorKeybindingsMode,
  updateKeybindings,

  getMonacoLanguage,
  registerTextModelContentProvider,
  registerEditorOpenHandler,
  loadLanguage
}
