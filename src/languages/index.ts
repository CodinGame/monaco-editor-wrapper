import * as monaco from 'monaco-editor'
import { setLanguages } from 'vscode/service-override/languages'
import { setLanguageConfiguration } from 'vscode/service-override/languageConfiguration'
import { StandaloneServices, ILanguageService } from 'vscode/services'
import './textMate'
import textMateLanguages from './extensions/languages.json'
import languageConfigurationLoader from './extensions/languageConfigurationLoader'
import './snippets'
import { addCustomFoldingMarkers, ILanguageConfiguration } from '../hacks'

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

setLanguages(textMateLanguages.map(language => ({
  ...language,
  configuration: languageConfigurationLoader[language.id] != null ? `./${language.id}-configuration.json` : undefined
})))

for (const [languageId, aliases] of Object.entries(customAliases)) {
  monaco.languages.register({
    id: languageId,
    aliases
  })
}

for (const textMateLanguage of textMateLanguages) {
  const configurationLoader = languageConfigurationLoader[textMateLanguage.id]
  if (configurationLoader != null) {
    setLanguageConfiguration(`/${textMateLanguage.id}-configuration.json`, async () => JSON.stringify(addCustomFoldingMarkers((await configurationLoader()) as ILanguageConfiguration)))
  }
}

function getMonacoLanguage (languageOrModeId: string): string {
  const languageService = StandaloneServices.get(ILanguageService)
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
  StandaloneServices.get(ILanguageService).createById(languageId)
}

export {
  getMonacoLanguage,
  loadLanguage
}
