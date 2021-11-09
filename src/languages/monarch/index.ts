import * as monaco from 'monaco-editor'

interface MonarchLanguage {
  conf?: monaco.languages.LanguageConfiguration
  language: monaco.languages.IMonarchLanguage
}

export const languageLoader: Partial<Record<string, () => Promise<MonarchLanguage>>> = {
  clojure: () => import(/* webpackChunkName: "monarch-language-clojure" */'monaco-editor/esm/vs/basic-languages/clojure/clojure'),
  coffee: () => import(/* webpackChunkName: "monarch-language-coffee" */'monaco-editor/esm/vs/basic-languages/coffee/coffee'),
  cpp: () => import(/* webpackChunkName: "monarch-language-cpp" */'monaco-editor/esm/vs/basic-languages/cpp/cpp'),
  c: () => import(/* webpackChunkName: "monarch-language-cpp" */'monaco-editor/esm/vs/basic-languages/cpp/cpp'),
  csharp: () => import(/* webpackChunkName: "monarch-language-csharp" */'monaco-editor/esm/vs/basic-languages/csharp/csharp'),
  elixir: () => import(/* webpackChunkName: "monarch-language-elixir" */'monaco-editor/esm/vs/basic-languages/elixir/elixir'),
  fsharp: () => import(/* webpackChunkName: "monarch-language-fsharp" */'monaco-editor/esm/vs/basic-languages/fsharp/fsharp'),
  go: () => import(/* webpackChunkName: "monarch-language-go" */'monaco-editor/esm/vs/basic-languages/go/go'),
  java: () => import(/* webpackChunkName: "monarch-language-java" */'monaco-editor/esm/vs/basic-languages/java/java'),
  javascript: () => import(/* webpackChunkName: "monarch-language-javascript" */'monaco-editor/esm/vs/basic-languages/javascript/javascript'),
  kotlin: () => import(/* webpackChunkName: "monarch-language-kotlin" */'monaco-editor/esm/vs/basic-languages/kotlin/kotlin'),
  lua: () => import(/* webpackChunkName: "monarch-language-lua" */'monaco-editor/esm/vs/basic-languages/lua/lua'),
  markdown: () => import(/* webpackChunkName: "monarch-language-markdown" */'monaco-editor/esm/vs/basic-languages/markdown/markdown'),
  'objective-c': () => import(/* webpackChunkName: "monarch-language-objective-c" */'monaco-editor/esm/vs/basic-languages/objective-c/objective-c'),
  pascal: () => import(/* webpackChunkName: "monarch-language-pascal" */'monaco-editor/esm/vs/basic-languages/pascal/pascal'),
  perl: () => import(/* webpackChunkName: "monarch-language-perl" */'monaco-editor/esm/vs/basic-languages/perl/perl'),
  postgres: () => import(/* webpackChunkName: "monarch-language-pgsql" */'monaco-editor/esm/vs/basic-languages/pgsql/pgsql'),
  php: () => import(/* webpackChunkName: "monarch-language-php" */'monaco-editor/esm/vs/basic-languages/php/php'),
  powershell: () => import(/* webpackChunkName: "monarch-language-powershell" */'monaco-editor/esm/vs/basic-languages/powershell/powershell'),
  python: () => import(/* webpackChunkName: "monarch-language-python" */'monaco-editor/esm/vs/basic-languages/python/python'),
  r: () => import(/* webpackChunkName: "monarch-language-r" */'monaco-editor/esm/vs/basic-languages/r/r'),
  ruby: () => import(/* webpackChunkName: "monarch-language-ruby" */'monaco-editor/esm/vs/basic-languages/ruby/ruby'),
  rust: () => import(/* webpackChunkName: "monarch-language-rust" */'monaco-editor/esm/vs/basic-languages/rust/rust'),
  scala: () => import(/* webpackChunkName: "monarch-language-scala" */'monaco-editor/esm/vs/basic-languages/scala/scala'),
  scss: () => import(/* webpackChunkName: "monarch-language-scss" */'monaco-editor/esm/vs/basic-languages/scss/scss'),
  shell: () => import(/* webpackChunkName: "monarch-language-shell" */'monaco-editor/esm/vs/basic-languages/shell/shell'),
  sql: () => import(/* webpackChunkName: "monarch-language-sql" */'monaco-editor/esm/vs/basic-languages/sql/sql'),
  'stub-generator': () => import(/* webpackChunkName: "monarch-language-stub-generator" */'./stub-generator'),
  swift: () => import(/* webpackChunkName: "monarch-language-swift" */'monaco-editor/esm/vs/basic-languages/swift/swift'),
  tcl: () => import(/* webpackChunkName: "monarch-language-tcl" */'monaco-editor/esm/vs/basic-languages/tcl/tcl'),
  typescript: () => import(/* webpackChunkName: "monarch-language-typescript" */'monaco-editor/esm/vs/basic-languages/typescript/typescript'),
  vb: () => import(/* webpackChunkName: "monarch-language-vb" */'monaco-editor/esm/vs/basic-languages/vb/vb'),
  xml: () => import(/* webpackChunkName: "monarch-language-xml" */'monaco-editor/esm/vs/basic-languages/xml/xml'),
  yaml: () => import(/* webpackChunkName: "monarch-language-yaml" */'monaco-editor/esm/vs/basic-languages/yaml/yaml')
}
