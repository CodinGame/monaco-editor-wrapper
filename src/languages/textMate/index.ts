import * as monaco from 'monaco-editor'
import onigFile from 'vscode-oniguruma/release/onig.wasm'
import CGTMGrammarFactory from './CGTMGrammarFactory'
import CGTMTokenizationSupport from './CGTMTokenizationSupport'
import rawGrammars from '../extensions/grammars.json'
import grammarLoader from '../extensions/grammarLoader'
import './semanticTokens'

function createGrammarFactory (): CGTMGrammarFactory {
  const languageService = monaco.extra.StandaloneServices.get(monaco.languages.ILanguageService)
  const parsedGrammars = (rawGrammars as unknown as Omit<monaco.extra.ITMSyntaxExtensionPoint, 'path'>[])
    .map(grammar => ({
      ...monaco.extra.parseTextMateGrammar(grammar as monaco.extra.ITMSyntaxExtensionPoint, languageService),
      location: monaco.Uri.from({
        scheme: 'browser',
        path: grammar.scopeName + '.json'
      })
    }))

  return new CGTMGrammarFactory(
    parsedGrammars,
    grammarLoader,
    onigFile
  )
}

let textMateGrammarFactory: CGTMGrammarFactory | null = null
function getOrCreateGrammarFactory (): CGTMGrammarFactory {
  if (textMateGrammarFactory == null) {
    textMateGrammarFactory = createGrammarFactory()
  }
  return textMateGrammarFactory
}

async function createTextMateTokensProvider (languageId: string): Promise<monaco.languages.ITokenizationSupport | null> {
  const languageService = monaco.extra.StandaloneServices.get(monaco.languages.ILanguageService)
  const grammarFactory = getOrCreateGrammarFactory()
  const encodedLanguageId = languageService.languageIdCodec.encodeLanguageId(languageId)
  if (!grammarFactory.has(languageId)) {
    return null
  }
  const { grammar, initialState, containsEmbeddedLanguages } = await grammarFactory.createGrammar(languageId, encodedLanguageId)
  if (grammar == null) {
    return null
  }
  const tokenization = new monaco.extra.TMTokenization(grammar, initialState, containsEmbeddedLanguages)
  tokenization.onDidEncounterLanguage((encodedLanguageId) => {
    // Force monaco to load this language and trigger the global `onDidEncounterLanguage`
    languageService.createById(languageService.languageIdCodec.decodeLanguageId(encodedLanguageId))
  })
  return new CGTMTokenizationSupport(languageId, encodedLanguageId, tokenization, grammar)
}

const tokenizationSupports = new Map<string, Promise<monaco.languages.ITokenizationSupport | null>>()

export function getOrCreateTextMateTokensProvider (languageId: string): Promise<monaco.languages.ITokenizationSupport | null> {
  let tokenizationSupportPromise = tokenizationSupports.get(languageId)
  if (tokenizationSupportPromise == null) {
    tokenizationSupportPromise = createTextMateTokensProvider(languageId)
    tokenizationSupports.set(languageId, tokenizationSupportPromise)
  }
  return tokenizationSupportPromise
}
