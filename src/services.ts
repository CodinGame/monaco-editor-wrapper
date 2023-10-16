import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getDialogsServiceOverride from '@codingame/monaco-vscode-dialogs-service-override'
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override'
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
import { ILogService, LogLevel, StandaloneServices, initialize as initializeServices } from 'vscode/services'
import { initialize as initializeExtensions } from 'vscode/extensions'
import * as monaco from 'monaco-editor'
import EditorOpenHandlerRegistry from './tools/EditorOpenHandlerRegistry'

const editorOpenHandlerRegistry = new EditorOpenHandlerRegistry()

function getExtensionWorkerConfig () {
  // Hack bundler Worker detection to get the worker url
  class Worker {
    constructor (public url: string | URL, public options?: WorkerOptions) {
    }
  }
  const fakeWorker = new Worker(new URL('vscode/workers/extensionHost.worker', import.meta.url))
  return {
    url: fakeWorker.url.toString(),
    options: fakeWorker.options
  }
}

export function useGlobalPicker (): boolean {
  // TODO should picker and keybindings be global or per-editor
  return false
}

let services: monaco.editor.IEditorOverrideServices = {
  ...getExtensionServiceOverride(getExtensionWorkerConfig()),
  ...getModelServiceOverride(),
  ...getDialogsServiceOverride(),
  ...getConfigurationServiceOverride(monaco.Uri.file('/tmp/project')),
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
  })
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

  await initializeServices(services)
  StandaloneServices.get(ILogService).setLevel(LogLevel.Off)

  await initializeExtensions()
}

export {
  editorOpenHandlerRegistry
}
