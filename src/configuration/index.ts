import * as monaco from 'monaco-editor'
import extensions from '../languages/extensions/extensions.json'

const configurationRegistry = monaco.extra.Registry.as<monaco.extra.IConfigurationRegistry>(monaco.extra.ConfigurationExtensions.Configuration)
configurationRegistry.registerDefaultConfigurations([{
  overrides: {
    'editor.codeLens': false,
    'editor.fontSize': 12,
    'editor.maxTokenizationLineLength': 1000,
    'editor.quickSuggestions': false,
    'files.eol': '\n'
  }
}])

configurationRegistry.registerDefaultConfigurations([{
  overrides: extensions.configurationDefaults
}])

export function onConfigurationChanged (listener: (e: monaco.extra.IConfigurationChangeEvent) => void): monaco.IDisposable {
  const simpleConfigurationService = monaco.extra.StandaloneServices.get(monaco.extra.IConfigurationService) as monaco.extra.StandaloneConfigurationService
  return simpleConfigurationService.onDidChangeConfiguration(listener)
}

export function getConfiguration<C = Partial<monaco.editor.IEditorOptions>> (language?: string, section: string = 'editor'): C | undefined {
  const simpleConfigurationService = monaco.extra.StandaloneServices.get(monaco.extra.IConfigurationService) as monaco.extra.StandaloneConfigurationService
  return simpleConfigurationService.getValue(section, { overrideIdentifier: language })
}

export function updateUserConfiguration (configurationJson: string): void {
  const simpleConfigurationService = monaco.extra.StandaloneServices.get(monaco.extra.IConfigurationService) as monaco.extra.StandaloneConfigurationService
  simpleConfigurationService.updateUserConfiguration(configurationJson)
}

export function registerConfigurations (configurations: monaco.extra.IConfigurationNode[], validate?: boolean): void {
  configurationRegistry.registerConfigurations(configurations, validate)
}

export function registerDefaultConfigurations (defaultConfigurations: monaco.extra.IStringDictionary<unknown>[]): void {
  configurationRegistry.registerDefaultConfigurations(defaultConfigurations.map(overrides => ({ overrides })))
}
