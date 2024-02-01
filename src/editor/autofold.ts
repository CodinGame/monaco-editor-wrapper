import * as monaco from 'monaco-editor'
import { FoldingController, setCollapseStateForMatchingLines } from 'vscode/monaco'

export default function setup (editor: monaco.editor.IStandaloneCodeEditor): void {
  editor.addAction({
    id: 'editor.foldAllAutofoldRegions',
    label: 'Fold all autofold regions',
    run: async (editor: monaco.editor.ICodeEditor) => {
      const foldingController = FoldingController.get(editor)
      const foldingModelPromise = foldingController?.getFoldingModel()
      if (foldingModelPromise != null) {
        return foldingModelPromise.then(foldingModel => {
          const editorModel = editor.getModel()
          if (editorModel == null || foldingModel == null) {
            return
          }
          const regExp = /.*autofold.*/
          setCollapseStateForMatchingLines(foldingModel, regExp, true)
        })
      }
    }
  })
}
