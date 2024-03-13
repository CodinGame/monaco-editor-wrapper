import getTestingServiceOverride from '@codingame/monaco-vscode-testing-service-override'
import { registerServices } from '../services'
import './terminal' // Testing feature needs terminal service override

registerServices({
  ...getTestingServiceOverride()
})
