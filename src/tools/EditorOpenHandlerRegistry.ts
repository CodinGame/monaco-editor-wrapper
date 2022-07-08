import * as monaco from 'monaco-editor'
import { OpenEditor, IEditorOptions } from 'vscode/service-override/modelEditor'
import { createEditor } from '../monaco'
import { getConfiguration } from '../configuration'

let currentEditor: ({
  model: monaco.editor.ITextModel
  editor: monaco.editor.IStandaloneCodeEditor
} & monaco.IDisposable) | null = null
function openNewCodeEditor (model: monaco.editor.ITextModel) {
  if (currentEditor != null && model === currentEditor.model) {
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
    const editor = createEditor(
      editorElem,
      {
        model,
        readOnly: true,
        automaticLayout: true,
        ...getConfiguration(model.getLanguageId(), 'editor')
      }
    )

    currentEditor = {
      dispose: () => {
        editor.dispose()
        document.body.removeChild(container)
        currentEditor = null
      },
      model,
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

export type EditorOpenHandler = (model: monaco.editor.ITextModel, input: IEditorOptions | undefined, editor: monaco.editor.ICodeEditor | null, sideBySide?: boolean) => Promise<monaco.editor.ICodeEditor | null>

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

  openCodeEditor: OpenEditor = async (model, options, sideBySide?) => {
    let modelEditor: monaco.editor.ICodeEditor | undefined
    for (const handler of this.handlers) {
      const handlerEditor = await handler(model, options, null, sideBySide)
      if (handlerEditor != null) {
        modelEditor = handlerEditor
        break
      }
    }
    if (modelEditor == null) {
      modelEditor = openNewCodeEditor(model)

      // Destroy model ref when we close the editor popup
      const onModelUnmount = () => {
        model.dispose()
      }
      const onDidDisposeDisposable = modelEditor.onDidDispose(() => {
        onModelUnmount()
      })
      const onDidChangeModelDisposable = modelEditor.onDidChangeModel((e) => {
        if (e.newModelUrl == null || e.newModelUrl.toString() !== model.uri.toString()) {
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
