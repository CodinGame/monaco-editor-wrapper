declare module 'rollup-plugin-uglify' {
  import { Plugin } from 'rollup'
  const uglify: (userConfig?: {
    numWorkers?: number
  }) => Plugin
  export { uglify }
}
