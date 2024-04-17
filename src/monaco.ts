import * as monaco from 'monaco-editor'
import { IReference, ITextFileEditorModel, createConfiguredEditor, errorHandler, createModelReference as vscodeCreateModelReference } from 'vscode/monaco'
import { editorOpenHandlerRegistry, initializePromise, isInitialized } from './services'
import './languages'
import './worker'
import './extensions'
import { EditorOpenHandler } from './tools/EditorOpenHandlerRegistry'

errorHandler.setUnexpectedErrorHandler(error => {
  console.warn('Unexpected error', error)
})

function createEditor (domElement: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions): monaco.editor.IStandaloneCodeEditor {
  if (!isInitialized()) {
    throw new Error('Monaco not initialized')
  }
  return createConfiguredEditor(domElement, options)
}

async function createModelReference (resource: monaco.Uri, content?: string): Promise<IReference<ITextFileEditorModel>> {
  await initializePromise
  return vscodeCreateModelReference(resource, content)
}

function registerEditorOpenHandler (handler: EditorOpenHandler): monaco.IDisposable {
  return editorOpenHandlerRegistry.registerEditorOpenHandler(handler)
}

export {
  createEditor,
  createModelReference,
  registerEditorOpenHandler
}
