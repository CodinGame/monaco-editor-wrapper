import getMarkersServiceOverride from '@codingame/monaco-vscode-markers-service-override'
import getOutputServiceOverride from '@codingame/monaco-vscode-output-service-override'
import getTimelineServiceOverride from '@codingame/monaco-vscode-timeline-service-override'
import getOutlineServiceOverride from '@codingame/monaco-vscode-outline-service-override'
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override'
import { registerServices } from '../services'
import { registerWorkerLoader } from '../worker'
import { Worker } from '../tools/crossOriginWorker'
import '@codingame/monaco-vscode-references-view-default-extension'
import '@codingame/monaco-vscode-merge-conflict-default-extension'

registerWorkerLoader(
  'OutputLinkDetectionWorker',
  () =>
    new Worker(
      new URL('@codingame/monaco-vscode-output-service-override/worker', import.meta.url),
      { type: 'module' }
    )
)

registerServices({
  ...getTimelineServiceOverride(),
  ...getOutlineServiceOverride(),
  ...getOutputServiceOverride(),
  ...getMarkersServiceOverride(),
  ...getExplorerServiceOverride()
})
