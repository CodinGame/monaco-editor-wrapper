import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import * as monaco from 'monaco-editor'
import { getJsonSchemas, onDidChangeJsonSchema } from 'vscode/monaco'
import { registerWorkerLoader } from '../worker'

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
      }
    ]
  })
}

updateDiagnosticsOptions()
onDidChangeJsonSchema(updateDiagnosticsOptions)

const workerLoader = async () => (await import(/* webpackChunkName: "MonacoJsonWorker" */'monaco-editor/esm/vs/language/json/json.worker?worker')).default
registerWorkerLoader('json', workerLoader)
