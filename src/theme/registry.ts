import * as monaco from 'monaco-editor'
import { convertTheme, IVSCodeTheme } from './tools'

const vscodeThemeData = new Map<string, monaco.extra.ColorThemeData>()

const darkCustomColors: monaco.extra.IThemeScopedColorCustomizations = {
  'statusBar.background': '#252e38',
  'statusBar.foreground': '#ffffff',
  'statusBar.border': '#41454a'
}
const lightCustomColors: monaco.extra.IThemeScopedColorCustomizations = {
  'statusBar.background': '#ffffff',
  'statusBar.foreground': '#20252a',
  'statusBar.border': '#dadada'
}
const customColors: monaco.extra.IColorCustomizations = {
  '[Visual Studio Dark]': darkCustomColors,
  '[Default Dark+]': darkCustomColors,
  '[Default High Contrast]': darkCustomColors,
  '[Visual Studio Light]': lightCustomColors,
  '[Default Light+]': lightCustomColors,
  '[Default High Contrast Light]': lightCustomColors
}

const customTokenColors: monaco.extra.ITokenColorCustomizations = {
}
const customTokenColor: monaco.extra.ISemanticTokenColorCustomizations = {
  rules: {
    '*.static': {
      fontStyle: 'italic'
    },
    '*.final.static': {
      fontStyle: 'italic bold'
    },
    '*.readonly': {
      fontStyle: 'bold'
    },
    '*.deprecated': {
      fontStyle: 'strikethrough'
    }
  }
}

export interface Theme {
  id: string
  label: string
}

const themes: Theme[] = []
export async function defineVSCodeTheme (
  id: string,
  vscodeThemeLoader: (uri?: monaco.Uri) => Promise<IVSCodeTheme>,
  themeExtensionPoint?: Partial<monaco.extra.IThemeExtensionPoint>,
  extensionData?: Partial<monaco.extra.ExtensionData>
): Promise<void> {
  const path = `/theme-${id}.json`
  // Do not use `file` scheme or monaco will replace `/` by `\` on windows
  const rootUri = monaco.Uri.from({
    scheme: 'browser',
    path: themeExtensionPoint?.path?.slice(1) ?? path
  })
  const themeData = monaco.extra.ColorThemeData.fromExtensionTheme({
    id,
    path,
    _watch: false,
    ...themeExtensionPoint
  }, rootUri, {
    extensionId: `theme-${id}`,
    extensionPublisher: 'codingame',
    extensionName: `theme-${id}`,
    extensionIsBuiltin: false,
    ...extensionData
  })
  vscodeThemeData.set(id, themeData)
  themes.push({
    id,
    label: themeExtensionPoint?.label ?? themeExtensionPoint?.id ?? id
  })

  themeData.setCustomColors(customColors)
  themeData.setCustomTokenColors(customTokenColors)
  themeData.setCustomSemanticTokenColors(customTokenColor)

  await themeData.ensureLoaded({
    _serviceBrand: undefined,
    readExtensionResource: async (uri) => {
      return JSON.stringify(await vscodeThemeLoader(uri))
    }
  })
  const monacoTheme = convertTheme(themeData, themeExtensionPoint?.uiTheme ?? monaco.extra.VS_LIGHT_THEME)
  monaco.editor.defineTheme(id, monacoTheme, themeData.semanticHighlighting)
}

export function getThemeData (themeName: string): monaco.extra.ColorThemeData | null {
  return vscodeThemeData.get(themeName) ?? null
}

export function getThemes (): Theme[] {
  return themes
}
