// Inspired by https://github.com/microsoft/vscode/blob/main/build/npm/update-all-grammars.js
import JSON5 from 'json5'
import ini from 'ini'
import cson from 'cson-parser'
import plist from 'fast-plist'
import YAML from 'yaml'
import type * as monaco from 'monaco-editor'
import https from 'https'
import path from 'path'
import * as fs from 'fs/promises'

const overrideConfigurationDefaultValue = new Map<string, unknown>(Object.entries({
  'cobol-lsp.subroutine-manager.paths-local': ['/tmp/project'],
  'Lua.runtime.version': 'Lua 5.4',
  'Lua.diagnostics.enable': true,
  'Lua.diagnostics.disable': ['lowercase-global'],
  'r.lsp.diagnostics': false,
  'solargraph.diagnostics': true,
  'solargraph.formatting': true,
  'systemverilog.linter': 'icarus',
  'systemverilog.launchConfiguration': 'iverilog -t null'
}))

interface Extension {
  name: string
  repository: string
  path?: string
  version?: string
  mapping?: Record<string, string>
}

const extensions: Extension[] = [
  ...['theme-defaults', 'clojure', 'coffeescript', 'cpp', 'csharp', 'css', 'fsharp', 'go',
    'groovy', 'html', 'java', 'javascript', 'json', 'lua', 'markdown-basics',
    'objective-c', 'perl', 'php', 'powershell', 'python', 'r', 'ruby',
    'rust', 'scss', 'shellscript', 'sql', 'swift', 'typescript-basics', 'typescript-language-features',
    'vb', 'xml', 'yaml'].map(language => ({
    name: language,
    repository: 'microsoft/vscode',
    path: `extensions/${language}/`
  })), {
    name: 'angular',
    repository: 'angular/vscode-ng-language-service'
  }, {
    name: 'd',
    repository: 'Pure-D/code-d'
  }, {
    name: 'dart',
    repository: 'Dart-Code/Dart-Code'
  }, {
    name: 'haskell',
    version: 'df29e5733bd5b31c59af7404306e0759431c33ea',
    repository: 'JustusAdam/language-haskell'
  }, {
    name: 'kotlin',
    repository: 'mathiasfrohlich/vscode-kotlin'
  }, {
    name: 'ocaml',
    repository: 'reasonml-editor/vscode-reasonml'
  }, {
    name: 'pascal',
    repository: 'alefragnani/vscode-language-pascal'
  }, {
    name: 'scala',
    repository: 'scala/vscode-scala-syntax'
  }, {
    name: 'scalameta',
    repository: 'scalameta/metals-vscode'
  }, {
    name: 'cobol',
    repository: 'eclipse/che-che4z-lsp-for-cobol',
    path: 'clients/cobol-lsp-vscode-extension/'
  }, {
    name: 'elixir',
    repository: 'timmhirsens/vscode-elixir'
  }, {
    name: 'erlang',
    repository: 'pgourlain/vscode_erlang'
  }, {
    name: 'tcl',
    repository: 'bitwisecook/vscode-tcl',
    mapping: {
      './out/syntaxes/tcl.json': './syntaxes/tcl.tmlanguage.yaml'
    }
  }, {
    name: 'svlangserver',
    repository: 'codingame/svlangserver'
  }, {
    name: 'postgresql',
    repository: 'Borvik/vscode-postgres'
  }, {
    name: 'java',
    repository: 'redhat-developer/vscode-java'
  }, {
    name: 'lua',
    repository: 'sumneko/vscode-lua'
  }, {
    name: 'cpptools',
    repository: 'microsoft/vscode-cpptools',
    path: 'Extension/'
  }, {
    name: 'omnisharp',
    repository: 'OmniSharp/omnisharp-vscode'
  }, {
    name: 'vscode-python',
    repository: 'microsoft/vscode-python'
  }, {
    name: 'vscode-R',
    repository: 'REditorSupport/vscode-R'
  }, {
    name: 'vscode-groovy',
    repository: 'GroovyLanguageServer/groovy-language-server',
    path: 'vscode-extension/'
  }, {
    name: 'solargraph',
    repository: 'castwide/vscode-solargraph'
  }, {
    name: 'solidity',
    repository: 'juanfranblanco/vscode-solidity'
  }, {
    name: 'vetur',
    repository: 'vuejs/vetur'
  },
]

const excludeScopeNames = ['source.objcpp', 'source.reason', 'source.cpp.embedded.macro']

