import * as monaco from 'monaco-editor'
import extensions from '../languages/extensions/extensions.json'

const configuration = monaco.extra.Registry.as<monaco.extra.IConfigurationRegistry>(monaco.extra.ConfigurationExtensions.Configuration)
configuration.registerDefaultConfigurations([{
  'editor.codeLens': false,
  'editor.fontSize': 12,
  'editor.maxTokenizationLineLength': 1000,
  'editor.quickSuggestions': false
}])
configuration.registerConfigurations(extensions.configurations as unknown as monaco.extra.IConfigurationNode[])
configuration.registerDefaultConfigurations([extensions.configurationDefaults])

const simpleConfigurationService = monaco.editor.StaticServices.configurationService.get() as monaco.extra.SimpleConfigurationService

export const onConfigurationChanged = simpleConfigurationService.onDidChangeConfiguration

export function getConfiguration<C = Partial<monaco.editor.IEditorOptions>> (language?: string, section: string = 'editor'): C | undefined {
  return simpleConfigurationService.getValue(section, { overrideIdentifier: language })
}

export function updateUserConfiguration (configurationJson: string): void {
  simpleConfigurationService.updateUserConfiguration(configurationJson)
}

export function registerConfigurations (configurations: monaco.extra.IConfigurationNode[], validate?: boolean): void {
  configuration.registerConfigurations(configurations, validate)
}

export function registerDefaultConfigurations (defaultConfigurations: monaco.extra.IStringDictionary<unknown>[]): void {
  configuration.registerDefaultConfigurations(defaultConfigurations)
}
