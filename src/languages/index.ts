import * as monaco from 'monaco-editor'
import { createTextMateTokensProvider } from './textMate'
import textMateLanguages from './extensions/languages.json'
import { languageLoader as monarchLanguageLoader } from './monarch'

import './snippets'

const customAliases: Partial<Record<string, string[]>> = {
  csharp: ['c#'],
  'objective-c': ['objectivec', 'objc'],
  python: ['datascience-python', 'python3'],
  r: ['datascience-r'],
  vb: ['vb.net'],
  javascript: ['react', 'vue', 'node'],
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
  const textMateLanguage = textMateLanguages.find(rawLanguage => rawLanguage.id === languageId)
  monaco.languages.register({
    id: languageId,
    extensions: textMateLanguage?.extensions,
    filenames: textMateLanguage?.filenames,
    filenamePatterns: textMateLanguage?.filenamePatterns,
    firstLine: textMateLanguage?.firstLine,
    aliases: [...(textMateLanguage?.aliases ?? []), ...(customAliases[languageId] ?? [])],
    mimetypes: textMateLanguage?.mimetypes
  })
  if (textMateLanguage?.configuration != null) {
    monaco.extra.handleLanguageConfiguration(
      textMateLanguage.id,
      textMateLanguage.configuration as monaco.extra.ILanguageConfiguration
    )
  }
}

modeService.onDidEncounterLanguage(async (languageId) => {
  const textMateTokenProviderPromise = createTextMateTokensProvider(languageId)
  textMateTokenProviderPromise.catch(err => {
    const monarchLoader = monarchLanguageLoader[languageId]
    if (monarchLoader != null) {
      console.warn(`Failed to load TextMate grammar for language ${languageId}, fallback to monarch`, err)
      monaco.languages.setMonarchTokensProvider(languageId, monarchLoader().then(lang => lang.language))
    } else {
      console.error(`Failed to load TextMate grammar for language ${languageId} and no fallback monarch`, err)
    }
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
