import * as monaco from 'monaco-editor'
import './languages'
import './theme'
import { StandaloneServices, ITextModelService, ITextModelContentProvider } from 'vscode/services'
import getModelEditorServiceOverride from 'vscode/service-override/modelEditor'
import getMessageServiceOverride from 'vscode/service-override/messages'
import getConfigurationServiceOverride from 'vscode/service-override/configuration'
import getKeybindingsServiceOverride from 'vscode/service-override/keybindings'
import getTextmateServiceOverride from 'vscode/service-override/textmate'
import getThemeServiceOverride from 'vscode/service-override/theme'
import geTokenClassificationServiceOverride from 'vscode/service-override/tokenClassification'
import getLanguageConfigurationServiceOverride from 'vscode/service-override/languageConfiguration'
import getSnippetConfigurationServiceOverride from 'vscode/service-override/snippets'
import getLanguagesServiceOverride from 'vscode/service-override/languages'
import './worker'
import { createConfiguredEditor, errorHandler } from 'vscode/monaco'
import onigFile from 'vscode-oniguruma/release/onig.wasm'
import setupExtensions from './extensions'
import 'monaco-editor/esm/vs/editor/editor.all'
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp'
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess'
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch'
import EditorOpenHandlerRegistry, { EditorOpenHandler } from './tools/EditorOpenHandlerRegistry'

const editorOpenHandlerRegistry = new EditorOpenHandlerRegistry()

StandaloneServices.initialize({
  ...getModelEditorServiceOverride((model, input, sideBySide) => {
    return editorOpenHandlerRegistry.openCodeEditor(model, input, sideBySide)
  }),
  ...getMessageServiceOverride(document.body),
  ...getConfigurationServiceOverride(),
  ...getKeybindingsServiceOverride(),
  ...getTextmateServiceOverride(async () => {
    const response = await fetch(onigFile)
    return await response.arrayBuffer()
  }),
  ...getThemeServiceOverride(),
  ...geTokenClassificationServiceOverride(),
  ...getLanguageConfigurationServiceOverride(),
  ...getSnippetConfigurationServiceOverride(),
  ...getLanguagesServiceOverride()
})

errorHandler.setUnexpectedErrorHandler(error => {
  console.warn('Unexpected error', error)
})

function createEditor (domElement: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions): monaco.editor.IStandaloneCodeEditor {
  const editor = createConfiguredEditor(domElement, options)

  setupExtensions(editor)

  return editor
}

function registerTextModelContentProvider (scheme: string, provider: ITextModelContentProvider): monaco.IDisposable {
  const textModelService = StandaloneServices.get(ITextModelService)
  return textModelService.registerTextModelContentProvider(scheme, provider)
}

function registerEditorOpenHandler (handler: EditorOpenHandler): monaco.IDisposable {
  return editorOpenHandlerRegistry.registerEditorOpenHandler(handler)
}

export {
  createEditor,
  registerTextModelContentProvider,
  registerEditorOpenHandler
}
