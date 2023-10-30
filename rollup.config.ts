import { visualizer } from 'rollup-plugin-visualizer'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { string } from 'rollup-plugin-string'
import typescript from '@rollup/plugin-typescript'
import * as rollup from 'rollup'
import builtins from 'rollup-plugin-node-builtins'
import globImport from 'rollup-plugin-glob-import'
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin'
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
    'features/debug': 'src/features/debug.ts'
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
    entryFileNames: '[name].js'
  }],
  plugins: [
    builtins(),
    globImport({
      format: 'import'
    }),
    vsixPlugin({
      rollupPlugins: [],
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
    string({
      include: /.*\.d\.ts$/
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