const extensionsPath = path.resolve(__dirname, 'src/languages/extensions')

function overrideDefaultValue (configuration: monaco.extra.IConfigurationNode) {
  return {
    ...configuration,
    properties: Object.fromEntries(Object.entries(configuration.properties ?? {}).map(([key, value]) => [
      key, {
        ...value,
        default: overrideConfigurationDefaultValue.get(key) ?? value.default
      }
    ]))
  }
}

/**
 * There 2 functions come from https://github.com/CodinGame/vscode/blob/standalone/0.31.x/src/vs/base/common/types.ts
 */
function isString (str: unknown): str is string {
  return (typeof str === 'string')
}
function isObject (obj: unknown): obj is Object {
  // The method can't do a type cast since there are type (like strings) which
  // are subclasses of any put not positvely matched by the function. Hence type
  // narrowing results in wrong results.
  return typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    !(obj instanceof RegExp) &&
    !(obj instanceof Date)
}

/**
 * Comes from https://github.com/CodinGame/vscode/blob/standalone/0.31.x/src/vs/base/common/objects.ts
 */
function deepClone<T> (obj: T): T {
  if (obj == null || typeof obj !== 'object') {
    return obj
  }
  if (obj instanceof RegExp) {
    // See https://github.com/microsoft/TypeScript/issues/10990
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj as any
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = Array.isArray(obj) ? [] : {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.keys(<any>obj).forEach((key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((<any>obj)[key] != null && typeof (<any>obj)[key] === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = deepClone((<any>obj)[key])
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = (<any>obj)[key]
    }
  })
  return result
}

/** Comes from https://github.com/microsoft/vscode/blob/301cca6218a4f7b56d10d918d8638323a78899a7/src/vs/workbench/services/extensions/node/extensionPoints.ts#L250 */
interface MessageBag {
  [key: string]: string | { message: string, comment: string[] } | undefined
}

function replaceNLStrings<T extends object> (literal: T, messages: MessageBag): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function processEntry (obj: any, key: string | number) {
    const value = obj[key]
    if (isString(value)) {
      const str = value
      const length = str.length
      if (length > 1 && str[0] === '%' && str[length - 1] === '%') {
        const messageKey = str.slice(1, length - 1)
        const translated = messages[messageKey]
        const message: string | undefined = typeof translated === 'string' || translated == null ? translated : (typeof translated.message === 'string' ? translated.message : undefined)
        if (message !== undefined) {
          obj[key] = message
        } else {
          console.warn(`Couldn't find message for key ${messageKey}.`)
        }
      }
    } else if (isObject(value)) {
      for (const k in value) {
        if (Object.prototype.hasOwnProperty.call(value, k)) {
          processEntry(value, k)
        }
      }
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        processEntry(value, i)
      }
    }
  }

  for (const key in literal) {
    if (Object.prototype.hasOwnProperty.call(literal, key)) {
      processEntry(literal, key)
    }
  }
}

/**
 * These 2 methods come from https://github.com/CodinGame/vscode/blob/ebf697cb9dae96a2f6d2f6ca750173ddf4a7db82/src/vs/workbench/api/common/configurationExtensionPoint.ts#L181
 */
function handleConfiguration (node: monaco.extra.IConfigurationNode): monaco.extra.IConfigurationNode[] {
  const configurations: monaco.extra.IConfigurationNode[] = []
  const configuration = deepClone(node)

  if (configuration.title != null && (typeof configuration.title !== 'string')) {
    console.error('\'configuration.title\' must be a string')
  }

  validateProperties(configuration)

  configurations.push(configuration)
  return configurations
}

enum ConfigurationScope {
  APPLICATION = 1,
  MACHINE = 2,
  WINDOW = 3,
  RESOURCE = 4,
  LANGUAGE_OVERRIDABLE = 5,
  MACHINE_OVERRIDABLE = 6
}

