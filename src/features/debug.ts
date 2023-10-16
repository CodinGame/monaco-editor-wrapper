import getDebugServiceOverride from '@codingame/monaco-vscode-debug-service-override'
import { registerServices } from '../services'

registerServices({
  ...getDebugServiceOverride()
})
