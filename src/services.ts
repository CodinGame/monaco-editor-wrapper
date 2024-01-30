import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getDialogsServiceOverride from '@codingame/monaco-vscode-dialogs-service-override'
import getConfigurationServiceOverride, { IStoredWorkspace } from '@codingame/monaco-vscode-configuration-service-override'
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override'
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override'
import getAudioCueServiceOverride from '@codingame/monaco-vscode-audio-cue-service-override'
import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override'
import getSnippetServiceOverride from '@codingame/monaco-vscode-snippets-service-override'
import getAccessibilityServiceOverride from '@codingame/monaco-vscode-accessibility-service-override'
import getLanguageDetectionWorkerServiceOverride from '@codingame/monaco-vscode-language-detection-worker-service-override'
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override'
import getStorageServiceOverride from '@codingame/monaco-vscode-storage-service-override'
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override'
import getQuickAccessServiceOverride from '@codingame/monaco-vscode-quickaccess-service-override'
import getLogServiceOverride from '@codingame/monaco-vscode-log-service-override'
import getWorkingCopyServiceOverride from '@codingame/monaco-vscode-working-copy-service-override'
import { ILogService, LogLevel, StandaloneServices, initialize as initializeServices } from 'vscode/services'
import * as monaco from 'monaco-editor'
import { initFile } from '@codingame/monaco-vscode-files-service-override'
import EditorOpenHandlerRegistry from './tools/EditorOpenHandlerRegistry'
import 'vscode/localExtensionHost'

const editorOpenHandlerRegistry = new EditorOpenHandlerRegistry()

let _useGlobalPicker: boolean = false
export function setUseGlobalPicker (useGlobalPicker: boolean = true): void {
  _useGlobalPicker = useGlobalPicker
}

export function useGlobalPicker (): boolean {
  // should picker and keybindings be global or per-editor
  return _useGlobalPicker
}

let services: monaco.editor.IEditorOverrideServices = {
  ...getLogServiceOverride(),
  ...getExtensionServiceOverride(),
  ...getModelServiceOverride(),
  ...getDialogsServiceOverride(),
  ...getConfigurationServiceOverride(),
  ...getKeybindingsServiceOverride({
    shouldUseGlobalKeybindings () {
      return useGlobalPicker()
    }
  }),
  ...getTextmateServiceOverride(),
  ...getThemeServiceOverride(),
  ...getLanguagesServiceOverride(),
  ...getAudioCueServiceOverride(),
  ...getPreferencesServiceOverride(),
  ...getSnippetServiceOverride(),
  ...getLanguageDetectionWorkerServiceOverride(),
  ...getEditorServiceOverride((model, input, sideBySide) => {
    return editorOpenHandlerRegistry.openCodeEditor(model, input, sideBySide)
  }),
  ...getAccessibilityServiceOverride(),
  ...getStorageServiceOverride(),
  ...getLifecycleServiceOverride(),
  ...getQuickAccessServiceOverride({
    shouldUseGlobalPicker () {
      return useGlobalPicker()
    }
  }),
  ...getWorkingCopyServiceOverride()
}

export function registerServices (newServices: monaco.editor.IEditorOverrideServices): void {
  services = {
    ...services,
    ...newServices
  }
}

export async function initialize (): Promise<void> {
  // wait a short time for the services to be registered
  await new Promise(resolve => setTimeout(resolve, 0))

  const workspaceFile = monaco.Uri.file('/workspace.code-workspace')
  await initFile(workspaceFile, JSON.stringify(<IStoredWorkspace>{
    folders: [{
      path: '/tmp/project'
    }]
  }))
  await initializeServices(services, undefined, { workspaceProvider: { open: async () => false, workspace: { workspaceUri: workspaceFile }, trusted: true } })
  StandaloneServices.get(ILogService).setLevel(LogLevel.Off)
}

export {
  editorOpenHandlerRegistry
}
