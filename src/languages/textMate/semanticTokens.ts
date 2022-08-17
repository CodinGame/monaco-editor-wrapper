import { setTokenModifiers, setTokenTypes, setTokenStyleDefaults, ITokenTypeExtensionPoint, ITokenModifierExtensionPoint, ITokenStyleDefaultExtensionPoint } from 'vscode/service-override/tokenClassification'
import extensions from '../extensions/extensions.json'

setTokenTypes(extensions.semanticTokenTypes as ITokenTypeExtensionPoint[])
setTokenModifiers(extensions.semanticTokenModifiers as ITokenModifierExtensionPoint[])
setTokenStyleDefaults(extensions.semanticTokenScopes as unknown as ITokenStyleDefaultExtensionPoint[])
