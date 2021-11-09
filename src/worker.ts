import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
interface WrappedWorker {
  new (): Worker
}

export type WorkerLoader = () => WrappedWorker | Promise<WrappedWorker>

const workerLoaders: Partial<Record<string, WorkerLoader>> = {
  editorWorkerService: () => EditorWorker
}
export function registerWorkerLoader (label: string, workerLoader: WorkerLoader): void {
  workerLoaders[label] = workerLoader
}

// Do not use monaco-editor-webpack-plugin because it doesn't handle properly cross origin workers
window.MonacoEnvironment = {
  getWorker: async function (moduleId, label) {
    const workerFactory = workerLoaders[label]
    if (workerFactory != null) {
      const Worker = await workerFactory()
      return new Worker()
    }
    throw new Error(`Unimplemented worker ${label} (${moduleId})`)
  }
}
