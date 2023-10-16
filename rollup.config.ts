import json from 'rollup-plugin-json5'
import { visualizer } from 'rollup-plugin-visualizer'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import { string } from 'rollup-plugin-string'
import { babel } from '@rollup/plugin-babel'
import * as rollup from 'rollup'
import builtins from 'rollup-plugin-node-builtins'
import { terser } from 'rollup-plugin-terser'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import pkg from './package.json' assert { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const externals = Object.keys(pkg.dependencies)

const extensions = ['.js', '.ts']

export default rollup.defineConfig({
  cache: false,
  input: {
    main: 'src/index.ts'
  },
  external: function isExternal (source, importer, isResolved) {
    if (isResolved) {
      return false
    }
    if (/\.wasm$/.test(source)) {
      return true
    }
    if ([/\?worker$/].some(reg => reg.test(source))) {
      return false
    }
    return externals.some(external => source === external || source.startsWith(`${external}/`))
  },
  output: [{
    chunkFileNames: '[name].js',
    dir: 'dist',
    format: 'esm',
    paths: {
      'monaco-editor': 'monaco-editor/esm/vs/editor/editor.api',
      'monaco-editor-core': 'monaco-editor/esm/vs/editor/editor.api'
    },
    entryFileNames: (module) => {
      const name = path.join(
        path.dirname(
          path.relative(
            path.join(__dirname, 'src'),
            module.facadeModuleId!
          )
        ),
        module.name
      )
      return `${name}.js`
    }
  }],
  plugins: [
    builtins() as rollup.Plugin,
    webWorkerLoader({
      targetPlatform: 'browser',
      pattern: /(.+)\?worker$/,
      plugins: [terser()]
    }),
    nodeResolve({
      extensions
    }),
    commonjs({
      esmExternals: (id) => id.match(/^monaco-editor(\/.*)?/) != null // required for monaco-emacs with use import monaco-editor esm code from commonjs code
    }),
    babel({
      extensions,
      presets: [
        ['@babel/preset-env', {
          modules: false
        }],
        '@babel/preset-typescript'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining'
      ],
      babelHelpers: 'bundled',
      exclude: /node_modules\//
    }),
    json(),
    visualizer(),
    alias({
      entries: [{
        find: /^monaco-editor-core\//,
        replacement: 'monaco-editor/'
      }, {
        find: /^(monaco-editor|monaco-editor-core)$/,
        replacement: 'monaco-editor/esm/vs/editor/editor.api'
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
