import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import * as monaco from 'monaco-editor'
// @ts-ignore
import typescriptGlobal from '@types/node/globals.d.ts'
// @ts-ignore
import typescriptConsole from '@types/node/console.d.ts'
// @ts-ignore
import typescriptProcess from '@types/node/process.d.ts'
import { registerWorkerLoader } from '../worker'

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

const compilerOptions: Parameters<typeof monaco.languages.typescript.typescriptDefaults.setCompilerOptions>[0] = {
  target: monaco.languages.typescript.ScriptTarget.ES2016,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  lib: ['es2020']
}

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions)
monaco.languages.typescript.typescriptDefaults.addExtraLib(global, 'global.d.ts')
monaco.languages.typescript.typescriptDefaults.addExtraLib(typescriptGlobal, 'node/globals.d.ts')
monaco.languages.typescript.typescriptDefaults.addExtraLib(typescriptConsole, 'node/console.d.ts')
monaco.languages.typescript.typescriptDefaults.addExtraLib(typescriptProcess, 'node/process.d.ts')

monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions)
monaco.languages.typescript.javascriptDefaults.addExtraLib(global, 'global.d.ts')
monaco.languages.typescript.javascriptDefaults.addExtraLib(typescriptGlobal, 'node/globals.d.ts')
monaco.languages.typescript.javascriptDefaults.addExtraLib(typescriptConsole, 'node/console.d.ts')
monaco.languages.typescript.javascriptDefaults.addExtraLib(typescriptProcess, 'node/process.d.ts')

const workerLoader = async () => (await import(/* webpackChunkName: "MonacoTypescriptWorker" */'monaco-editor/esm/vs/language/typescript/ts.worker?worker')).default
registerWorkerLoader('typescript', workerLoader)
registerWorkerLoader('javascript', workerLoader)
