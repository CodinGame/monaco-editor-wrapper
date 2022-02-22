import * as monaco from 'monaco-editor'
import './languages'
import './theme'
import MultiEditorStandaloneCodeEditorServiceImpl, { EditorOpenHandler } from './services/MultiEditorStandaloneCodeEditorService'
import TextModelService from './services/TextModelService'
import './worker'
import setupExtensions from './extensions'

// Force EOL to be '\n' even on Windows
const configurationService = monaco.extra.StandaloneServices.get(monaco.extra.IConfigurationService)
configurationService.updateValue('files.eol', '\n').catch(err => {
  console.error('Unable to set file eol', err)
})

monaco.errorHandler.setUnexpectedErrorHandler(error => {
  console.warn('Unexpected error', error)
})

const textModelService = new TextModelService(monaco.extra.StandaloneServices.get(monaco.extra.IModelService))
const multiEditorStandaloneCodeEditorServiceImpl = new MultiEditorStandaloneCodeEditorServiceImpl(
  monaco.extra.StandaloneServices.get(monaco.extra.IContextKeyService),
  monaco.extra.StandaloneServices.get(monaco.editor.IStandaloneThemeService),
  textModelService
)

monaco.extra.StandaloneServices.initialize({
  codeEditorService: multiEditorStandaloneCodeEditorServiceImpl,
  textModelService
})

function createEditor (domElement: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions, override?: monaco.editor.IEditorOverrideServices): monaco.editor.IStandaloneCodeEditor {
  const editor = monaco.editor.create(domElement, options, override)

  setupExtensions(editor)

  return editor
}

function registerTextModelContentProvider (scheme: string, provider: monaco.extra.ITextModelContentProvider): monaco.IDisposable {
  return textModelService.registerTextModelContentProvider(scheme, provider)
}

function registerEditorOpenHandler (handler: EditorOpenHandler): monaco.IDisposable {
  return multiEditorStandaloneCodeEditorServiceImpl.registerEditorOpenHandler(handler)
}

export {
  createEditor,
  registerTextModelContentProvider,
  registerEditorOpenHandler
}
