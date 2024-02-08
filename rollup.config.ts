import { visualizer } from 'rollup-plugin-visualizer'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import * as rollup from 'rollup'
import builtins from 'rollup-plugin-node-builtins'
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin'
import glob from 'fast-glob'
import path from 'path'
import pkg from './package.json' assert { type: 'json' }

const externals = Object.keys(pkg.dependencies)

const extensions = ['.js', '.ts']

export default rollup.defineConfig({
  cache: false,
  input: {
    main: 'src/index.ts',
    'features/views': 'src/features/views.ts',
    'features/viewPanels': 'src/features/viewPanels.ts',
    'features/search': 'src/features/search.ts',
    'features/debug': 'src/features/debug.ts',
    'features/extensionHostWorker': 'src/features/extensionHostWorker.ts'
  },
  external: function isExternal (source, importer, isResolved) {
    if (isResolved) {
      return false
    }
    if (/\.wasm$/.test(source)) {
      return true
    }
    return externals.some(external => source === external || source.startsWith(`${external}/`))
  },
  output: [{
    dir: 'dist',
    format: 'esm',
    paths: {
      'monaco-editor-core': 'monaco-editor'
    },
    preserveModules: true,
    preserveModulesRoot: 'src',
    assetFileNames: 'assets/[name][extname]',
    entryFileNames: '[name].js',
    chunkFileNames: '[name].js'
  }],
  plugins: [
    builtins(),
    {
      name: 'glob-vsix-import',
      async resolveId (source, importer) {
        if (source.endsWith('*.vsix')) {
          return `glob:${path.resolve(path.dirname(importer!), source)}`
        }
        return undefined
      },
      async load (importee) {
        if (importee.startsWith('glob:')) {
          const files = await glob(importee.slice(5))

          return `
${files.map((file, index) => `import { whenReady as whenReady${index} } from '${file}'`).join('\n')}
export async function whenReady () {
  await Promise.all([
${files.map((_, index) => `    whenReady${index}()`).join(',\n')}
  ])
}
`
        }
        return undefined
      }
    },
    vsixPlugin({
      transformManifest (manifest) {
        const {
          commands,
          debuggers,
          keybindings,
          menus,
          views,
          walkthroughs,
          breakpoints,
          taskDefinitions,
          viewsWelcome,
          ...remainingContribute
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } = manifest.contributes as any

        const {
          browser,
          main,
          l10n,
          extensionDependencies, // for pure-d that requires hbenl.vscode-test-explorer
          ...remainingManifest
        } = manifest

        return {
          ...remainingManifest,
          contributes: remainingContribute
        }
      }
    }),
    nodeResolve({
      extensions
    }),
    commonjs({
      esmExternals: (id) => id.match(/^monaco-editor(\/.*)?/) != null // required for monaco-emacs with use import monaco-editor esm code from commonjs code
    }),
    typescript({
      noEmitOnError: true
    }),
    visualizer(),
    alias({
      entries: [{
        find: /^monaco-editor-core\//,
        replacement: 'monaco-editor/'
      }]
    }),
    {
      name: 'dynamic-import-polyfill',
      renderDynamicImport (): { left: string, right: string } {
        return {
          left: 'import(',
          right: ').then(module => module)'
        }
      }
    }
  ]
})
