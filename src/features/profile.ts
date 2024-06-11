import getProfileServiceOverride from '@codingame/monaco-vscode-user-data-profile-service-override'
import { registerServices } from '../services'

registerServices({
  ...getProfileServiceOverride()
})
