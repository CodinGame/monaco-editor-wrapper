import * as monaco from 'monaco-editor'
import { convertTheme, fixVSCodeThemeColors, IVSCodeTheme } from './tools'

const vscodeThemeData = new Map<string, monaco.extra.ColorThemeData>()

function convertColorSheme (colorSheme: monaco.editor.ColorScheme) {
  switch (colorSheme) {
    case monaco.editor.ColorScheme.DARK: return monaco.extra.VS_DARK_THEME
    case monaco.editor.ColorScheme.LIGHT: return monaco.extra.VS_LIGHT_THEME
    case monaco.editor.ColorScheme.HIGH_CONTRAST: return monaco.extra.VS_HC_THEME
  }
}

export async function addVSCodeTheme (name: string, vscodeTheme: IVSCodeTheme): Promise<void> {
  const themeData = monaco.extra.ColorThemeData.fromExtensionTheme({
    id: name,
    path: `/theme-${name}.json`,
    uiTheme: convertColorSheme(vscodeTheme.type),
    _watch: false
  }, monaco.Uri.file(`/theme-${name}.json`), {
    extensionId: `theme-${name}`,
    extensionPublisher: 'codingame',
    extensionName: `theme-${name}`,
    extensionIsBuiltin: false
  })
  vscodeThemeData.set(name, themeData)

  await themeData.ensureLoaded({
    _serviceBrand: undefined,
    readExtensionResource: async () => {
      return JSON.stringify(vscodeTheme)
    }
  })

  const monacoTheme: monaco.editor.IStandaloneThemeData = {
    ...convertTheme(fixVSCodeThemeColors(vscodeTheme)),
    encodedTokensColors: themeData.tokenColorMap.slice(1)
  }
  monaco.editor.defineTheme(name, monacoTheme)
}

export function getThemeData (themeName: string): monaco.extra.ColorThemeData | null {
  return vscodeThemeData.get(themeName) ?? null
}
