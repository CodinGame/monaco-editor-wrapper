declare module 'rollup-plugin-string' {
  import { Plugin } from 'rollup'
  const string: (options?: {
    include: Array<string | RegExp> | string | RegExp | null
    exclude?: Array<string | RegExp> | string | RegExp | null
  }) => Plugin
  export { string }
}
