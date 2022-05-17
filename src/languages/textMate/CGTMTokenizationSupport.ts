import * as monaco from 'monaco-editor'
import { IGrammar, IToken, StackElement } from 'vscode-textmate'

function toMonacoToken (token: IToken) {
  return {
    ...token,
    scopes: token.scopes.join(', ')
  }
}

export default class CGTMTokenizationSupport extends monaco.extra.TMTokenizationSupportWithLineLimit {
  constructor (
    private languageId: string,
    encodedLanguageId: monaco.languages.LanguageId,
    actual: monaco.extra.TMTokenization,
    private grammar: IGrammar
  ) {
    super(languageId, encodedLanguageId, actual, monaco.extra.StandaloneServices.get(monaco.extra.IConfigurationService))
  }

  // To make "inspect tokens" work, default impl is `throw new Error('Not supported!');`
  override tokenize (line: string, hasEOL: boolean, state: monaco.languages.IState): monaco.TokenizationResult {
    return monaco.languages.adaptTokenize(this.languageId, {
      tokenize: (line: string, state: monaco.languages.IState) => {
        const actualResult = this.grammar.tokenizeLine(line, state as StackElement)
        return {
          tokens: actualResult.tokens.map(toMonacoToken),
          endState: actualResult.ruleStack
        }
      }
    }, line, state)
  }
}
