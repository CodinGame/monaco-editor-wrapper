import * as monaco from 'monaco-editor'
import onigFile from 'vscode-oniguruma/release/onig.wasm'
import { IGrammar, StackElement, IToken } from 'vscode-textmate'
import CGTMGrammarFactory from './CGTMGrammarFactory'
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

function toMonacoToken (token: IToken) {
  return {
    ...token,
    scopes: token.scopes.join(', ')
  }
}

class CGTMTokenizationSupport extends monaco.extra.TMTokenizationSupport {
  constructor (
    private languageId: string,
    encodedLanguageId: monaco.languages.LanguageId,
    actual: monaco.extra.TMTokenization,
    private grammar: IGrammar
  ) {
    super(languageId, encodedLanguageId, actual, monaco.editor.StaticServices.configurationService.get())
  }

  // To make "inspect tokens" work, default impl is `throw new Error('Not supported!');`
  tokenize (line: string, hasEOL: boolean, state: monaco.languages.IState, offsetDelta: number): monaco.TokenizationResult {
    return monaco.languages.adaptTokenize(this.languageId, {
      tokenize: (line: string, state: monaco.languages.IState) => {
        const actualResult = this.grammar.tokenizeLine(line, state as StackElement)
        return {
          tokens: actualResult.tokens.map(toMonacoToken),
          endState: actualResult.ruleStack
        }
      }
    }, line, state, offsetDelta)
  }
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
