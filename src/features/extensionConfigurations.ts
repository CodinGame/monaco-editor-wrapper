import * as monaco from 'monaco-editor'
import extensionConfigurationLoader from '../languages/extensions/extensionConfigurationLoader'

const configurationRegistry = monaco.extra.Registry.as<monaco.extra.IConfigurationRegistry>(monaco.extra.ConfigurationExtensions.Configuration)

export async function loadConfigurationForExtension (extensionId: string): Promise<void> {
  const loader = extensionConfigurationLoader[extensionId]
  if (loader == null) {
    throw new Error(`Unknown extension ${extensionId}`)
  }
  const configuration = await loader()
  configurationRegistry.registerConfigurations(configuration)
}
