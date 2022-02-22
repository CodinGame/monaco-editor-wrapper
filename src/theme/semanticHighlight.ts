import * as monaco from 'monaco-editor'
import { getThemeData } from './registry'

const ThemeClass: { prototype: monaco.editor.IStandaloneTheme } = monaco.extra.StandaloneServices.get(monaco.editor.IStandaloneThemeService).getColorTheme().constructor
ThemeClass.prototype.getTokenStyleMetadata = function (type: string, modifiers: string[], modelLanguage: string, useDefault?: boolean, definitions?: monaco.extra.TokenStyleDefinitions): monaco.editor.ITokenStyle | undefined {
  const themeData = getThemeData(this.themeName)
  if (themeData == null) {
    return undefined
  }
  return themeData.getTokenStyleMetadata(type, modifiers, modelLanguage, useDefault, definitions)
}
