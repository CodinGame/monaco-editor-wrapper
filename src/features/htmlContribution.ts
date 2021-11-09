import 'monaco-editor/esm/vs/language/html/monaco.contribution'
import { registerWorkerLoader } from '../worker'

const workerLoader = async () => (await import(/* webpackChunkName: "MonacoHtmlWorker" */'monaco-editor/esm/vs/language/html/html.worker?worker')).default
registerWorkerLoader('html', workerLoader)
registerWorkerLoader('handlebars', workerLoader)
registerWorkerLoader('razor', workerLoader)
