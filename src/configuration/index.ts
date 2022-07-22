import * as monaco from 'monaco-editor'
import { IConfigurationChangeEvent, IConfigurationService } from 'vscode/services'
import * as vscode from 'vscode'
import { updateUserConfiguration } from 'vscode/service-override/configuration'
import extensions from '../languages/extensions/extensions.json'
import './files'

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

const configurationRegistry = monaco.extra.Registry.as<monaco.extra.IConfigurationRegistry>(monaco.extra.ConfigurationExtensions.Configuration)
configurationRegistry.registerDefaultConfigurations([{
  overrides: {
    'editor.codeLens': false,
    'editor.fontSize': 12,
    'editor.maxTokenizationLineLength': 1000,
    'editor.quickSuggestions': false,
    'files.eol': '\n',
    'editor.semanticTokenColorCustomizations': {
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
    },
    'workbench.colorCustomizations': customColors
  }
}])

configurationRegistry.registerDefaultConfigurations([{
  overrides: extensions.configurationDefaults
}])

export function onConfigurationChanged (listener: (e: IConfigurationChangeEvent) => void): vscode.Disposable {
  const configurationService = monaco.extra.StandaloneServices.get(IConfigurationService)
  return configurationService.onDidChangeConfiguration(listener)
}

export function getConfiguration<C = Partial<monaco.editor.IEditorOptions>> (language?: string, section: string = 'editor'): C | undefined {
  const configurationService = monaco.extra.StandaloneServices.get(IConfigurationService)
  return configurationService.getValue(section, { overrideIdentifier: language })
}

export {
  updateUserConfiguration
}

export function registerConfigurations (configurations: monaco.extra.IConfigurationNode[], validate?: boolean): void {
  configurationRegistry.registerConfigurations(configurations, validate)
}

export function registerDefaultConfigurations (defaultConfigurations: monaco.extra.IStringDictionary<unknown>[]): void {
  configurationRegistry.registerDefaultConfigurations(defaultConfigurations.map(overrides => ({ overrides })))
}
