import * as monaco from 'monaco-editor'
import { StandaloneServices, IConfigurationChangeEvent, IConfigurationService } from 'vscode/services'
import * as vscode from 'vscode'
import { configurationRegistry, updateUserConfiguration, IConfigurationNode, IConfigurationDefaults } from 'vscode/service-override/configuration'
import extensions from '../languages/extensions/extensions.json'
import './files'

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
    }
  }
}])

configurationRegistry.registerDefaultConfigurations([{
  overrides: extensions.configurationDefaults
}])

export function onConfigurationChanged (listener: (e: IConfigurationChangeEvent) => void): vscode.Disposable {
  const configurationService = StandaloneServices.get(IConfigurationService)
  return configurationService.onDidChangeConfiguration(listener)
}

export function getConfiguration<C = Partial<monaco.editor.IEditorOptions>> (language?: string, section: string = 'editor'): C | undefined {
  const configurationService = StandaloneServices.get(IConfigurationService)
  return configurationService.getValue(section, { overrideIdentifier: language })
}

export {
  updateUserConfiguration
}

export function registerConfigurations (configurations: IConfigurationNode[], validate?: boolean): void {
  configurationRegistry.registerConfigurations(configurations, validate)
}

export function registerDefaultConfigurations (defaultConfigurations: IConfigurationDefaults['overrides'][]): void {
  configurationRegistry.registerDefaultConfigurations(defaultConfigurations.map(overrides => ({ overrides })))
}
