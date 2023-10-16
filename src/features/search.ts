import getSearchServiceOverride from '@codingame/monaco-vscode-search-service-override'
import { registerServices } from '../services'

import '@codingame/monaco-vscode-search-result-default-extension'

registerServices({
  ...getSearchServiceOverride()
})
