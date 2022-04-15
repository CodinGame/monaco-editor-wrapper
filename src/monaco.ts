import * as monaco from 'monaco-editor'
import './languages'
import './theme'
import MultiEditorStandaloneCodeEditorServiceImpl, { EditorOpenHandler } from './services/MultiEditorStandaloneCodeEditorService'
import TextModelService from './services/TextModelService'
import './worker'
import setupExtensions from './extensions'

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
