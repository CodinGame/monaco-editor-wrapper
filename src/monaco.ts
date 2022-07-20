import * as monaco from 'monaco-editor'
import './languages'
import './theme'
import getModelEditorServiceOverride from 'vscode/service-override/modelEditor'
import getMessageServiceOverride from 'vscode/service-override/messages'
import './worker'
import setupExtensions from './extensions'
import 'monaco-editor/esm/vs/editor/editor.all'
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp'
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard'
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess'
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch'
import EditorOpenHandlerRegistry, { EditorOpenHandler } from './tools/EditorOpenHandlerRegistry'

const editorOpenHandlerRegistry = new EditorOpenHandlerRegistry()

monaco.extra.StandaloneServices.initialize({
  ...getModelEditorServiceOverride((model, input, sideBySide) => {
    return editorOpenHandlerRegistry.openCodeEditor(model, input, sideBySide)
  }),
  ...getMessageServiceOverride(document.body)
})
// Disable high contrast autodetection because it fallbacks on the hc-black no matter what
monaco.extra.StandaloneServices.get(monaco.editor.IStandaloneThemeService).setAutoDetectHighContrast(false)

monaco.errorHandler.setUnexpectedErrorHandler(error => {
  console.warn('Unexpected error', error)
})

function createEditor (domElement: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions): monaco.editor.IStandaloneCodeEditor {
  const editor = monaco.editor.create(domElement, options)

  setupExtensions(editor)

  return editor
}

function registerTextModelContentProvider (scheme: string, provider: monaco.extra.ITextModelContentProvider): monaco.IDisposable {
  const textModelService = monaco.extra.StandaloneServices.get(monaco.extra.ITextModelService)
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