const seenProperties = new Set<string>()
function validateProperties (configuration: monaco.extra.IConfigurationNode): void {
  const properties = configuration.properties
  if (properties != null) {
    if (typeof properties !== 'object') {
      console.error('\'configuration.properties\' must be an object')
      configuration.properties = {}
    }
    for (const key in properties) {
      if (seenProperties.has(key)) {
        delete properties[key]
        console.error(`Cannot register '${key}'. This property is already registered.`)
        continue
      }
      const propertyConfiguration = properties[key]
      if (!isObject(propertyConfiguration)) {
        delete properties[key]
        console.error(`configuration.properties property '${key}' must be an object`)
        continue
      }
      seenProperties.add(key)
      if (propertyConfiguration.scope != null) {
        if (propertyConfiguration.scope.toString() === 'application') {
          propertyConfiguration.scope = ConfigurationScope.APPLICATION
        } else if (propertyConfiguration.scope.toString() === 'machine') {
          propertyConfiguration.scope = ConfigurationScope.MACHINE
        } else if (propertyConfiguration.scope.toString() === 'resource') {
          propertyConfiguration.scope = ConfigurationScope.RESOURCE
        } else if (propertyConfiguration.scope.toString() === 'machine-overridable') {
          propertyConfiguration.scope = ConfigurationScope.MACHINE_OVERRIDABLE
        } else if (propertyConfiguration.scope.toString() === 'language-overridable') {
          propertyConfiguration.scope = ConfigurationScope.LANGUAGE_OVERRIDABLE
        } else {
          propertyConfiguration.scope = ConfigurationScope.WINDOW
        }
      } else {
        propertyConfiguration.scope = ConfigurationScope.WINDOW
      }
    }
  }
  const subNodes = configuration.allOf
  if (subNodes != null) {
    console.error('\'configuration.allOf\' is deprecated and should no longer be used. Instead, pass multiple configuration sections as an array to the \'configuration\' contribution point.')
    for (const node of subNodes) {
      validateProperties(node)
    }
  }
}

function download (url: string, redirectCount?: number): Promise<string | null> {
  return new Promise((resolve, reject) => {
    let content = ''
    https.get(url, function (response) {
      response.on('data', function (data) {
        content += data.toString()
      }).on('end', function () {
        if (response.statusCode === 403 && response.headers['x-ratelimit-remaining'] === '0') {
          reject(new Error('GitHub API rate exceeded. Set GITHUB_TOKEN environment variable to increase rate limit.'))
          return
        }
        if (response.statusCode === 404) {
          resolve(null)
        }
        const count = redirectCount ?? 0
        if ((count < 5 && response.statusCode! >= 300 && response.statusCode! <= 303) || response.statusCode === 307) {
          const location = response.headers.location
          if (location != null) {
            download(location, count + 1).then(resolve, reject)
            return
          }
        }
        resolve(content)
      })
    }).on('error', function (err) {
      reject(err.message)
    })
  })
}

interface ITokenTypeExtensionPoint {
  id: string
  description: string
  superType?: string
}

interface ITokenModifierExtensionPoint {
  id: string
  description: string
}
interface ITokenStyleDefaultExtensionPoint {
  language?: string
  scopes: { [selector: string]: string[] }
}

interface PackageJsonContributes {
  languages?: (monaco.languages.ILanguageExtensionPoint & { configuration?: string })[]
  grammars?: monaco.extra.ITMSyntaxExtensionPoint[]
  configurationDefaults?: Record<string, unknown>
  snippets?: {
    language: string
    path: string
  }[]
  semanticTokenTypes?: ITokenTypeExtensionPoint[]
  semanticTokenScopes?: ITokenStyleDefaultExtensionPoint[]
  semanticTokenModifiers?: ITokenModifierExtensionPoint[]
  configuration?: monaco.extra.IConfigurationNode | monaco.extra.IConfigurationNode[]
  themes?: monaco.extra.IThemeExtensionPoint[]
}

