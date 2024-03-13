import { visualizer } from 'rollup-plugin-visualizer'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import * as rollup from 'rollup'
import builtins from 'rollup-plugin-node-builtins'
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin'
import glob from 'fast-glob'
import { addExtension } from '@rollup/pluginutils'
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
    'features/testing': 'src/features/testing.ts',
    'features/terminal': 'src/features/terminal.ts',
    'features/extensionHostWorker': 'src/features/extensionHostWorker.ts',
    'features/notifications': 'src/features/notifications.ts',
    'features/extensionGallery': 'src/features/extensionGallery.ts',
    'features/workbench': 'src/features/workbench.ts'
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
      name: 'external-resolver',
      resolveId (id) {
        // monaco-editor can safely be imported with monaco-vscode-api
        if (id === 'monaco-editor/esm/vs/editor/editor.api') {
          return {
            id: 'monaco-editor',
            external: 'absolute'
          }
        }
        // Add missing .js extension to respect ESM strict mode
        if (id.startsWith('monaco-editor/esm')) {
          return {
            id: addExtension(id, '.js'),
            external: 'absolute'
          }
        }
        if (/\.wasm$/.test(id) || externals.some(external => id === external || id.startsWith(`${external}/`))) {
          return {
            id,
            external: true
          }
        }
        return undefined
      }
    },
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
          terminal,
          viewsContainers,
          ...remainingContribute
        } = manifest.contributes ?? {}

        const {
          activationEvents,
          devDependencies,
          dependencies,
          scripts,
          browser,
          main,
          l10n,
          extensionDependencies, // for pure-d that requires hbenl.vscode-test-explorer
          ...remainingManifest
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } = manifest as any

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
