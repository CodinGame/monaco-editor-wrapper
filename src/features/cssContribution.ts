import 'monaco-editor/esm/vs/language/css/monaco.contribution'
import { registerWorkerLoader } from '../worker'

const workerLoader = async () => (await import(/* webpackChunkName: "MonacoHtmlWorker" */'monaco-editor/esm/vs/language/css/css.worker?worker')).default
registerWorkerLoader('css', workerLoader)
registerWorkerLoader('less', workerLoader)
registerWorkerLoader('scss', workerLoader)
