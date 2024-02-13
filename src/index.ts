import * as monaco from 'monaco-editor'
import { createEditor, createModelReference, registerEditorOpenHandler } from './monaco'
import { updateUserConfiguration, registerConfigurations, registerDefaultConfigurations, onConfigurationChanged, getConfiguration, getUserConfiguration, onUserConfigurationChange } from './configuration'
import { getMonacoLanguage, loadLanguage } from './languages'
import { updateKeybindings, updateEditorKeybindingsMode } from './keybindings'
import { generateAndInitializeWorkspace, initialize, initializePromise, isInitialized, setUseGlobalPicker } from './services'
import './style'
export * from './tools'

export {
  monaco,
  initialize,
  generateAndInitializeWorkspace,
  isInitialized,
  initializePromise,
  createEditor,
  createModelReference,

  registerConfigurations,
  registerDefaultConfigurations,
  updateUserConfiguration,
  getUserConfiguration,
  onUserConfigurationChange,
  getConfiguration,
  onConfigurationChanged,
  updateEditorKeybindingsMode,
  updateKeybindings,

  getMonacoLanguage,
  registerEditorOpenHandler,
  loadLanguage,
  setUseGlobalPicker
}
