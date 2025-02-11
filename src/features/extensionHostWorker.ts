import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import { registerServices } from '../services'
import { Worker } from '../tools/FakeWorker'

const fakeWorker = new Worker(
  new URL('@codingame/monaco-vscode-api/workers/extensionHost.worker', import.meta.url),
  {
    type: 'module'
  }
)

registerServices({
  ...getExtensionServiceOverride({
    url: new URL(fakeWorker.url, window.location.href).toString(),
    options: fakeWorker.options
  })
})
