import * as monaco from 'monaco-editor'
import { OpenEditor, IEditorOptions, IResolvedTextEditorModel } from '@codingame/monaco-vscode-editor-service-override'
import { IReference } from 'vscode/monaco'

let currentEditor: ({
  model: monaco.editor.ITextModel
  editor: monaco.editor.ICodeEditor
} & monaco.IDisposable) | null = null
function openNewCodeEditor (modelRef: IReference<IResolvedTextEditorModel>) {
  if (currentEditor != null && modelRef.object.textEditorModel === currentEditor.model) {
    return currentEditor.editor
  }
  if (currentEditor != null) {
    currentEditor.dispose()
    currentEditor = null
  }
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.zIndex = '10000'
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  container.style.top = container.style.bottom = container.style.left = container.style.right = '0'
  container.style.cursor = 'pointer'

  const editorElem = document.createElement('div')
  editorElem.style.position = 'absolute'
  editorElem.style.top = editorElem.style.bottom = editorElem.style.left = editorElem.style.right = '0'
  editorElem.style.margin = 'auto'
  editorElem.style.width = '80%'
  editorElem.style.height = '80%'

  container.appendChild(editorElem)

  document.body.appendChild(container)
  try {
    const editor = monaco.editor.create(
      editorElem,
      {
        model: modelRef.object.textEditorModel,
        readOnly: true,
        automaticLayout: true
      }
    )

    currentEditor = {
      dispose: () => {
        modelRef.dispose()
        editor.dispose()
        document.body.removeChild(container)
        currentEditor = null
      },
      model: modelRef.object.textEditorModel,
      editor
    }

    container.addEventListener('mousedown', (event) => {
      if (event.target !== container) {
        return
      }

      currentEditor?.dispose()
    })

    return editor
  } catch (error) {
    document.body.removeChild(container)
    currentEditor = null
    throw error
  }
}

export type EditorOpenHandler = (modelRef: IReference<IResolvedTextEditorModel>, input: IEditorOptions | undefined, editor: monaco.editor.ICodeEditor | null, sideBySide?: boolean) => Promise<monaco.editor.ICodeEditor | null>

export default class EditorOpenHandlerRegistry {
  private handlers: EditorOpenHandler[] = []
  public registerEditorOpenHandler (handler: EditorOpenHandler): monaco.IDisposable {
    this.handlers.push(handler)

    return {
      dispose: () => {
        const index = this.handlers.indexOf(handler)
        if (index >= 0) {
          this.handlers.splice(index, 1)
        }
      }
    }
  }

  openCodeEditor: OpenEditor = async (modelRef, options, sideBySide?) => {
    let modelEditor: monaco.editor.ICodeEditor | undefined
    for (const handler of this.handlers) {
      const handlerEditor = await handler(modelRef, options, null, sideBySide)
      if (handlerEditor != null) {
        modelEditor = handlerEditor
        break
      }
    }
    if (modelEditor == null) {
      modelEditor = openNewCodeEditor(modelRef)

      // Destroy model ref when we close the editor popup
      const onModelUnmount = () => {
        modelRef.dispose()
      }
      const onDidDisposeDisposable = modelEditor.onDidDispose(() => {
        onModelUnmount()
      })
      const onDidChangeModelDisposable = modelEditor.onDidChangeModel((e) => {
        if (e.newModelUrl == null || e.newModelUrl.toString() !== modelRef.object.textEditorModel.uri.toString()) {
          onModelUnmount()
          onDidDisposeDisposable.dispose()
          onDidChangeModelDisposable.dispose()
        }
      })
    }

    modelEditor.focus()
    if (modelEditor.getDomNode()?.scrollIntoView != null) {
      modelEditor.getDomNode()?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      })
    }

    return modelEditor
  }
}
