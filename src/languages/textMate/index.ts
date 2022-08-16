import { setGrammars, ITMSyntaxExtensionPoint } from 'vscode/service-override/textmate'
import rawGrammars from '../extensions/grammars.json'
import grammarLoader from '../extensions/grammarLoader'
import './semanticTokens'

setGrammars((rawGrammars as unknown as Omit<ITMSyntaxExtensionPoint, 'path'>[]).map(grammar => ({
  ...grammar,
  path: grammar.scopeName + '.json'
})), async (grammar) => JSON.stringify(await grammarLoader[grammar.scopeName]!()))
