import '@codingame/monaco-vscode-standalone-typescript-language-features'
import * as monaco from 'monaco-editor'
import {
  FileSystemProviderCapabilities,
  FileSystemProviderError,
  FileSystemProviderErrorCode,
  FileType,
  IFileSystemProviderWithFileReadWriteCapability,
  IStat,
  registerFileSystemOverlay
} from '@codingame/monaco-vscode-files-service-override'
import * as vscode from 'vscode'
import { registerWorkerLoader } from '../worker.js'
import { Worker } from '../tools/crossOriginWorker'

const global = `
declare global {
  /**
   * Read a line from stdin
   */
  function readline(): string;
  /**
   * Print a string to stdout
   * @deprecated Use console.log instead
   */
  function print(word: string): void;
}
// It needs to be a module
export {}
`

const compilerOptions: Parameters<
  typeof monaco.languages.typescript.typescriptDefaults.setCompilerOptions
>[0] = {
  target: monaco.languages.typescript.ScriptTarget.ES2016,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  lib: ['es2020']
}

class TypescriptWorkerTypeFileSystemProvider
  implements IFileSystemProviderWithFileReadWriteCapability
{
  capabilities =
    FileSystemProviderCapabilities.FileReadWrite |
    FileSystemProviderCapabilities.PathCaseSensitive |
    FileSystemProviderCapabilities.Readonly

  constructor(private getWorker: () => Promise<monaco.languages.typescript.TypeScriptWorker>) {}

  private async getExtraLib(resource: monaco.Uri) {
    const content = await (await this.getWorker()).getScriptText(resource.path.slice(1))

    return content
  }

  async readFile(resource: monaco.Uri): Promise<Uint8Array> {
    const file = await this.getExtraLib(resource)
    if (file != null) {
      return new TextEncoder().encode(file)
    }
    throw FileSystemProviderError.create('file not found', FileSystemProviderErrorCode.FileNotFound)
  }

  async stat(resource: monaco.Uri): Promise<IStat> {
    const file = await this.getExtraLib(resource)
    if (file != null) {
      return {
        type: FileType.File,
        size: file.length,
        mtime: 0,
        ctime: 0
      }
    }
    throw FileSystemProviderError.create('file not found', FileSystemProviderErrorCode.FileNotFound)
  }

  async writeFile(): Promise<void> {
    throw FileSystemProviderError.create('not allowed', FileSystemProviderErrorCode.NoPermissions)
  }

  onDidChangeCapabilities = new vscode.EventEmitter<never>().event
  onDidChangeFile = new vscode.EventEmitter<never>().event
  watch(): monaco.IDisposable {
    return {
      dispose() {}
    }
  }

  async mkdir(): Promise<void> {
    throw FileSystemProviderError.create('Not allowed', FileSystemProviderErrorCode.NoPermissions)
  }

  async readdir() {
    return []
  }

  async delete(): Promise<void> {
    throw FileSystemProviderError.create('Not allowed', FileSystemProviderErrorCode.NoPermissions)
  }

  async rename(): Promise<void> {
    throw FileSystemProviderError.create('Not allowed', FileSystemProviderErrorCode.NoPermissions)
  }
}

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions)
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions)
monaco.languages.typescript.typescriptDefaults.addExtraLib(global, 'global.d.ts')
monaco.languages.typescript.javascriptDefaults.addExtraLib(global, 'global.d.ts')

monaco.languages.onLanguage('typescript', async () => {
  registerFileSystemOverlay(
    -1,
    new TypescriptWorkerTypeFileSystemProvider(async () =>
      (await monaco.languages.typescript.getTypeScriptWorker())()
    )
  )

  const types = (await import('types:../../node_modules/typescript-worker-node-types')).default

  for (const [file, content] of Object.entries(types)) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(content, `node/${file}`)
  }
})
monaco.languages.onLanguage('javascript', async () => {
  registerFileSystemOverlay(
    -1,
    new TypescriptWorkerTypeFileSystemProvider(async () =>
      (await monaco.languages.typescript.getJavaScriptWorker())()
    )
  )

  const types = (await import('types:../../node_modules/typescript-worker-node-types')).default

  for (const [file, content] of Object.entries(types)) {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(content, `node/${file}`)
  }
})

const workerLoader = () =>
  new Worker(
    new URL(
      '@codingame/monaco-vscode-standalone-typescript-language-features/worker',
      import.meta.url
    ),
    { type: 'module' }
  )
registerWorkerLoader('typescript', workerLoader)
registerWorkerLoader('javascript', workerLoader)
