import getTerminalServiceOverride from '@codingame/monaco-vscode-terminal-service-override'
import { registerServices } from '../services'

registerServices({
  ...getTerminalServiceOverride()
})
