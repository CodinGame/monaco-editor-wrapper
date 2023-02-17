import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import * as monaco from 'monaco-editor'
import { getJsonSchemas, onDidChangeJsonSchema } from 'vscode/monaco'
import { Disposable } from 'vscode'
import { registerWorkerLoader } from '../worker'

type Unpacked<T> = T extends (infer U)[] ? U : T
type Schema = Unpacked<NonNullable<monaco.languages.json.DiagnosticsOptions['schemas']>>

monaco.languages.json.jsonDefaults.setModeConfiguration({
  ...monaco.languages.json.jsonDefaults.modeConfiguration,
  tokens: false // Disable monarch tokenizer as we use TextMate here
})

const customSchemas: Schema[] = []
function updateDiagnosticsOptions () {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    comments: 'ignore',
    validate: true,
    enableSchemaRequest: true,
    schemas: [
      ...getJsonSchemas({
        keybindings: ['file:///keybindings.json'],
        'settings/user': ['file:///settings.json']
      })!,
      {
        uri: 'https://json-schema.org/draft/2019-09/schema',
        fileMatch: ['*.schema.json']
      },
      ...customSchemas
    ]
  })
}

updateDiagnosticsOptions()
onDidChangeJsonSchema(updateDiagnosticsOptions)

const workerLoader = async () => (await import(/* webpackChunkName: "MonacoJsonWorker" */'monaco-editor/esm/vs/language/json/json.worker?worker')).default
registerWorkerLoader('json', workerLoader)

export function addJsonSchema (schema: Unpacked<NonNullable<monaco.languages.json.DiagnosticsOptions['schemas']>>): Disposable {
  customSchemas.push(schema)
  updateDiagnosticsOptions()
  return new Disposable(() => {
    const index = customSchemas.indexOf(schema)
    if (index >= 0) {
      customSchemas.splice(index, 1)
      updateDiagnosticsOptions()
    }
  })
}
