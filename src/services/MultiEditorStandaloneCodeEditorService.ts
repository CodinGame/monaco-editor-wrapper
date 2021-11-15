import * as monaco from 'monaco-editor'
import EditorModelResolverService from './EditorModelResolverService'
import { createEditor } from '../monaco'

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
      automaticLayout: true
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

export default class MultiEditorStandaloneCodeEditorServiceImpl extends monaco.extra.StandaloneCodeEditorServiceImpl {
  private modelResolverService: EditorModelResolverService
  constructor (
    styleSheet: monaco.extra.GlobalStyleSheet | null,
    contextKeyService: monaco.extra.IContextKeyService,
    themeService: monaco.editor.IThemeService,
    modelResolverService: EditorModelResolverService
  ) {
    super(styleSheet, contextKeyService, themeService)
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
    const existingModel = monaco.editor.getModel(input.resource)
    let model = existingModel
    if (model == null) {
      model = await this.modelResolverService.fetchModel(input.resource)
    }
    if (model == null) {
      console.error('Unable to find model', input.resource)
      return null
    }
    let modelEditor: monaco.editor.ICodeEditor | undefined
    if (editor.getModel() === model) {
      modelEditor = editor
    }
    if (modelEditor == null) {
      const codeEditors = monaco.editor.StaticServices.codeEditorService.get().listCodeEditors()
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
      if (existingModel == null) {
        // If we just created this method, dispose it
        modelEditor.onDidDispose(() => {
          model?.dispose()
        })
      }
    }

    super.doOpenEditor(modelEditor, input)

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
