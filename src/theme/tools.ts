import * as monaco from 'monaco-editor'

function isValidHexColor (hex: string): boolean {
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    // #rrggbb
    return true
  }

  if (/^#[0-9a-f]{8}$/i.test(hex)) {
    // #rrggbbaa
    return true
  }

  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    // #rgb
    return true
  }

  if (/^#[0-9a-f]{4}$/i.test(hex)) {
    // #rgba
    return true
  }

  return false
}

function sanitizeColor (color: string | undefined) {
  if (color == null || isValidHexColor(color)) {
    return color
  }

  return '#FF0000'
}

function colorsAllowed ({ foreground, background }: { foreground?: string, background?: string }) {
  return foreground !== 'inherit' && background !== 'inherit'
}

export interface IVSCodeTheme {
  '$schema': 'vscode://schemas/color-theme'
  type: monaco.editor.ColorScheme
  colors: { [name: string]: string }
  tokenColors: monaco.extra.ITextMateThemingRule[]
  semanticTokenColors?: Record<string, monaco.extra.ITokenColorizationSetting>
  semanticHighlighting?: boolean
}

const getBase = (type: monaco.editor.ColorScheme) => {
  if (type === 'dark') {
    return 'vs-dark'
  }

  if (type === 'hc') {
    return 'hc-black'
  }

  return 'vs'
}

function convertTheme (theme: IVSCodeTheme): monaco.editor.IStandaloneThemeData {
  const { tokenColors = [], colors = {} } = theme
  const rules = tokenColors
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    .filter(t => t.settings != null && t.scope != null && colorsAllowed(t.settings))
    .reduce((acc, token) => {
      const settings = {
        foreground: sanitizeColor(token.settings.foreground),
        background: sanitizeColor(token.settings.background),
        fontStyle: token.settings.fontStyle
      }

      const scopes =
        typeof token.scope === 'string'
          ? token.scope.split(',').map(a => a.trim())
          : token.scope

      scopes?.forEach(scope =>
        acc.push({
          token: scope,
          ...settings
        })
      )

      return acc
    }, [] as monaco.editor.ITokenThemeRule[])

  return {
    base: getBase(theme.type),
    inherit: true,
    colors: colors,
    rules
  }
}

function fixThemeColor (color?: string) {
  return color != null ? monaco.editor.Color.fromHex(color).toString() : undefined
}
function fixVSCodeThemeColors (vscodeTheme: IVSCodeTheme): IVSCodeTheme {
  // Transform #000000ff into #000000 to prevent color maps from differing (between monaco and vscode-textmate)
  return {
    ...vscodeTheme,
    tokenColors: [
      {
        scope: [''],
        settings: {
          foreground: fixThemeColor(vscodeTheme.colors['editor.foreground']),
          background: fixThemeColor(vscodeTheme.colors['editor.background'])
        }
      },
      ...vscodeTheme.tokenColors.map(tokenColor => ({
        ...tokenColor,
        settings: {
          ...tokenColor.settings,
          foreground: fixThemeColor(tokenColor.settings.foreground),
          background: fixThemeColor(tokenColor.settings.background)
        }
      }))
    ]
  }
}

export {
  fixVSCodeThemeColors,
  convertTheme
}
