import getWorkingCopyServiceOverride from '@codingame/monaco-vscode-working-copy-service-override'
import { registerServices } from '../services'

registerServices({
  ...getWorkingCopyServiceOverride()
})
