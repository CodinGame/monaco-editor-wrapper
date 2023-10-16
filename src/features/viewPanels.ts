import getMarkersServiceOverride from '@codingame/monaco-vscode-markers-service-override'
import getOutputServiceOverride from '@codingame/monaco-vscode-output-service-override'
import { registerServices } from '../services'
import { registerWorkerLoader } from '../worker'
import '@codingame/monaco-vscode-references-view-default-extension'

registerWorkerLoader('outputLinkComputer', () => new Worker(new URL('@codingame/monaco-vscode-output-service-override/worker', import.meta.url)))

registerServices({
  ...getOutputServiceOverride(),
  ...getMarkersServiceOverride()
})
