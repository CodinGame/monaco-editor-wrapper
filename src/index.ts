import * as monaco from 'monaco-editor'
import { createEditor, createModelReference, registerEditorOpenHandler } from './monaco'
import {
  updateUserConfiguration,
  registerConfigurations,
  registerDefaultConfigurations,
  onConfigurationChanged,
  getConfiguration,
  getUserConfiguration,
  onUserConfigurationChange
} from './configuration'
import { getMonacoLanguage, loadLanguage } from './languages'
import { updateKeybindings, updateEditorKeybindingsMode } from './keybindings'
import {
  generateAndInitializeWorkspace,
  initialize,
  initializePromise,
  isInitialized,
  registerFile,
  registerServices,
  setUseGlobalPicker
} from './services.js'
import './style.js'
import { registerWorker } from './worker.js'
export * from './tools.js'
import { Worker } from './tools/FakeWorker'

export {
  monaco,
  registerServices,
  initialize,
  generateAndInitializeWorkspace,
  isInitialized,
  initializePromise,
  createEditor,
  createModelReference,
  registerFile,
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
  setUseGlobalPicker,
  registerWorker,
  Worker
}
