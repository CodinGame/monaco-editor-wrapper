
// Generated file, do not modify
import * as monaco from 'monaco-editor'

export interface RawLanguageConfiguration extends Omit<monaco.extra.ILanguageConfiguration, 'folding'> {
  folding?: Omit<monaco.extra.ILanguageConfiguration['folding'], 'markers'> & {
    markers?: {
      start: string
      end: string
    }
  }
}

/* eslint-disable */
const loader = {
  'clojure': async () => (await import(/* webpackChunkName: "language-configuration-clojure" */ /* webpackMode: "lazy" */ './languageConfigurations/clojure.json')).default,
  'coffeescript': async () => (await import(/* webpackChunkName: "language-configuration-coffeescript" */ /* webpackMode: "lazy" */ './languageConfigurations/coffeescript.json')).default,
  'c': async () => (await import(/* webpackChunkName: "language-configuration-c" */ /* webpackMode: "lazy" */ './languageConfigurations/c.json')).default,
  'cpp': async () => (await import(/* webpackChunkName: "language-configuration-cpp" */ /* webpackMode: "lazy" */ './languageConfigurations/cpp.json')).default,
  'cuda-cpp': async () => (await import(/* webpackChunkName: "language-configuration-cuda-cpp" */ /* webpackMode: "lazy" */ './languageConfigurations/cuda-cpp.json')).default,
  'csharp': async () => (await import(/* webpackChunkName: "language-configuration-csharp" */ /* webpackMode: "lazy" */ './languageConfigurations/csharp.json')).default,
  'css': async () => (await import(/* webpackChunkName: "language-configuration-css" */ /* webpackMode: "lazy" */ './languageConfigurations/css.json')).default,
  'fsharp': async () => (await import(/* webpackChunkName: "language-configuration-fsharp" */ /* webpackMode: "lazy" */ './languageConfigurations/fsharp.json')).default,
  'go': async () => (await import(/* webpackChunkName: "language-configuration-go" */ /* webpackMode: "lazy" */ './languageConfigurations/go.json')).default,
  'groovy': async () => (await import(/* webpackChunkName: "language-configuration-groovy" */ /* webpackMode: "lazy" */ './languageConfigurations/groovy.json')).default,
  'html': async () => (await import(/* webpackChunkName: "language-configuration-html" */ /* webpackMode: "lazy" */ './languageConfigurations/html.json')).default,
  'java': async () => (await import(/* webpackChunkName: "language-configuration-java" */ /* webpackMode: "lazy" */ './languageConfigurations/java.json')).default,
  'javascriptreact': async () => (await import(/* webpackChunkName: "language-configuration-javascriptreact" */ /* webpackMode: "lazy" */ './languageConfigurations/javascriptreact.json')).default,
  'javascript': async () => (await import(/* webpackChunkName: "language-configuration-javascript" */ /* webpackMode: "lazy" */ './languageConfigurations/javascript.json')).default,
  'jsx-tags': async () => (await import(/* webpackChunkName: "language-configuration-jsx-tags" */ /* webpackMode: "lazy" */ './languageConfigurations/jsx-tags.json')).default,
  'json': async () => (await import(/* webpackChunkName: "language-configuration-json" */ /* webpackMode: "lazy" */ './languageConfigurations/json.json')).default,
  'jsonc': async () => (await import(/* webpackChunkName: "language-configuration-jsonc" */ /* webpackMode: "lazy" */ './languageConfigurations/jsonc.json')).default,
  'lua': async () => (await import(/* webpackChunkName: "language-configuration-lua" */ /* webpackMode: "lazy" */ './languageConfigurations/lua.json')).default,
  'markdown': async () => (await import(/* webpackChunkName: "language-configuration-markdown" */ /* webpackMode: "lazy" */ './languageConfigurations/markdown.json')).default,
  'objective-c': async () => (await import(/* webpackChunkName: "language-configuration-objective-c" */ /* webpackMode: "lazy" */ './languageConfigurations/objective-c.json')).default,
  'objective-cpp': async () => (await import(/* webpackChunkName: "language-configuration-objective-cpp" */ /* webpackMode: "lazy" */ './languageConfigurations/objective-cpp.json')).default,
  'perl': async () => (await import(/* webpackChunkName: "language-configuration-perl" */ /* webpackMode: "lazy" */ './languageConfigurations/perl.json')).default,
  'perl6': async () => (await import(/* webpackChunkName: "language-configuration-perl6" */ /* webpackMode: "lazy" */ './languageConfigurations/perl6.json')).default,
  'php': async () => (await import(/* webpackChunkName: "language-configuration-php" */ /* webpackMode: "lazy" */ './languageConfigurations/php.json')).default,
  'powershell': async () => (await import(/* webpackChunkName: "language-configuration-powershell" */ /* webpackMode: "lazy" */ './languageConfigurations/powershell.json')).default,
  'python': async () => (await import(/* webpackChunkName: "language-configuration-python" */ /* webpackMode: "lazy" */ './languageConfigurations/python.json')).default,
  'r': async () => (await import(/* webpackChunkName: "language-configuration-r" */ /* webpackMode: "lazy" */ './languageConfigurations/r.json')).default,
  'ruby': async () => (await import(/* webpackChunkName: "language-configuration-ruby" */ /* webpackMode: "lazy" */ './languageConfigurations/ruby.json')).default,
  'rust': async () => (await import(/* webpackChunkName: "language-configuration-rust" */ /* webpackMode: "lazy" */ './languageConfigurations/rust.json')).default,
  'scss': async () => (await import(/* webpackChunkName: "language-configuration-scss" */ /* webpackMode: "lazy" */ './languageConfigurations/scss.json')).default,
  'shellscript': async () => (await import(/* webpackChunkName: "language-configuration-shellscript" */ /* webpackMode: "lazy" */ './languageConfigurations/shellscript.json')).default,
  'sql': async () => (await import(/* webpackChunkName: "language-configuration-sql" */ /* webpackMode: "lazy" */ './languageConfigurations/sql.json')).default,
  'swift': async () => (await import(/* webpackChunkName: "language-configuration-swift" */ /* webpackMode: "lazy" */ './languageConfigurations/swift.json')).default,
  'typescript': async () => (await import(/* webpackChunkName: "language-configuration-typescript" */ /* webpackMode: "lazy" */ './languageConfigurations/typescript.json')).default,
  'typescriptreact': async () => (await import(/* webpackChunkName: "language-configuration-typescriptreact" */ /* webpackMode: "lazy" */ './languageConfigurations/typescriptreact.json')).default,
  'vb': async () => (await import(/* webpackChunkName: "language-configuration-vb" */ /* webpackMode: "lazy" */ './languageConfigurations/vb.json')).default,
  'xml': async () => (await import(/* webpackChunkName: "language-configuration-xml" */ /* webpackMode: "lazy" */ './languageConfigurations/xml.json')).default,
  'xsl': async () => (await import(/* webpackChunkName: "language-configuration-xsl" */ /* webpackMode: "lazy" */ './languageConfigurations/xsl.json')).default,
  'dockercompose': async () => (await import(/* webpackChunkName: "language-configuration-dockercompose" */ /* webpackMode: "lazy" */ './languageConfigurations/dockercompose.json')).default,
  'yaml': async () => (await import(/* webpackChunkName: "language-configuration-yaml" */ /* webpackMode: "lazy" */ './languageConfigurations/yaml.json')).default,
  'd': async () => (await import(/* webpackChunkName: "language-configuration-d" */ /* webpackMode: "lazy" */ './languageConfigurations/d.json')).default,
  'dpp': async () => (await import(/* webpackChunkName: "language-configuration-dpp" */ /* webpackMode: "lazy" */ './languageConfigurations/dpp.json')).default,
  'dscript': async () => (await import(/* webpackChunkName: "language-configuration-dscript" */ /* webpackMode: "lazy" */ './languageConfigurations/dscript.json')).default,
  'dml': async () => (await import(/* webpackChunkName: "language-configuration-dml" */ /* webpackMode: "lazy" */ './languageConfigurations/dml.json')).default,
  'sdl': async () => (await import(/* webpackChunkName: "language-configuration-sdl" */ /* webpackMode: "lazy" */ './languageConfigurations/sdl.json')).default,
  'diet': async () => (await import(/* webpackChunkName: "language-configuration-diet" */ /* webpackMode: "lazy" */ './languageConfigurations/diet.json')).default,
  'dart': async () => (await import(/* webpackChunkName: "language-configuration-dart" */ /* webpackMode: "lazy" */ './languageConfigurations/dart.json')).default,
  'haskell': async () => (await import(/* webpackChunkName: "language-configuration-haskell" */ /* webpackMode: "lazy" */ './languageConfigurations/haskell.json')).default,
  'cabal': async () => (await import(/* webpackChunkName: "language-configuration-cabal" */ /* webpackMode: "lazy" */ './languageConfigurations/cabal.json')).default,
  'literate haskell': async () => (await import(/* webpackChunkName: "language-configuration-literate haskell" */ /* webpackMode: "lazy" */ './languageConfigurations/literate haskell.json')).default,
  'kotlin': async () => (await import(/* webpackChunkName: "language-configuration-kotlin" */ /* webpackMode: "lazy" */ './languageConfigurations/kotlin.json')).default,
  'kotlinscript': async () => (await import(/* webpackChunkName: "language-configuration-kotlinscript" */ /* webpackMode: "lazy" */ './languageConfigurations/kotlinscript.json')).default,
  'ocaml': async () => (await import(/* webpackChunkName: "language-configuration-ocaml" */ /* webpackMode: "lazy" */ './languageConfigurations/ocaml.json')).default,
  'reason': async () => (await import(/* webpackChunkName: "language-configuration-reason" */ /* webpackMode: "lazy" */ './languageConfigurations/reason.json')).default,
  'pascal': async () => (await import(/* webpackChunkName: "language-configuration-pascal" */ /* webpackMode: "lazy" */ './languageConfigurations/pascal.json')).default,
  'scala': async () => (await import(/* webpackChunkName: "language-configuration-scala" */ /* webpackMode: "lazy" */ './languageConfigurations/scala.json')).default,
  'COBOL': async () => (await import(/* webpackChunkName: "language-configuration-COBOL" */ /* webpackMode: "lazy" */ './languageConfigurations/COBOL.json')).default,
  'COBOL Copybook': async () => (await import(/* webpackChunkName: "language-configuration-COBOL Copybook" */ /* webpackMode: "lazy" */ './languageConfigurations/COBOL Copybook.json')).default,
  'elixir': async () => (await import(/* webpackChunkName: "language-configuration-elixir" */ /* webpackMode: "lazy" */ './languageConfigurations/elixir.json')).default,
  'HTML (Eex)': async () => (await import(/* webpackChunkName: "language-configuration-HTML (Eex)" */ /* webpackMode: "lazy" */ './languageConfigurations/HTML (Eex).json')).default,
  'erlang': async () => (await import(/* webpackChunkName: "language-configuration-erlang" */ /* webpackMode: "lazy" */ './languageConfigurations/erlang.json')).default,
  'tcl': async () => (await import(/* webpackChunkName: "language-configuration-tcl" */ /* webpackMode: "lazy" */ './languageConfigurations/tcl.json')).default,
  'systemverilog': async () => (await import(/* webpackChunkName: "language-configuration-systemverilog" */ /* webpackMode: "lazy" */ './languageConfigurations/systemverilog.json')).default,
  'verilog': async () => (await import(/* webpackChunkName: "language-configuration-verilog" */ /* webpackMode: "lazy" */ './languageConfigurations/verilog.json')).default,
  'postgres': async () => (await import(/* webpackChunkName: "language-configuration-postgres" */ /* webpackMode: "lazy" */ './languageConfigurations/postgres.json')).default,
  'aspnetcorerazor': async () => (await import(/* webpackChunkName: "language-configuration-aspnetcorerazor" */ /* webpackMode: "lazy" */ './languageConfigurations/aspnetcorerazor.json')).default,
  'pip-requirements': async () => (await import(/* webpackChunkName: "language-configuration-pip-requirements" */ /* webpackMode: "lazy" */ './languageConfigurations/pip-requirements.json')).default,
  'rd': async () => (await import(/* webpackChunkName: "language-configuration-rd" */ /* webpackMode: "lazy" */ './languageConfigurations/rd.json')).default,
  'rmd': async () => (await import(/* webpackChunkName: "language-configuration-rmd" */ /* webpackMode: "lazy" */ './languageConfigurations/rmd.json')).default,
  'debian-control.r': async () => (await import(/* webpackChunkName: "language-configuration-debian-control.r" */ /* webpackMode: "lazy" */ './languageConfigurations/debian-control.r.json')).default,
  'solidity': async () => (await import(/* webpackChunkName: "language-configuration-solidity" */ /* webpackMode: "lazy" */ './languageConfigurations/solidity.json')).default,
  'svelte': async () => (await import(/* webpackChunkName: "language-configuration-svelte" */ /* webpackMode: "lazy" */ './languageConfigurations/svelte.json')).default
} as unknown as Partial<Record<string, () => Promise<RawLanguageConfiguration>>>

export default loader
  