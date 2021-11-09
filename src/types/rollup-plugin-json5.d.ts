declare module 'rollup-plugin-json5' {
  import { Plugin } from 'rollup'
  const json: (options?: {
    include?: Array<string | RegExp> | string | RegExp | null
    exclude?: Array<string | RegExp> | string | RegExp | null
    test?: (id: string) => boolean
    indent?: string
  }) => Plugin
  export default json
}
