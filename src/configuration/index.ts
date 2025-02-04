import * as monaco from 'monaco-editor'
import { StandaloneServices, IConfigurationChangeEvent, IConfigurationService } from '@codingame/monaco-vscode-api'
import * as vscode from 'vscode'
import { configurationRegistry, updateUserConfiguration, getUserConfiguration, onUserConfigurationChange, IConfigurationNode, IConfigurationDefaults } from '@codingame/monaco-vscode-configuration-service-override'

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

export function onConfigurationChanged (listener: (e: IConfigurationChangeEvent) => void): vscode.Disposable {
  const configurationService = StandaloneServices.get(IConfigurationService)
  return configurationService.onDidChangeConfiguration(listener)
}

export function getConfiguration<C = Partial<monaco.editor.IEditorOptions>> (language?: string, section: string = 'editor'): C | undefined {
  const configurationService = StandaloneServices.get(IConfigurationService)
  return configurationService.getValue(section, { overrideIdentifier: language })
}

export {
  updateUserConfiguration,
  getUserConfiguration,
  onUserConfigurationChange
}

export function registerConfigurations (configurations: IConfigurationNode[], validate?: boolean): void {
  configurationRegistry.registerConfigurations(configurations, validate)
}

export function registerDefaultConfigurations (defaultConfigurations: IConfigurationDefaults['overrides'][]): void {
  configurationRegistry.registerDefaultConfigurations(defaultConfigurations.map(overrides => ({ overrides })))
}
