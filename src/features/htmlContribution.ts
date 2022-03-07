import * as monaco from 'monaco-editor'
import 'monaco-editor/esm/vs/language/html/monaco.contribution'
import { getConfiguration, onConfigurationChanged, registerConfigurations } from '../configuration'
import { registerWorkerLoader } from '../worker'

const workerLoader = async () => (await import(/* webpackChunkName: "MonacoHtmlWorker" */'monaco-editor/esm/vs/language/html/html.worker?worker')).default
registerWorkerLoader('html', workerLoader)
registerWorkerLoader('handlebars', workerLoader)
registerWorkerLoader('razor', workerLoader)

/**
 * Start autoclosing html tags
 * Inspired by https://github.com/microsoft/monaco-editor/issues/221
 * and https://github.com/microsoft/vscode/blob/5943dac8ba32df1963a1760c660b3f16f5fcdc51/extensions/html-language-features/client/src/autoInsertion.ts
 */
registerConfigurations([{
  id: 'html',
  order: 20,
  type: 'object',
  title: 'HTML',
  properties: {
    'html.autoClosingTags': {
      type: 'boolean',
      scope: monaco.extra.ConfigurationScope.RESOURCE,
      default: true,
      description: 'Enable/disable autoclosing of HTML tags.'
    }
  }
}])

let autoClosingTags = getConfiguration<boolean>(undefined, 'html.autoClosingTags')!
onConfigurationChanged(e => {
  if (e.affectsConfiguration('html.autoClosingTags')) {
    autoClosingTags = getConfiguration<boolean>(undefined, 'html.autoClosingTags')!
  }
})

function autoCloseHtmlTags (editor: monaco.editor.ICodeEditor): monaco.IDisposable {
  const disposableStore = new monaco.DisposableStore()

  let timeout: number | undefined
  disposableStore.add({
    dispose: () => {
      if (timeout != null) {
        window.clearTimeout(timeout)
      }
    }
  })

  disposableStore.add(editor.onDidChangeModelContent(e => {
    if (timeout != null) {
      window.clearTimeout(timeout)
      timeout = undefined
    }

    if (!autoClosingTags || e.isRedoing || e.isUndoing) {
      return
    }
    const model = editor.getModel()
    if (model == null || model.getLanguageId() !== 'html') {
      return
    }

    timeout = window.setTimeout(() => {
      for (const { range, rangeLength, text } of e.changes) {
        if (!text.endsWith('>')) {
          continue
        }
        const untilLine = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: range.endLineNumber,
          endColumn: range.endColumn + rangeLength + 1
        })

        const enclosingTag = untilLine.match(/.*<(\w+)>$/)?.[1]

        if (enclosingTag == null || enclosingTag.includes('/')) {
          return
        }

        const newRange = new monaco.Range(
          range.endLineNumber,
          range.endColumn + rangeLength + 1,
          range.endLineNumber,
          range.endColumn + rangeLength + enclosingTag.length + 1
        )

        const rest = model.getValueInRange(newRange)
        model.applyEdits([{
          range: newRange,
          text: `</${enclosingTag}>${rest}`,
          forceMoveMarkers: true
        }])
      }
    }, 100)
  }))

  return disposableStore
}

const codeEditors = monaco.extra.StandaloneServices.get(monaco.extra.ICodeEditorService).listCodeEditors()
for (const editor of codeEditors) {
  autoCloseHtmlTags(editor)
}
monaco.editor.onDidCreateEditor(editor => {
  autoCloseHtmlTags(editor)
})
/**
 * End autoclosing html tags
 */
