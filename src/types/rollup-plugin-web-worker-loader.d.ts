declare module 'rollup-plugin-web-worker-loader' {
  import { Plugin } from 'rollup'
  const workerLoaderPlugin: (userConfig?: {
    targetPlatform?: string
    pattern?: RegExp
    extensions?: string[]
    sourcemap?: boolean
    inline?: boolean
    forceInline?: boolean
    external?: string[]
    preserveSource?: boolean
    preserveFileNames?: boolean
    enableUnicodeSupport?: boolean
    outputFolder?: string
    loadPath?: string
    plugins?: Plugin[]
    skipPlugins?: string[]
}) => Plugin
  export default workerLoaderPlugin
}
