import * as monaco from 'monaco-editor'
import { defineVSCodeTheme } from './registry'
import './semanticHighlight'
import { IVSCodeTheme } from './tools'
import defaultThemes from '../languages/extensions/themes.json'
import themeLoader from '../languages/extensions/themeLoader'

const DEFAULT_VSCODE_THEMES: Partial<Record<string, monaco.editor.BuiltinTheme>> = {
  'Default Light+': 'vs',
  'Default Dark+': 'vs-dark',
  'Default High Contrast': 'hc-black'
  // 'Default High Contrast Light': 'hc-white' // FIXME: Uncomment me with monaco 0.34 which support hc-light theme
}
// FIXME: Remove me with monaco 0.34 which support hc-light theme
const VSCODE_THEME_BLACKLIST = new Set(['Default High Contrast Light'])

function generateMonacoThemeId (vsCodeThemeId: string) {
  return vsCodeThemeId.replace(/ /g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '')
}

interface VSCodeTheme extends Omit<monaco.extra.IThemeExtensionPoint, '_watch'> {
  extension: string
}

for (const themeExtensionPoint of (defaultThemes as VSCodeTheme[])) {
  if (VSCODE_THEME_BLACKLIST.has(themeExtensionPoint.id)) {
    continue
  }
  const loader = async (uri?: monaco.Uri): Promise<IVSCodeTheme> => {
    return themeLoader[`${themeExtensionPoint.extension}:${uri?.path ?? themeExtensionPoint.path.slice(1)}`]!()
  }

  const monacoThemeId = DEFAULT_VSCODE_THEMES[themeExtensionPoint.id] ?? generateMonacoThemeId(themeExtensionPoint.id)
  defineVSCodeTheme(monacoThemeId, loader, themeExtensionPoint, {
    extensionName: themeExtensionPoint.extension,
    extensionIsBuiltin: true
  }).catch((error: Error) => {
    monaco.errorHandler.onUnexpectedError(new Error(`Unable to define "${themeExtensionPoint.id}" vscode theme`, {
      cause: error
    }))
  })
}

export {
  defineVSCodeTheme
}
