import getExtensionGalleryServiceOverride from '@codingame/monaco-vscode-extension-gallery-service-override'
import { registerServices } from '../services'

registerServices({
  ...getExtensionGalleryServiceOverride()
})
