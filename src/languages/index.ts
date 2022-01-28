import * as monaco from 'monaco-editor'
import { createTextMateTokensProvider } from './textMate'
import textMateLanguages from './extensions/languages.json'
import { languageLoader as monarchLanguageLoader } from './monarch'
import configurationLoader from './extensions/configurationLoader'
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

const modeService = monaco.editor.StaticServices.modeService.get()
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
}
type ConfigurationLoader = Partial<Record<string, () => Promise<Record<string, monaco.extra.ILanguageConfiguration>>>>

modeService.onDidEncounterLanguage(async (languageId) => {
  if (languageId === 'plaintext') {
    return
  }

  const loader = (configurationLoader as unknown as ConfigurationLoader)[languageId]
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

  const textMateTokenProviderPromise = createTextMateTokensProvider(languageId).catch(err => {
    const monarchLoader = monarchLanguageLoader[languageId]
    if (monarchLoader != null) {
      console.warn(`Failed to load TextMate grammar for language ${languageId}, fallback to monarch`, err)
      monaco.languages.setMonarchTokensProvider(languageId, monarchLoader().then(lang => lang.language))
    } else {
      console.warn(`Failed to load TextMate grammar for language ${languageId} and no fallback monarch`, err)
    }
    return null
  })
  monaco.languages.setTokenizationSupport(languageId, textMateTokenProviderPromise)
})

function getMonacoLanguage (languageOrModeId: string): string {
  const modeId = modeService.getModeIdForLanguageName(languageOrModeId.toLowerCase())
  if (modeId != null) {
    return modeId
  }
  if (modeService.isRegisteredMode(languageOrModeId)) {
    return languageOrModeId
  }
  if (modeService.isRegisteredMode(languageOrModeId.toLowerCase())) {
    return languageOrModeId.toLowerCase()
  }

  return 'plaintext'
}

export {
  getMonacoLanguage
}
