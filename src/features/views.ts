import getViewsServiceOverride from '@codingame/monaco-vscode-views-service-override'
import getStatusBarServiceOverride from '@codingame/monaco-vscode-view-status-bar-service-override'
import getQuickAccessServiceOverride from '@codingame/monaco-vscode-quickaccess-service-override'
import { editorOpenHandlerRegistry, registerServices, useGlobalPicker } from '../services'

import '@codingame/monaco-vscode-theme-seti-default-extension'
import '@codingame/monaco-vscode-media-preview-default-extension'
import '@codingame/monaco-vscode-markdown-language-features-default-extension'
import '@codingame/monaco-vscode-markdown-math-default-extension'
import '@codingame/monaco-vscode-configuration-editing-default-extension'

registerServices({
  ...getViewsServiceOverride((model, input, sideBySide) => {
    return editorOpenHandlerRegistry.openCodeEditor(model, input, sideBySide)
  }),
  ...getStatusBarServiceOverride(),
  ...getQuickAccessServiceOverride({
    shouldUseGlobalPicker () {
      return useGlobalPicker()
    },
    isKeybindingConfigurationVisible () {
      return true
    }
  })
})
