import * as monaco from 'monaco-editor'
import extensionConfigurations from '../languages/extensions/extensionConfigurations.json'

const configurationRegistry = monaco.extra.Registry.as<monaco.extra.IConfigurationRegistry>(monaco.extra.ConfigurationExtensions.Configuration)

configurationRegistry.registerConfigurations(extensionConfigurations as unknown as monaco.extra.IConfigurationNode[])

