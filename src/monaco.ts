import * as monaco from 'monaco-editor'
import './hacks'
import './languages'
import './theme'
import MultiEditorStandaloneCodeEditorServiceImpl from './services/MultiEditorStandaloneCodeEditorService'
import EditorModelResolverService from './services/EditorModelResolverService'
import './worker'
import setupExtensions from './extensions'

// Force EOL to be '\n' even on Windows
monaco.editor.StaticServices.configurationService.get().updateValue('files.eol', '\n').catch(err => {
  console.error('Unable to set file eol', err)
})

const editorModelResolverService = new EditorModelResolverService(monaco.editor.StaticServices.modelService.get())
const multiEditorStandaloneCodeEditorServiceImpl = new MultiEditorStandaloneCodeEditorServiceImpl(
  null,
  monaco.editor.StaticServices.contextKeyService.get(),
  monaco.editor.StaticServices.standaloneThemeService.get(),
  editorModelResolverService
)

function createEditor (domElement: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions, override?: monaco.editor.IEditorOverrideServices): monaco.editor.IStandaloneCodeEditor {
  const editor = monaco.editor.create(domElement, options, {
    codeEditorService: multiEditorStandaloneCodeEditorServiceImpl,
    textModelService: editorModelResolverService,
    ...override
  })

  editorModelResolverService.setEditor(editor)

  setupExtensions(editor)

  return editor
}

function registerTextModelContentProvider (scheme: string, provider: monaco.extra.ITextModelContentProvider): monaco.IDisposable {
  return editorModelResolverService.registerTextModelContentProvider(scheme, provider)
}

export {
  createEditor,
  registerTextModelContentProvider
}
