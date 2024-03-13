import getTestingServiceOverride from '@codingame/monaco-vscode-testing-service-override'
import { registerServices } from '../services'

registerServices({
  ...getTestingServiceOverride()
})
