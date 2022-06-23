// Inpired by https://github.com/microsoft/vscode/blob/94c9ea46838a9a619aeafb7e8afd1170c967bb55/src/vs/workbench/services/themes/common/tokenClassificationExtensionPoint.ts
import * as monaco from 'monaco-editor'
import extensions from '../extensions/extensions.json'

const tokenClassificationRegistry = monaco.extra.getTokenClassificationRegistry()

interface ITokenTypeExtensionPoint {
  id: string
  description: string
  superType?: string
}

interface ITokenModifierExtensionPoint {
  id: string
  description: string
}
interface ITokenStyleDefaultExtensionPoint {
  language?: string
  scopes: { [selector: string]: string[] }
}

for (const contribution of extensions.semanticTokenTypes as ITokenTypeExtensionPoint[]) {
  tokenClassificationRegistry.registerTokenType(contribution.id, contribution.description, contribution.superType)
}

for (const contribution of extensions.semanticTokenModifiers as ITokenModifierExtensionPoint[]) {
  tokenClassificationRegistry.registerTokenModifier(contribution.id, contribution.description)
}

for (const contribution of extensions.semanticTokenScopes as unknown as ITokenStyleDefaultExtensionPoint[]) {
  for (const selectorString in contribution.scopes) {
    const tmScopes = contribution.scopes[selectorString]!
    const selector = tokenClassificationRegistry.parseTokenSelector(selectorString, contribution.language)
    tokenClassificationRegistry.registerTokenStyleDefault(selector, { scopesToProbe: tmScopes.map(s => s.split(' ')) })
  }
}
