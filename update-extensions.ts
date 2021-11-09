// Inspired by https://github.com/microsoft/vscode/blob/master/build/npm/update-grammar.js
import JSON5 from 'json5'
import ini from 'ini'
import cson from 'cson-parser'
import plist from 'fast-plist'
import YAML from 'yaml'
import https from 'https'
import path from 'path'
import { promisify } from 'util'
import * as fs from 'fs'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

const excludeScopeNames = ['source.tsx', 'source.js.jsx', 'source.objcpp', 'source.reason', 'source.cpp.embedded.macro']

const extensionsPath = path.resolve(__dirname, 'src/languages/extensions')

interface Extension {
  name: string
  repository: string
  path?: string
  version?: string
  mapping?: Record<string, string>
}

const extensions: Extension[] = [
  ...['clojure', 'coffeescript', 'cpp', 'csharp', 'css', 'fsharp', 'go',
    'groovy', 'html', 'java', 'javascript', 'json', 'lua', 'markdown-basics',
    'objective-c', 'perl', 'php', 'powershell', 'python', 'r', 'ruby',
    'rust', 'scss', 'shellscript', 'swift', 'typescript-basics',
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
  }
]

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
  let grammarResult: unknown[] = []
  let grammarPaths: Record<string, string> = {}
  let snippetPaths: Record<string, string> = {}
  let languageResult: unknown[] = []

  const grammarsPath = path.resolve(extensionsPath, 'grammars')
  await mkdir(grammarsPath, { recursive: true })

  const snippetsPath = path.resolve(extensionsPath, 'snippets')
  await mkdir(snippetsPath, { recursive: true })

  let configurationDefaultsResult = {}

  let i = 0
  for (const extension of extensions) {
    console.info(`extension ${i++}/${extensions.length} (${extension.name})`)
    const resolve = await createRepositoryFileResolver(extension)

    const packageJsonContent = (await download(resolve('package.json')))!
    const packageJson = JSON.parse(packageJsonContent)

    const { languages, grammars, configurationDefaults, snippets } = packageJson.contributes

    if (configurationDefaults != null) {
      configurationDefaultsResult = {
        ...configurationDefaultsResult,
        ...configurationDefaults
      }
    }

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
          `This file has been converted from https://github.com/${extension.repository}/blob/${extension.version || 'master'}/${extension.path ?? ''}`,
          'If you want to provide a fix or improvement, please create a pull request against the original repository.',
          'Once accepted there, we are happy to receive an update request.'
        ]
      }

      const basename = path.basename(grammarUrl)
      const fileName = ext === '.json' ? basename : `${basename}.json`
      const filePath = path.join(extension.name, fileName)

      await mkdir(path.resolve(grammarsPath, extension.name), { recursive: true })
      await writeFile(path.resolve(grammarsPath, filePath), JSON.stringify(result, null, 2))

      grammarResult = [
        ...grammarResult,
        grammarWithoutPath
      ]
      grammarPaths = {
        ...grammarPaths,
        [grammarConf.scopeName]: path.join('grammars', filePath)
      }
    }

    if (languages != null) {
      for (const languageConf of languages) {
        const { configuration: languageConfigurationPath, ...languageWithoutConfiguration } = languageConf
        let configuration = null
        if (languageConfigurationPath != null) {
          const configurationUrl = resolve(languageConfigurationPath)
          configuration = JSON5.parse((await download(configurationUrl))!)
        }

        languageResult = [
          ...languageResult, {
            ...languageWithoutConfiguration,
            configuration
          }
        ]
      }
    }

    if (snippets != null) {
      for (const snippetConf of snippets) {
        const { language, path: snippetPath } = snippetConf
        const snippetUrl = resolve(snippetPath)
        const snippetFileContent = JSON5.parse((await download(snippetUrl))!)

        const filePath = `${language}.json`
        await writeFile(path.resolve(snippetsPath, filePath), JSON.stringify(snippetFileContent, null, 2))
        snippetPaths = {
          ...snippetPaths,
          [language]: path.join('snippets', filePath)
        }
      }
    }
  }

  return {
    grammars: grammarResult,
    grammarPaths,
    languages: languageResult,
    configurationDefaults: configurationDefaultsResult,
    snippetPaths
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

async function main () {
  const {
    grammars,
    grammarPaths,
    languages,
    configurationDefaults,
    snippetPaths
  } = await fetchExtensions()

  await mkdir(path.dirname(extensionsPath), { recursive: true })
  await writeFile(path.resolve(extensionsPath, 'languages.json'), JSON.stringify(languages, null, 2))

  await writeFile(path.resolve(extensionsPath, 'grammars.json'), JSON.stringify(grammars, null, 2))

  await writeFile(path.resolve(extensionsPath, 'configurationDefaults.json'), JSON.stringify(configurationDefaults, null, 2))

  const grammarLoaders = `{\n${Object.entries(grammarPaths).map(generateGrammarLoaderLine).join(',\n')}\n}\n`

  await writeFile(path.resolve(extensionsPath, 'grammarLoader.ts'), `
// Generated file, do not modify

/* eslint-disable */
export default ${grammarLoaders}
`)

  const snippetLoaders = `{\n${Object.entries(snippetPaths).map(generateSnippetLoaderLine).join(',\n')}\n}\n`

  await writeFile(path.resolve(extensionsPath, 'snippetLoader.ts'), `
// Generated file, do not modify

/* eslint-disable */
export default ${snippetLoaders}
  `)
}

main().catch(console.error)
