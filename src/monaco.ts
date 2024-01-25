import * as monaco from 'monaco-editor'
import { IReference, ITextFileEditorModel, createConfiguredEditor, errorHandler, createModelReference as vscodeCreateModelReference } from 'vscode/monaco'
import { initialize, editorOpenHandlerRegistry } from './services'
import './extensions'
import './languages'
import './theme'
import './worker'
import setupExtensions from './editor'
import 'monaco-editor'
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard'
import { EditorOpenHandler } from './tools/EditorOpenHandlerRegistry'

errorHandler.setUnexpectedErrorHandler(error => {
  console.warn('Unexpected error', error)
})

const initializePromise = initialize()

async function createEditor (domElement: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions): Promise<monaco.editor.IStandaloneCodeEditor> {
  await initializePromise
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
