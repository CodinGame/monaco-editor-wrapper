import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import { registerServices } from '../services'
import { Worker } from '../tools/FakeWorker'
import { registerWorker } from '../worker.js'

registerServices({
  ...getExtensionServiceOverride({
    enableWorkerExtensionHost: true
  })
})

registerWorker(
  'extensionHostWorkerMain',
  new Worker(
    new URL('@codingame/monaco-vscode-api/workers/extensionHost.worker', import.meta.url),
    {
      type: 'module'
    }
  )
)
