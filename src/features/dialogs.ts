import getDialogsServiceOverride from '@codingame/monaco-vscode-dialogs-service-override'
import { registerServices } from '../services'

registerServices({
  ...getDialogsServiceOverride()
})
