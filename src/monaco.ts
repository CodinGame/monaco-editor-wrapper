import * as monaco from 'monaco-editor'
import './languages'
import './theme'
import MultiEditorStandaloneCodeEditorServiceImpl, { EditorOpenHandler } from './services/MultiEditorStandaloneCodeEditorService'
import TextModelService from './services/TextModelService'
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

monaco.extra.StandaloneServices.initialize({
  get textModelService () {
    return new TextModelService(monaco.extra.StandaloneServices.get(monaco.extra.IModelService))
  },
  get codeEditorService () {
    return new MultiEditorStandaloneCodeEditorServiceImpl(
      monaco.extra.StandaloneServices.get(monaco.extra.IContextKeyService),
      monaco.extra.StandaloneServices.get(monaco.editor.IStandaloneThemeService),
      monaco.extra.StandaloneServices.get(monaco.extra.ITextModelService)
    )
  }
})
// Disable high contrast autodetection because it fallbacks on the hc-black no matter what
monaco.extra.StandaloneServices.get(monaco.editor.IStandaloneThemeService).setAutoDetectHighContrast(false)

// Force EOL to be '\n' even on Windows
const configurationService = monaco.extra.StandaloneServices.get(monaco.extra.IConfigurationService)
configurationService.updateValue('files.eol', '\n').catch((error: Error) => {
  monaco.errorHandler.onUnexpectedError(new Error('Unable to set file eol', {
    cause: error
  }))
})

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
  const codeEditorService = monaco.extra.StandaloneServices.get(monaco.extra.ICodeEditorService)
  return (codeEditorService as MultiEditorStandaloneCodeEditorServiceImpl).registerEditorOpenHandler(handler)
}

export {
  createEditor,
  registerTextModelContentProvider,
  registerEditorOpenHandler
}
