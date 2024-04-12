// @ts-ignore
import { getPublicGalleryAPI } from '@vscode/vsce/out/util.js'
import { ExtensionQueryFlags, PublishedExtension, ExtensionVersion } from 'azure-devops-node-api/interfaces/GalleryInterfaces.js'
import fs from 'fs/promises'

async function getLastVersion (publisher: string, name: string): Promise<ExtensionVersion> {
  return ((await getPublicGalleryAPI().getExtension(`${publisher}.${name}`, [ExtensionQueryFlags.IncludeLatestVersionOnly])) as PublishedExtension).versions![0]!
}

async function run () {
  const extensions = JSON.parse((await fs.readFile('./vscode-extensions.json')).toString())
  const updates: { extension: string, from: string, to: string }[] = []
  for (const extension of extensions) {
    const lastVersion = await getLastVersion(extension.publisher, extension.name)
    if (lastVersion.version != null && lastVersion.version !== extension.version) {
      updates.push({
        extension: `${extension.publisher}.${extension.name}`,
        from: extension.version,
        to: lastVersion.version
      })
      extension.version = lastVersion.version
    }
  }

  if (updates.length > 0) {
    // eslint-disable-next-line no-console
    console.info(`${updates.length} extensions updated:\n${updates.map(({ extension, from, to }) => `${extension}: ${from} => ${to}`).join('\n')}`)
  } else {
    // eslint-disable-next-line no-console
    console.info('Everything up to date')
  }
  await fs.writeFile('./vscode-extensions.json', JSON.stringify(extensions, null, 2))
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
