import * as monaco from 'monaco-editor'
import { createTextMateTokensProvider } from './textMate'
import textMateLanguages from './extensions/languages.json'
import { languageLoader as monarchLanguageLoader } from './monarch'
import languageConfigurationLoader from './extensions/languageConfigurationLoader'
import './snippets'

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

const languageService = monaco.extra.StandaloneServices.get(monaco.languages.ILanguageService)
const languagesIds = Array.from(new Set([
  ...Object.keys(monarchLanguageLoader),
  ...textMateLanguages.map(rawLanguage => rawLanguage.id)
]))

for (const languageId of languagesIds) {
  const textMateLanguage: monaco.languages.ILanguageExtensionPoint | undefined = textMateLanguages.find(rawLanguage => rawLanguage.id === languageId)
  monaco.languages.register({
    id: languageId,
    extensions: textMateLanguage?.extensions,
    filenames: textMateLanguage?.filenames,
    filenamePatterns: textMateLanguage?.filenamePatterns,
    firstLine: textMateLanguage?.firstLine,
    aliases: [...(textMateLanguage?.aliases ?? []), ...(customAliases[languageId] ?? [])],
    mimetypes: textMateLanguage?.mimetypes
  })

  monaco.languages.setTokenizationSupportFactory(languageId, {
    createTokenizationSupport: async () => {
      return createTextMateTokensProvider(languageId).catch(err => {
        const monarchLoader = monarchLanguageLoader[languageId]
        if (monarchLoader != null) {
          console.warn(`Failed to load TextMate grammar for language ${languageId}, fallback to monarch`, err)
          monaco.languages.setMonarchTokensProvider(languageId, monarchLoader().then(lang => lang.language))
        } else {
          console.warn(`Failed to load TextMate grammar for language ${languageId} and no fallback monarch`, err)
        }
        return null
      })
    }
  })
}

modeService.onDidEncounterLanguage(async (languageId) => {
  if (languageId === 'plaintext') {
    return
  }

  const loader = languageConfigurationLoader[languageId]
  if (loader != null) {
    loader().then((configuration) => {
      monaco.extra.handleLanguageConfiguration(
        languageId,
        configuration
      )
    }).catch(error => {
      console.error('Unable to load language configuration', error)
    })
  }
})

function getMonacoLanguage (languageOrModeId: string): string {
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

export {
  getMonacoLanguage
}
