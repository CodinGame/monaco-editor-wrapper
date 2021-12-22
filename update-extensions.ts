// Inspired by https://github.com/microsoft/vscode/blob/master/build/npm/update-grammar.js
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
  'Lua.color.mode': 'Grammar',
  'Lua.runtime.version': 'Lua 5.4',
  'Lua.diagnostics.enable': true,
  'Lua.diagnostics.disable': ['lowercase-global'],
  'r.lsp.diagnostics': false
}))

const extensions: Extension[] = [
  ...['clojure', 'coffeescript', 'cpp', 'csharp', 'css', 'fsharp', 'go',
    'groovy', 'html', 'java', 'javascript', 'json', 'lua', 'markdown-basics',
    'objective-c', 'perl', 'php', 'powershell', 'python', 'r', 'ruby',
    'rust', 'scss', 'shellscript', 'swift', 'typescript-basics', 'typescript-language-features',
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
    name: 'pgsql',
    repository: 'microsoft/vscode-postgresql'
  }, {
    name: 'scala',
    repository: 'scala/vscode-scala-syntax'
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
    name: 'verilog',
    repository: 'mshr-h/vscode-verilog-hdl-support'
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
    name: 'Groovy',
    repository: 'GroovyLanguageServer/groovy-language-server',
    path: 'vscode-extension/'
  }
]

const excludeScopeNames = ['source.tsx', 'source.js.jsx', 'source.objcpp', 'source.reason', 'source.cpp.embedded.macro']

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyI18n (object: any, i18n: Partial<Record<string, string>>): any {
  if (object === null) {
    return object
  } else if (typeof object === 'string') {
    return object.replace(/^%(.*)%$/g, (g, g1) => i18n[g1] ?? g1)
  } else if (Array.isArray(object)) {
    return object.map(item => applyI18n(item, i18n))
  } else if (typeof object === 'object') {
    return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, applyI18n(value, i18n)]))
  } else {
    return object
  }
}

interface Extension {
  name: string
  repository: string
  path?: string
  version?: string
  mapping?: Record<string, string>
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
  configuration?: monaco.extra.IConfigurationNode
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
          map[from] = githubOrigin[1]
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
      const to = map[from]
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
  await fs.rmdir(extensionsPath, { recursive: true })

  let grammarResult: Omit<monaco.extra.ITMSyntaxExtensionPoint, 'path'>[] = []
  let grammarPaths: Record<string, string> = {}
  let snippetPaths: Record<string, string> = {}
  let languageConfigurationPaths: Record<string, string> = {}
  let languageResult: Omit<monaco.languages.ILanguageExtensionPoint, 'configuration'>[] = []

  const grammarsPath = path.resolve(extensionsPath, 'grammars')
  await fs.mkdir(grammarsPath, { recursive: true })

  const snippetsPath = path.resolve(extensionsPath, 'snippets')
  await fs.mkdir(snippetsPath, { recursive: true })

  const languageConfigurationsPath = path.resolve(extensionsPath, 'languageConfigurations')
  await fs.mkdir(languageConfigurationsPath, { recursive: true })

  const extensionResult: {
      configurationDefaults: Record<string, unknown>
      semanticTokenTypes: ITokenTypeExtensionPoint[]
      semanticTokenScopes: ITokenStyleDefaultExtensionPoint[]
      semanticTokenModifiers: ITokenModifierExtensionPoint[]
      configurations: monaco.extra.IConfigurationNode[]
    } = {
      configurationDefaults: {},
      semanticTokenTypes: [],
      semanticTokenScopes: [],
      semanticTokenModifiers: [],
      configurations: []
    }

  let i = 0
  for (const extension of extensions) {
    console.info(`extension ${i++}/${extensions.length} (${extension.name})`)
    const resolve = await createRepositoryFileResolver(extension)

    const packageJsonContent = (await download(resolve('package.json')))!
    let packageJson = JSON.parse(packageJsonContent) as {
        contributes: PackageJsonContributes
      }

    // Only use the default i18n, can be improved
    const packageNlsJsonContent = await download(resolve('package.nls.json'))
    if (packageNlsJsonContent != null) {
      packageJson = applyI18n(packageJson, JSON.parse(packageNlsJsonContent))
    }

    const {
      languages,
      grammars,
      configurationDefaults,
      snippets,
      semanticTokenTypes,
      semanticTokenScopes,
      semanticTokenModifiers,
      configuration
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

        const filePath = `${extension.name}-${snippetConf.language}.json`
        await fs.writeFile(path.resolve(snippetsPath, filePath), JSON.stringify(snippetFileContent, null, 2))
        snippetPaths = {
          ...snippetPaths,
          [language]: path.join('snippets', filePath)
        }
      }
    }

    if (configuration != null) {
      extensionResult.configurations.push(overrideDefaultValue(configuration))
    }
  }

  return {
    grammars: grammarResult,
    languages: languageResult,
    extensions: extensionResult,
    grammarPaths,
    snippetPaths,
    languageConfigurationPaths
  }
}

function generateLoaderLine (key: string, chunkName: string, path: string) {
  return `  '${key}': async () => (await import(/* webpackChunkName: "${chunkName}" */ './${path}')).default`
}

function generateGrammarLoaderLine ([scopeName, path]: [string, string]) {
  return generateLoaderLine(scopeName, `grammar-${scopeName.replace(/\./g, '-')}`, path)
}

function generateSnippetLoaderLine ([language, path]: [string, string]) {
  return generateLoaderLine(language, `snippet-${language}`, path)
}

function generateLanguageConfigurationLoaderLine ([language, path]: [string, string]) {
  return generateLoaderLine(language, `configuration-${language}`, path)
}

async function main () {
  const {
    grammars,
    languages,
    extensions,
    snippetPaths,
    grammarPaths,
    languageConfigurationPaths
  } = await fetchExtensions()

  await fs.mkdir(path.dirname(extensionsPath), { recursive: true })
  await fs.writeFile(path.resolve(extensionsPath, 'languages.json'), JSON.stringify(languages, null, 2))

  await fs.writeFile(path.resolve(extensionsPath, 'grammars.json'), JSON.stringify(grammars, null, 2))

  await fs.writeFile(path.resolve(extensionsPath, 'extensions.json'), JSON.stringify(extensions, null, 2))

  const grammarLoaders = `{\n${Object.entries(grammarPaths).map(generateGrammarLoaderLine).join(',\n')}\n}\n`

  await fs.writeFile(path.resolve(extensionsPath, 'grammarLoader.ts'), `
// Generated file, do not modify

/* eslint-disable */
export default ${grammarLoaders}
`)

  const snippetLoaders = `{\n${Object.entries(snippetPaths).map(generateSnippetLoaderLine).join(',\n')}\n}\n`

  await fs.writeFile(path.resolve(extensionsPath, 'snippetLoader.ts'), `
// Generated file, do not modify

/* eslint-disable */
export default ${snippetLoaders}
  `)

  const configurationLoader = `{\n${Object.entries(languageConfigurationPaths).map(generateLanguageConfigurationLoaderLine).join(',\n')}\n}\n`

  await fs.writeFile(path.resolve(extensionsPath, 'configurationLoader.ts'), `
// Generated file, do not modify

/* eslint-disable */
export default ${configurationLoader}
  `)
}

main().catch(console.error)
