import * as monaco from 'monaco-editor'
import onigFile from 'vscode-oniguruma/release/onig.wasm'
import CGTMGrammarFactory from './CGTMGrammarFactory'
import CGTMTokenizationSupport from './CGTMTokenizationSupport'
import rawGrammars from '../extensions/grammars.json'
import grammarLoader from '../extensions/grammarLoader'

function createGrammarFactory (): CGTMGrammarFactory {
  const modeService = monaco.editor.StaticServices.modeService.get()
  const parsedGrammars = (rawGrammars as unknown as Omit<monaco.extra.ITMSyntaxExtensionPoint, 'path'>[])
    .map(grammar => ({
      ...monaco.extra.parseTextMateGrammar(grammar as monaco.extra.ITMSyntaxExtensionPoint, modeService),
      location: monaco.Uri.file(grammar.scopeName + '.json')
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

const modeService = monaco.editor.StaticServices.modeService.get()
export async function createTextMateTokensProvider (languageId: string): Promise<monaco.languages.ITokenizationSupport> {
  const grammarFactory = getOrCreateGrammarFactory()
  const encodedLanguageId = modeService.languageIdCodec.encodeLanguageId(languageId)
  const { grammar, initialState, containsEmbeddedLanguages } = await grammarFactory.createGrammar(languageId, encodedLanguageId)
  if (grammar == null) {
    throw new Error(`No grammar found for language ${languageId}`)
  }
  const tokenization = new monaco.extra.TMTokenization(grammar, initialState, containsEmbeddedLanguages)
  tokenization.onDidEncounterLanguage((encodedLanguageId) => {
    modeService.triggerMode(modeService.languageIdCodec.decodeLanguageId(encodedLanguageId))
  })
  return new CGTMTokenizationSupport(languageId, encodedLanguageId, tokenization, grammar)
}
