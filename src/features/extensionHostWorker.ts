import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import { registerServices } from '../services'
import { Worker } from '../tools/FakeWorker'

const fakeWorker = new Worker(new URL('vscode/workers/extensionHost.worker', import.meta.url), {
  type: 'module'
})

registerServices({
  ...getExtensionServiceOverride({
    url: fakeWorker.url.toString(),
    options: fakeWorker.options
  })
})
