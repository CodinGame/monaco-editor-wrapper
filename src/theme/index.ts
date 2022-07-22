import { setThemes, setDefaultThemes, IThemeExtensionPoint } from 'vscode/service-override/theme'
import { Disposable } from 'vscode'
import defaultThemes from '../languages/extensions/themes.json'
import themeLoader from '../languages/extensions/themeLoader'

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
