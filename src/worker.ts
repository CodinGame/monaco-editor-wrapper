import { Worker } from './tools/FakeWorker'

const workers: Partial<Record<string, Worker>> = {
  editorWorkerService: new Worker(
    new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
    {
      type: 'module'
    }
  ),
  TextMateWorker: new Worker(
    new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url),
    { type: 'module' }
  ),
  LanguageDetectionWorker: new Worker(
    new URL(
      '@codingame/monaco-vscode-language-detection-worker-service-override/worker',
      import.meta.url
    ),
    { type: 'module' }
  )
}

export function registerWorker(label: string, worker: Worker): void {
  workers[label] = worker
}

// Do not use monaco-editor-webpack-plugin because it doesn't handle properly cross origin workers
window.MonacoEnvironment = {
  getWorkerUrl(moduleId, label) {
    const worker = workers[label]
    if (worker != null) {
      return worker.url.toString()
    }
    throw new Error(`Unimplemented worker ${label} (${moduleId})`)
  },
  getWorkerOptions(moduleId, label) {
    const worker = workers[label]
    if (worker != null) {
      return worker.options
    }
    throw new Error(`Unimplemented worker ${label} (${moduleId})`)
  }
}