async function createRepositoryFileResolver (extension: Extension) {
  const extensionRepo = `https://raw.githubusercontent.com/${extension.repository}/${extension.version ?? 'master'}`
  const submodules = await download(`${extensionRepo}/.gitmodules`)
  const map: Record<string, string> = {}
  if (submodules != null) {
    const parsed = ini.parse(submodules)
    for (const key in parsed) {
      if (/submodule "(.*)"/.exec(key) != null) {
        const from = parsed[key].path
        const githubOrigin = /https:\/\/github\.com\/(.*)/.exec(parsed[key].url)
        if (githubOrigin != null) {
          map[from] = githubOrigin[1]!
        }
      }
    }
  }

  return (repoPath: string) => {
    const mapped = extension.mapping?.[repoPath] ?? repoPath
    const fixedPath = mapped.replace(/^\.\//, '')
    let repository = extension.repository
    let rpath = `${extension.path ?? ''}${fixedPath}`
    let version = extension.version ?? 'master'
    for (const from in map) {
      const to = map[from]!
      if (rpath.startsWith(from)) {
        repository = to
        rpath = path.relative(from, rpath)
      }
      version = 'master'
    }

    return `https://raw.githubusercontent.com/${repository}/${version}/${rpath}`
  }
}

async function fetchExtensions () {
  await fs.rm(extensionsPath, { recursive: true })

  let grammarResult: Omit<monaco.extra.ITMSyntaxExtensionPoint, 'path'>[] = []
  let grammarPaths: Record<string, string> = {}
  let snippetPaths: Record<string, string> = {}
  let languageConfigurationPaths: Record<string, string> = {}
  let extensionConfigurationRegistrationPaths: Record<string, string> = {}
  let themePaths: Record<string, string> = {}
  let themeResult: (Omit<monaco.extra.IThemeExtensionPoint, '_watch'> & { extension: string })[] = []
  let languageResult: Omit<monaco.languages.ILanguageExtensionPoint, 'configuration'>[] = []

  const grammarsPath = path.resolve(extensionsPath, 'grammars')
  await fs.mkdir(grammarsPath, { recursive: true })

  const snippetsPath = path.resolve(extensionsPath, 'snippets')
  await fs.mkdir(snippetsPath, { recursive: true })

  const languageConfigurationsPath = path.resolve(extensionsPath, 'languageConfigurations')
  await fs.mkdir(languageConfigurationsPath, { recursive: true })

  const extensionConfigurationRegistrationsPath = path.resolve(extensionsPath, 'configurations')
  await fs.mkdir(extensionConfigurationRegistrationsPath, { recursive: true })

  const themesPath = path.resolve(extensionsPath, 'themes')
  await fs.mkdir(themesPath, { recursive: true })

  const extensionResult: {
    configurationDefaults: Record<string, unknown>
    semanticTokenTypes: ITokenTypeExtensionPoint[]
    semanticTokenScopes: ITokenStyleDefaultExtensionPoint[]
    semanticTokenModifiers: ITokenModifierExtensionPoint[]
  } = {
    configurationDefaults: {},
    semanticTokenTypes: [],
    semanticTokenScopes: [],
    semanticTokenModifiers: []
  }

  let i = 0
  for (const extension of extensions) {
    console.info(`extension ${i++}/${extensions.length} (${extension.name})`)
    const resolve = await createRepositoryFileResolver(extension)

    const packageJsonContent = (await download(resolve('package.json')))!
    const packageJson = JSON.parse(packageJsonContent) as {
      name: string
      contributes: PackageJsonContributes
    }

    // Only use the default i18n, can be improved
    const packageNlsJsonContent = await download(resolve('package.nls.json'))
    if (packageNlsJsonContent != null) {
      replaceNLStrings(packageJson, JSON.parse(packageNlsJsonContent))
    }

    const {
      languages,
      grammars,
      configurationDefaults,
      snippets,
      semanticTokenTypes,
      semanticTokenScopes,
      semanticTokenModifiers,
      configuration,
      themes
    } = packageJson.contributes

    if (configurationDefaults != null) {
      extensionResult.configurationDefaults = {
        ...extensionResult.configurationDefaults,
        ...configurationDefaults
      }
    }

    if (semanticTokenTypes != null) {
      extensionResult.semanticTokenTypes.push(...semanticTokenTypes)
    }
    if (semanticTokenScopes != null) {
      extensionResult.semanticTokenScopes.push(...semanticTokenScopes)
    }
    if (semanticTokenModifiers != null) {
      extensionResult.semanticTokenModifiers.push(...semanticTokenModifiers)
    }

    if (grammars != null) {
      for (const grammarConf of grammars) {
        if (excludeScopeNames.includes(grammarConf.scopeName)) {
          continue
        }
        const { path: grammarRemotePath, ...grammarWithoutPath } = grammarConf
        const grammarUrl = resolve(grammarRemotePath)

        const grammarText = await download(grammarUrl)
        if (grammarText == null) {
          throw new Error('Unable to download grammar file')
        }
        const ext = path.extname(grammarUrl)

        let grammarObject = null
        try {
          if (ext === '.tmLanguage' || ext === '.plist') {
            grammarObject = plist.parse(grammarText)
          } else if (ext === '.cson') {
            grammarObject = cson.parse(grammarText)
          } else if (ext === '.json' || ext === '.JSON-tmLanguage') {
            grammarObject = JSON5.parse(grammarText)
          } else if (ext === '.yaml' || ext === '.yml') {
            grammarObject = YAML.parse(grammarText)
          } else {
            return Promise.reject(new Error('Unknown file extension: ' + ext))
          }
        } catch (error) {
          console.error(error)
          throw new Error('Invalid grammar file ' + grammarUrl)
        }

        const result = {
          ...grammarObject,
          information_for_contributors: [
            `This file has been converted from https://github.com/${extension.repository}/blob/${extension.version ?? 'master'}/${extension.path ?? ''}`,
            'If you want to provide a fix or improvement, please create a pull request against the original repository.',
            'Once accepted there, we are happy to receive an update request.'
          ]
        }

        const basename = path.basename(grammarUrl)
        const fileName = ext === '.json' ? basename : `${basename}.json`
        const filePath = path.join(extension.name, fileName)

        await fs.mkdir(path.resolve(grammarsPath, extension.name), { recursive: true })
        await fs.writeFile(path.resolve(grammarsPath, filePath), JSON.stringify(result, null, 2))

        grammarResult = [
          ...grammarResult,
          grammarWithoutPath
        ]
        grammarPaths = {
          ...grammarPaths,
          [grammarConf.scopeName]: path.join('grammars', filePath)
        }
      }
    }

    if (languages != null) {
      for (const languageConf of languages) {
        const { configuration: languageConfigurationPath, ...languageWithoutConfiguration } = languageConf
        const id = languageWithoutConfiguration.id
        let configuration = null
        if (languageConfigurationPath != null) {
          const configurationUrl = resolve(languageConfigurationPath)
          configuration = JSON5.parse((await download(configurationUrl))!)

          const filePath = `${id}.json`
          await fs.writeFile(path.resolve(languageConfigurationsPath, filePath), JSON.stringify(configuration, null, 2))

          languageConfigurationPaths = {
            ...languageConfigurationPaths,
            [id]: path.join('languageConfigurations', filePath)
          }
        }

        languageResult = [
          ...languageResult,
          languageWithoutConfiguration
        ]
      }
    }

    if (snippets != null) {
      for (const snippetConf of snippets) {
        const { language, path: snippetPath } = snippetConf
        const snippetUrl = resolve(snippetPath)
        const snippetFileContent = JSON5.parse((await download(snippetUrl))!)

        const filePath = `${extension.name}-${path.basename(snippetPath, '.json')}.json`
        await fs.writeFile(path.resolve(snippetsPath, filePath), JSON.stringify(snippetFileContent, null, 2))
        snippetPaths = {
          ...snippetPaths,
          [language]: path.join('snippets', filePath)
        }
      }
    }

    if (configuration != null) {
      const filePath = `${extension.name}.json`
      const configurations = (Array.isArray(configuration) ? configuration : [configuration]).flatMap(handleConfiguration).map(overrideDefaultValue)
      await fs.writeFile(path.resolve(extensionConfigurationRegistrationsPath, filePath), JSON.stringify(configurations, null, 2))

      extensionConfigurationRegistrationPaths = {
        ...extensionConfigurationRegistrationPaths,
        [extension.name]: path.join('configurations', filePath)
      }
    }

    if (themes != null) {
      for (const theme of themes) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (theme.id == null) {
          continue
        }
        const filePath = `${packageJson.name}~${path.basename(theme.path)}`
        const themeContent = JSON5.parse((await download(resolve(theme.path)))!)

        await fs.writeFile(path.resolve(themesPath, filePath), JSON.stringify(themeContent, null, 2))

        themePaths = {
          ...themePaths,
          [`${packageJson.name}:${path.resolve('/', theme.path)}`]: path.join('themes', filePath)
        }

        themeResult = [
          ...themeResult, {
            ...theme,
            extension: packageJson.name
          }
        ]
      }
    }
  }

  return {
    grammars: grammarResult,
    languages: languageResult,
    extensions: extensionResult,
    themes: themeResult,
    grammarPaths,
    snippetPaths,
    languageConfigurationPaths,
    extensionConfigurationRegistrationPaths,
    themePaths
  }
}

