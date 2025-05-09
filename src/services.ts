import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getDialogsServiceOverride from '@codingame/monaco-vscode-dialogs-service-override'
import getConfigurationServiceOverride, {
  IStoredWorkspace
} from '@codingame/monaco-vscode-configuration-service-override'
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override'
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override'
import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override'
import getSnippetServiceOverride from '@codingame/monaco-vscode-snippets-service-override'
import getAccessibilityServiceOverride from '@codingame/monaco-vscode-accessibility-service-override'
import getLanguageDetectionWorkerServiceOverride from '@codingame/monaco-vscode-language-detection-worker-service-override'
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override'
import getStorageServiceOverride from '@codingame/monaco-vscode-storage-service-override'
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override'
import getQuickAccessServiceOverride from '@codingame/monaco-vscode-quickaccess-service-override'
import getLogServiceOverride from '@codingame/monaco-vscode-log-service-override'
import getEmmetServiceOverride from '@codingame/monaco-vscode-emmet-service-override'
import getWorkingCopyServiceOverride from '@codingame/monaco-vscode-working-copy-service-override'
import { initialize as initializeServices } from '@codingame/monaco-vscode-api'
import * as monaco from 'monaco-editor'
import {
  RegisteredFile,
  RegisteredFileSystemProvider,
  registerCustomProvider,
  OverlayFileSystemProvider,
  EmptyFileSystemProvider,
  RegisteredMemoryFile
} from '@codingame/monaco-vscode-files-service-override'
import { IWorkbenchConstructionOptions, IWorkspaceProvider } from '@codingame/monaco-vscode-api'
import EditorOpenHandlerRegistry from './tools/EditorOpenHandlerRegistry'
import { whenReady as whenExtensionsReady } from './extensions'
import 'vscode/localExtensionHost'
import './customExtensions'
import './languages'
import './worker'

// Overwrite the default overlay filesystem to remove the InMemoryFileSystemProvider fallback
const overlayFileSystem = new OverlayFileSystemProvider()
overlayFileSystem.register(0, new EmptyFileSystemProvider())

const defaultFilesystemProvider = new RegisteredFileSystemProvider(false)
overlayFileSystem.register(1, defaultFilesystemProvider)

registerCustomProvider('file', overlayFileSystem)

export function registerFile(file: RegisteredFile): monaco.IDisposable {
  return defaultFilesystemProvider.registerFile(file)
}

const editorOpenHandlerRegistry = new EditorOpenHandlerRegistry()

let _useGlobalPicker: boolean | (() => boolean) = false
export function setUseGlobalPicker(useGlobalPicker: boolean | (() => boolean) = true): void {
  _useGlobalPicker = useGlobalPicker
}

export function useGlobalPicker(): boolean {
  // should picker and keybindings be global or per-editor
  return typeof _useGlobalPicker === 'function' ? _useGlobalPicker() : _useGlobalPicker
}

let services: monaco.editor.IEditorOverrideServices = {
  ...getLogServiceOverride(),
  ...getExtensionServiceOverride(),
  ...getModelServiceOverride(),
  ...getDialogsServiceOverride(),
  ...getConfigurationServiceOverride(),
  ...getKeybindingsServiceOverride(),
  ...getTextmateServiceOverride(),
  ...getThemeServiceOverride(),
  ...getLanguagesServiceOverride(),
  ...getPreferencesServiceOverride(),
  ...getSnippetServiceOverride(),
  ...getLanguageDetectionWorkerServiceOverride(),
  ...getEditorServiceOverride((model, input, sideBySide) => {
    return editorOpenHandlerRegistry.openCodeEditor(model, input, sideBySide)
  }),
  ...getAccessibilityServiceOverride(),
  ...getStorageServiceOverride({
    fallbackOverride: {
      'workbench.activity.showAccounts': false
    }
  }),
  ...getLifecycleServiceOverride(),
  ...getQuickAccessServiceOverride({
    shouldUseGlobalPicker() {
      return useGlobalPicker()
    }
  }),
  ...getEmmetServiceOverride(),
  ...getWorkingCopyServiceOverride({
    storage: null
  })
}

export function registerServices(newServices: monaco.editor.IEditorOverrideServices): void {
  services = {
    ...services,
    ...newServices
  }
}

export function generateAndInitializeWorkspace(
  workspaceFile = monaco.Uri.file('/workspace.code-workspace'),
  label?: string
): IWorkspaceProvider {
  registerFile(
    new RegisteredMemoryFile(
      workspaceFile,
      JSON.stringify(<IStoredWorkspace>{
        folders: [
          {
            path: '/tmp/project'
          }
        ]
      })
    )
  )
  return {
    open: async () => false,
    workspace: {
      workspaceUri: workspaceFile,
      label
    },
    trusted: true
  }
}

let initialized = false
let setInitialized: () => void | undefined
export const initializePromise = new Promise<void>((resolve) => {
  setInitialized = resolve
})
void initializePromise.then(() => {
  initialized = true
})

export function isInitialized(): boolean {
  return initialized
}

export interface InitializeOptions {
  container?: HTMLElement
  // Should additional extension be registered? (it's mostly additional languages, registered from marketplace extensions after removing everything else)
  registerAdditionalExtensions?: boolean
}

export async function initialize(
  constructionOptions: IWorkbenchConstructionOptions = {},
  { container, registerAdditionalExtensions = true }: InitializeOptions = {}
): Promise<void> {
  if (constructionOptions.workspaceProvider == null) {
    constructionOptions = {
      ...constructionOptions,
      workspaceProvider: generateAndInitializeWorkspace()
    }
  }

  await initializeServices(services, container, constructionOptions, {
    userHome: monaco.Uri.file('/')
  })

  if (registerAdditionalExtensions) {
    const { whenReady } = await import('./additionalExtensions.js')
    await whenReady()
  }

  await whenExtensionsReady()

  setInitialized()
}

export { editorOpenHandlerRegistry }
