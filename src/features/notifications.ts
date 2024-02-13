import getNotificationsServiceOverride from '@codingame/monaco-vscode-notifications-service-override'
import { registerServices } from '../services'

registerServices({
  ...getNotificationsServiceOverride()
})
