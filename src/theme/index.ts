import { setThemes, setDefaultThemes, IThemeExtensionPoint } from 'vscode/service-override/theme'
import { Disposable } from 'vscode'
import { registerColor } from 'vscode/monaco'
import defaultThemes from '../languages/extensions/themes.json'
import themeLoader from '../languages/extensions/themeLoader'

// Export 3 new colors used
registerColor('statusBar.foreground', {
  dark: '#ffffff',
  light: '#20252a',
  hcDark: '#ffffff',
  hcLight: '#20252a'
}, 'Status bar foreground color.')
registerColor('statusBar.background', {
  dark: '#252e38',
  light: '#ffffff',
  hcDark: null,
  hcLight: null
}, 'Status bar background color.')
registerColor('statusBar.border', {
  dark: '#41454a',
  light: '#dadada',
  hcDark: '#41454a',
  hcLight: '#dadada'
}, 'Status bar border color.')

interface DefaultTheme extends IThemeExtensionPoint {
  extension: string
}

interface VSCodeTheme extends IThemeExtensionPoint {
  load: () => Promise<string>
}

setDefaultThemes((defaultThemes as DefaultTheme[]).map(themeExtensionPoint => ({
  ...themeExtensionPoint,
  load: async () => JSON.stringify(await themeLoader[`${themeExtensionPoint.extension}:${themeExtensionPoint.path.slice(1)}`]!())
})), async (themeExtensionPoint) => themeExtensionPoint.load())

let themes: VSCodeTheme[] = []
function updateThemes () {
  setThemes(themes, async (themeExtensionPoint) => themeExtensionPoint.load())
}
updateThemes()

function defineVSCodeTheme (id: string, load: () => Promise<string>): Disposable {
  const theme: VSCodeTheme = {
    id,
    path: `/${id}.json`,
    load,
    _watch: false
  }
  themes = [
    ...themes,
    theme
  ]
  updateThemes()
  return {
    dispose () {
      themes = themes.filter(_theme => _theme !== theme)
      updateThemes()
    }
  }
}

export {
  defineVSCodeTheme
}
