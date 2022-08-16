import { setSnippets } from 'vscode/service-override/snippets'
import snippetLoader from '../extensions/snippetLoader'

setSnippets(Object.keys(snippetLoader).map(language => ({
  language,
  path: `${language}-snippets.json`
})), async (extensionPoint) => JSON.stringify(await snippetLoader[extensionPoint.language]!()))
