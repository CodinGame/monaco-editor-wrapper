import getWorkbenchServiceOverride from '@codingame/monaco-vscode-workbench-service-override'
import getQuickAccessServiceOverride from '@codingame/monaco-vscode-quickaccess-service-override'
import getMultiDiffEditorServiceOverride from '@codingame/monaco-vscode-multi-diff-editor-service-override'
import { registerServices, useGlobalPicker } from '../services'

import '@codingame/monaco-vscode-theme-seti-default-extension'
import '@codingame/monaco-vscode-media-preview-default-extension'
import '@codingame/monaco-vscode-markdown-language-features-default-extension'
import '@codingame/monaco-vscode-markdown-math-default-extension'
import '@codingame/monaco-vscode-configuration-editing-default-extension'

registerServices({
  ...getWorkbenchServiceOverride(),
  ...getMultiDiffEditorServiceOverride(),
  ...getQuickAccessServiceOverride({
    shouldUseGlobalPicker() {
      return useGlobalPicker()
    },
    isKeybindingConfigurationVisible() {
      return true
    }
  })
})
