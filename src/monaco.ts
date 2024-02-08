import * as monaco from 'monaco-editor'
import { IReference, ITextFileEditorModel, createConfiguredEditor, errorHandler, createModelReference as vscodeCreateModelReference } from 'vscode/monaco'
import { initialize, editorOpenHandlerRegistry } from './services'
import './languages'
import './theme'
import './worker'
import setupExtensions from './editor'
import { EditorOpenHandler } from './tools/EditorOpenHandlerRegistry'

// see https://github.com/microsoft/monaco-editor/issues/4378
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(<any>global).vscode = {
  process: false
}

errorHandler.setUnexpectedErrorHandler(error => {
  console.warn('Unexpected error', error)
})

let initialized = false
const initializePromise = initialize().then(() => { initialized = true })

function createEditor (domElement: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions): monaco.editor.IStandaloneCodeEditor {
  if (!initialized) {
    throw new Error('Monaco not initialized')
  }
  const editor = createConfiguredEditor(domElement, options)

  setupExtensions(editor)

  return editor
}

async function createModelReference (resource: monaco.Uri, content?: string): Promise<IReference<ITextFileEditorModel>> {
  await initializePromise
  return vscodeCreateModelReference(resource, content)
}

function registerEditorOpenHandler (handler: EditorOpenHandler): monaco.IDisposable {
  return editorOpenHandlerRegistry.registerEditorOpenHandler(handler)
}

export {
  initializePromise,
  createEditor,
  createModelReference,
  registerEditorOpenHandler
}
