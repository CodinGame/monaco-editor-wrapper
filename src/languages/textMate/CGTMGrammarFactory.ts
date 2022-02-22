import * as vscodeTextmate from 'vscode-textmate'
import { loadWASM, createOnigScanner, createOnigString } from 'vscode-oniguruma'
import * as monaco from 'monaco-editor'
import { getThemeData } from '../../theme/registry'

export type GrammarLoader = Partial<Record<string, () => Promise<object>>>

let onigLibPromise: Promise<vscodeTextmate.IOnigLib> | null = null
const getOnigLib = async (binaryUrl: string): Promise<vscodeTextmate.IOnigLib> => {
  try {
    const response = await fetch(binaryUrl)
    const bytes = await response.arrayBuffer()
    await loadWASM(bytes)
    return {
      createOnigScanner,
      createOnigString
    }
  } catch (error) {
    console.error('Unable to load wasm', error)
    throw error
  }
}
const memoizedGetOnigLib = async (binaryUrl: string): Promise<vscodeTextmate.IOnigLib> => {
  if (onigLibPromise == null) {
    onigLibPromise = getOnigLib(binaryUrl)
  }
  return onigLibPromise
}

export default class CGTMGrammarFactory extends monaco.extra.TMGrammarFactory {
  constructor (grammarDefinitions: monaco.extra.IValidGrammarDefinition[], scopeGrammarLoader: GrammarLoader, onigasmBinaryUrl: string) {
    const grammarFactoryHost: monaco.extra.ITMGrammarFactoryHost = {
      // eslint-disable-next-line no-console
      logTrace: console.debug,
      logError: console.error,
      async readFile (resource: monaco.Uri): Promise<string> {
        const scopeName = resource.path.slice(resource.path.lastIndexOf('/') + 1, -'.json'.length)
        const grammarLoader = scopeGrammarLoader[scopeName]
        if (grammarLoader == null) {
          throw new Error(`No grammar found for scope ${scopeName}`)
        }
        const json = await grammarLoader()
        return JSON.stringify(json)
      }
    }

    super(grammarFactoryHost, grammarDefinitions, vscodeTextmate, memoizedGetOnigLib(onigasmBinaryUrl))

    const updateTheme = (theme: monaco.editor.IColorTheme) => {
      const themeData = getThemeData((theme as monaco.editor.IStandaloneTheme).themeName)
      if (themeData == null) {
        return
      }
      this.setTheme({
        name: themeData.label,
        settings: themeData.tokenColors
      }, themeData.tokenColorMap)
    }
    const standaloneThemeService = monaco.extra.StandaloneServices.get(monaco.editor.IStandaloneThemeService)
    this._register(standaloneThemeService.onDidColorThemeChange(updateTheme))
    updateTheme(standaloneThemeService.getColorTheme())
  }
}
