import * as monaco from 'monaco-editor'
import { convertTheme, IVSCodeTheme } from './tools'

const vscodeThemeData = new Map<string, monaco.extra.ColorThemeData>()

export async function defineVSCodeTheme (
  id: string,
  vscodeThemeLoader: (uri?: monaco.Uri) => Promise<IVSCodeTheme>,
  themeExtensionPoint?: Partial<monaco.extra.IThemeExtensionPoint>,
  extensionData?: Partial<monaco.extra.ExtensionData>
): Promise<void> {
  const path = `/theme-${id}.json`
  const rootUri = monaco.Uri.file(themeExtensionPoint?.path?.slice(1) ?? path)
  const themeData = monaco.extra.ColorThemeData.fromExtensionTheme({
    id,
    path: path,
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
