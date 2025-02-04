import * as monaco from 'monaco-editor'
import { StandaloneServices, ILanguageService, getService } from '@codingame/monaco-vscode-api'

const customAliases: Partial<Record<string, string[]>> = {
  csharp: ['c#'],
  'objective-c': ['objectivec', 'objc'],
  python: ['datascience-python', 'python3'],
  r: ['datascience-r'],
  vb: ['vb.net'],
  javascriptreact: ['react'],
  javascript: ['node'],
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
  (await getService(ILanguageService)).createById(languageId)
}

export {
  getMonacoLanguage,
  loadLanguage
}
