import * as monaco from 'monaco-editor'
import './textMate'
import textMateLanguages from './extensions/languages.json'
import languageConfigurationLoader, { RawLanguageConfiguration } from './extensions/languageConfigurationLoader'
import './snippets'
import { addCustomFoldingMarkers } from '../hacks'

const customAliases: Partial<Record<string, string[]>> = {
  csharp: ['c#'],
  'objective-c': ['objectivec', 'objc'],
  python: ['datascience-python', 'python3'],
  r: ['datascience-r'],
  vb: ['vb.net'],
  javascriptreact: ['react'],
  javascript: ['vue', 'node'],
  typescript: ['angular'],
  sql: ['mysql'],
  postgres: ['postgresql', 'postgres', 'pg', 'postgre']
}

for (const [languageId, aliases] of Object.entries(customAliases)) {
  monaco.languages.register({
    id: languageId,
    aliases
  })
}

for (const textMateLanguage of textMateLanguages) {
  monaco.languages.register(textMateLanguage)
}

/**
 * Type is wrong
 * see https://github.com/microsoft/vscode/blob/cfad2543487c4a8e8f53b4451dbccdc1c2036f41/src/vs/workbench/contrib/codeEditor/browser/languageConfigurationExtensionPoint.ts#L381
 */
function parseLanguageConfiguration (config: RawLanguageConfiguration): monaco.extra.ILanguageConfiguration {
  const markers = config.folding?.markers
  return {
    ...config,
    folding: config.folding != null
      ? {
          ...config.folding,
          markers: (markers != null) ? { start: new RegExp(markers.start), end: new RegExp(markers.end) } : undefined
        }
      : undefined
  }
}

async function loadLanguageConfiguration (languageId: string) {
  const loader = languageConfigurationLoader[languageId]
  if (loader != null) {
    const configuration = await loader()
    monaco.extra.handleLanguageConfiguration(
      languageId,
      addCustomFoldingMarkers(parseLanguageConfiguration(configuration))
    )
  }
}

setTimeout(() => {
  // In a timeout so the service can be overriden
  const languageService = monaco.extra.StandaloneServices.get(monaco.languages.ILanguageService)
  languageService.onDidEncounterLanguage(async (languageId) => {
    if (languageId === 'plaintext') {
      return
    }

    loadLanguageConfiguration(languageId).catch(error => {
      monaco.errorHandler.onUnexpectedError(new Error(`Unable to load language configuration for language ${languageId}`, {
        cause: error
      }))
    })
  })
})

function getMonacoLanguage (languageOrModeId: string): string {
  const languageService = monaco.extra.StandaloneServices.get(monaco.languages.ILanguageService)
  const modeId = languageService.getLanguageIdByLanguageName(languageOrModeId.toLowerCase())
  if (modeId != null) {
    return modeId
  }
  if (languageService.isRegisteredLanguageId(languageOrModeId)) {
    return languageOrModeId
  }
  if (languageService.isRegisteredLanguageId(languageOrModeId.toLowerCase())) {
    return languageOrModeId.toLowerCase()
  }

  return 'plaintext'
}

async function loadLanguage (languageId: string): Promise<void> {
  await Promise.all([
    loadLanguageConfiguration(languageId)
  ])
}

export {
  getMonacoLanguage,
  loadLanguage
}
