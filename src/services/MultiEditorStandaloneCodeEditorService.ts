import * as monaco from 'monaco-editor'
import TextModelService from './TextModelService'
import { createEditor } from '../monaco'
import { getConfiguration } from '../configuration'

let popupEditorDisposable: monaco.IDisposable | null = null
function openNewCodeEditor (model: monaco.editor.ITextModel) {
  if (popupEditorDisposable != null) {
    popupEditorDisposable.dispose()
    popupEditorDisposable = null
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
  const editor = createEditor(
    editorElem,
    {
      model,
      readOnly: true,
      automaticLayout: true,
      ...getConfiguration(model.getLanguageId(), 'editor')
    }
  )

  popupEditorDisposable = {
    dispose: () => {
      editor.dispose()
      document.body.removeChild(container)
      popupEditorDisposable = null
    }
  }

  container.addEventListener('mousedown', (event) => {
    if (event.target !== container) {
      return
    }

    popupEditorDisposable?.dispose()
  })

  return editor
}

export type EditorOpenHandler = (model: monaco.editor.ITextModel, input: monaco.extra.IResourceEditorInput, editor: monaco.editor.ICodeEditor, sideBySide?: boolean) => Promise<monaco.editor.ICodeEditor | null>

export default class MultiEditorStandaloneCodeEditorServiceImpl extends monaco.extra.StandaloneCodeEditorService {
  private modelResolverService: TextModelService
  constructor (
    contextKeyService: monaco.extra.IContextKeyService,
    themeService: monaco.editor.IThemeService,
    modelResolverService: TextModelService
  ) {
    super(contextKeyService, themeService)
    this.modelResolverService = modelResolverService
  }

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

  override async openCodeEditor (input: monaco.extra.IResourceEditorInput, editor: monaco.editor.ICodeEditor, sideBySide?: boolean): Promise<monaco.editor.ICodeEditor | null> {
    const reference = await this.modelResolverService.createModelReference(input.resource)
    const model = reference.object.textEditorModel
    let modelEditor: monaco.editor.ICodeEditor | undefined
    if (editor.getModel() === model) {
      modelEditor = editor
    }
    if (modelEditor == null) {
      const codeEditors = monaco.extra.StandaloneServices.get(monaco.extra.ICodeEditorService).listCodeEditors()
      modelEditor = codeEditors.find(editor => editor.getModel() === model)
    }
    if (modelEditor == null) {
      for (const handler of this.handlers) {
        const handlerEditor = await handler(model, input, editor, sideBySide)
        if (handlerEditor != null) {
          modelEditor = handlerEditor
          break
        }
      }
    }
    if (modelEditor == null) {
      modelEditor = openNewCodeEditor(model)
    }

    super.doOpenEditor(modelEditor, input)

    modelEditor.focus()
    if (modelEditor.getDomNode()?.scrollIntoView != null) {
      modelEditor.getDomNode()?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      })
    }

    const onModelUnmount = () => {
      reference.dispose()
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

    return modelEditor
  }
}
