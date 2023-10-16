import * as monaco from 'monaco-editor'
import { createEditor, createModelReference, registerEditorOpenHandler, initializePromise } from './monaco'
import { updateUserConfiguration, registerConfigurations, registerDefaultConfigurations, onConfigurationChanged, getConfiguration, getUserConfiguration, onUserConfigurationChange } from './configuration'
import { getMonacoLanguage, loadLanguage } from './languages'
import { updateKeybindings, updateEditorKeybindingsMode } from './keybindings'
import './style'
export * from './tools'

export {
  monaco,
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
  loadLanguage
}