function generateLoaderLine (key: string, chunkName: string, path: string, mode: 'lazy' | 'lazy-once' | 'eager' | 'weak' = 'lazy') {
  return `  '${key}': async () => (await import(/* webpackChunkName: "${chunkName}" */ /* webpackMode: "${mode}" */ './${path}')).default`
}

function generateGrammarLoaderLine ([scopeName, path]: [string, string]) {
  return generateLoaderLine(scopeName, `grammar-${scopeName.replace(/\./g, '-')}`, path)
}

function generateSnippetLoaderLine ([language, path]: [string, string]) {
  return generateLoaderLine(language, `snippet-${language}`, path)
}

function generateLanguageConfigurationLoaderLine ([language, path]: [string, string]) {
  return generateLoaderLine(language, `language-configuration-${language}`, path)
}

function generateConfigurationRegistrationLoaderLine ([extensionId, path]: [string, string]) {
  return generateLoaderLine(extensionId, `configuration-registration-${extensionId}`, path)
}

function generateThemeLoaderLine ([themeId, path]: [string, string]) {
  return generateLoaderLine(themeId, `theme-${themeId}`, path, 'eager')
}

async function main () {
  const {
    grammars,
    languages,
    extensions,
    snippetPaths,
    grammarPaths,
    themePaths,
    languageConfigurationPaths,
    extensionConfigurationRegistrationPaths,
    themes
  } = await fetchExtensions()

  await fs.mkdir(path.dirname(extensionsPath), { recursive: true })
  await fs.writeFile(path.resolve(extensionsPath, 'languages.json'), JSON.stringify(languages, null, 2))

  await fs.writeFile(path.resolve(extensionsPath, 'grammars.json'), JSON.stringify(grammars, null, 2))

  await fs.writeFile(path.resolve(extensionsPath, 'extensions.json'), JSON.stringify(extensions, null, 2))

  await fs.writeFile(path.resolve(extensionsPath, 'themes.json'), JSON.stringify(themes, null, 2))

  const grammarLoaders = `{\n${Object.entries(grammarPaths).map(generateGrammarLoaderLine).join(',\n')}\n}`

  await fs.writeFile(path.resolve(extensionsPath, 'grammarLoader.ts'), `
// Generated file, do not modify

/* eslint-disable */
const loader = ${grammarLoaders} as Partial<Record<string, () => Promise<object>>>

export default loader
`)

  const snippetLoaders = `{\n${Object.entries(snippetPaths).map(generateSnippetLoaderLine).join(',\n')}\n}`

  await fs.writeFile(path.resolve(extensionsPath, 'snippetLoader.ts'), `
// Generated file, do not modify
import * as monaco from 'monaco-editor'

/* eslint-disable */
const loader = ${snippetLoaders} as unknown as Partial<Record<string, () => Promise<Record<string, monaco.extra.JsonSerializedSnippet>>>>

export default loader
  `)

  const configurationLoader = `{\n${Object.entries(languageConfigurationPaths).map(generateLanguageConfigurationLoaderLine).join(',\n')}\n}`

  await fs.writeFile(path.resolve(extensionsPath, 'languageConfigurationLoader.ts'), `
// Generated file, do not modify
import * as monaco from 'monaco-editor'

export interface RawLanguageConfiguration extends Omit<monaco.extra.ILanguageConfiguration, 'folding'> {
  folding?: Omit<monaco.extra.ILanguageConfiguration['folding'], 'markers'> & {
    markers?: {
      start: string
      end: string
    }
  }
}

/* eslint-disable */
const loader = ${configurationLoader} as unknown as Partial<Record<string, () => Promise<RawLanguageConfiguration>>>

export default loader
  `)

  const configurationRegistrationLoader = `{\n${Object.entries(extensionConfigurationRegistrationPaths).map(generateConfigurationRegistrationLoaderLine).join(',\n')}\n}`

  await fs.writeFile(path.resolve(extensionsPath, 'extensionConfigurationLoader.ts'), `
// Generated file, do not modify
import * as monaco from 'monaco-editor'

/* eslint-disable */
const loader = ${configurationRegistrationLoader} as unknown as Partial<Record<string, () => Promise<monaco.extra.IConfigurationNode[]>>>

export default loader
  `)

  const themeLoader = `{\n${Object.entries(themePaths).map(generateThemeLoaderLine).join(',\n')}\n}`

  await fs.writeFile(path.resolve(extensionsPath, 'themeLoader.ts'), `
// Generated file, do not modify
import { IVSCodeTheme } from '../../theme/tools'

/* eslint-disable */
const loader = ${themeLoader} as Partial<Record<string, () => Promise<IVSCodeTheme>>>

export default loader
  `)
}

main().catch(console.error)
