import json from 'rollup-plugin-json5'
import visualizer from 'rollup-plugin-visualizer'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import { string } from 'rollup-plugin-string'
import eslint from '@rollup/plugin-eslint'
import { babel } from '@rollup/plugin-babel'
import * as rollup from 'rollup'
import builtins from 'rollup-plugin-node-builtins'
import pkg from './package.json'

const externals = Object.keys(pkg.dependencies)

const extensions = ['.js', '.ts']

export default rollup.defineConfig({
  cache: false,
  input: {
    main: 'src/index.ts',
    jsonContribution: 'src/features/jsonContribution.ts',
    typescriptContribution: 'src/features/typescriptContribution.ts',
    htmlContribution: 'src/features/htmlContribution.ts',
    cssContribution: 'src/features/cssContribution.ts'
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
    return externals.some(external => source.startsWith(external))
  },
  output: [{
    chunkFileNames: '[name].js',
    dir: 'dist',
    format: 'esm',
    paths: {
      'monaco-editor': 'monaco-editor/esm/vs/editor/edcore.main',
      'monaco-editor-core': 'monaco-editor/esm/vs/editor/edcore.main'
    }
  }],
  plugins: [
    builtins() as rollup.Plugin,
    webWorkerLoader({
      targetPlatform: 'browser',
      pattern: /(.+)\?worker$/
    }),
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ['**/*.ts']
    }),
    nodeResolve({
      extensions
    }),
    commonjs(),
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
        replacement: 'monaco-editor/esm/vs/editor/edcore.main'
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
