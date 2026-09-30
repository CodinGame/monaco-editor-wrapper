import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override'
import { registerServices } from '../services'

registerServices({
  ...getConfigurationServiceOverride()
})
