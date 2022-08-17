import { configurationRegistry } from 'vscode/service-override/configuration'
import extensionConfigurationLoader from '../languages/extensions/extensionConfigurationLoader'

export async function loadConfigurationForExtension (extensionId: string): Promise<void> {
  const loader = extensionConfigurationLoader[extensionId]
  if (loader == null) {
    throw new Error(`Unknown extension ${extensionId}`)
  }
  const configuration = await loader()
  configurationRegistry.registerConfigurations(configuration)
}
