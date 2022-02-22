import * as monaco from 'monaco-editor'

export default function setup (editor: monaco.editor.IStandaloneCodeEditor): void {
  editor.addAction({
    id: 'editor.foldAllAutofoldRegions',
    label: 'Fold all autofold regions',
    run: async (editor: monaco.editor.ICodeEditor) => {
      const foldingController = monaco.extra.FoldingController.get(editor)
      const foldingModelPromise: Promise<monaco.extra.FoldingModel> | null = foldingController?.getFoldingModel()
      if (foldingModelPromise != null) {
        return foldingModelPromise.then(foldingModel => {
          const editorModel = editor.getModel()
          if (editorModel == null) {
            return
          }
          const regExp = /.*autofold.*/
          monaco.extra.setCollapseStateForMatchingLines(foldingModel, regExp, true)
        })
      }
    }
  })
}
