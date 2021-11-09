import * as monaco from 'monaco-editor'
import setupCobol from './cobol'
import setupAutofold from './autofold'

export default function setup (editor: monaco.editor.IStandaloneCodeEditor): void {
  setupCobol(editor)
  setupAutofold(editor)
}
