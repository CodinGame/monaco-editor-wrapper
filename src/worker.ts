import { Worker } from './tools/crossOriginWorker'
export type WorkerLoader = () => Worker

const workerLoaders: Partial<Record<string, WorkerLoader>> = {
  TextEditorWorker: () =>
    new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
      type: 'module'
    }),
  TextMateWorker: () =>
    new Worker(
      new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url),
      { type: 'module' }
    ),
  LanguageDetectionWorker: () =>
    new Worker(
      new URL(
        '@codingame/monaco-vscode-language-detection-worker-service-override/worker',
        import.meta.url
      ),
      { type: 'module' }
    )
}

export function registerWorkerLoader(label: string, workerLoader: WorkerLoader): void {
  workerLoaders[label] = workerLoader
}

// Do not use monaco-editor-webpack-plugin because it doesn't handle properly cross origin workers
window.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    const workerFactory = workerLoaders[label]
    if (workerFactory != null) {
      return workerFactory()
    }
    throw new Error(`Unimplemented worker ${label} (${moduleId})`)
  }
}
