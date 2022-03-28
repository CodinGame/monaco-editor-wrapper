
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
  'clojure': async () => (await import(/* webpackChunkName: "language-configuration-clojure" */ './languageConfigurations/clojure.json')).default,
  'coffeescript': async () => (await import(/* webpackChunkName: "language-configuration-coffeescript" */ './languageConfigurations/coffeescript.json')).default,
  'c': async () => (await import(/* webpackChunkName: "language-configuration-c" */ './languageConfigurations/c.json')).default,
  'cpp': async () => (await import(/* webpackChunkName: "language-configuration-cpp" */ './languageConfigurations/cpp.json')).default,
  'cuda-cpp': async () => (await import(/* webpackChunkName: "language-configuration-cuda-cpp" */ './languageConfigurations/cuda-cpp.json')).default,
  'csharp': async () => (await import(/* webpackChunkName: "language-configuration-csharp" */ './languageConfigurations/csharp.json')).default,
  'css': async () => (await import(/* webpackChunkName: "language-configuration-css" */ './languageConfigurations/css.json')).default,
  'fsharp': async () => (await import(/* webpackChunkName: "language-configuration-fsharp" */ './languageConfigurations/fsharp.json')).default,
  'go': async () => (await import(/* webpackChunkName: "language-configuration-go" */ './languageConfigurations/go.json')).default,
  'groovy': async () => (await import(/* webpackChunkName: "language-configuration-groovy" */ './languageConfigurations/groovy.json')).default,
  'html': async () => (await import(/* webpackChunkName: "language-configuration-html" */ './languageConfigurations/html.json')).default,
  'java': async () => (await import(/* webpackChunkName: "language-configuration-java" */ './languageConfigurations/java.json')).default,
  'javascriptreact': async () => (await import(/* webpackChunkName: "language-configuration-javascriptreact" */ './languageConfigurations/javascriptreact.json')).default,
  'javascript': async () => (await import(/* webpackChunkName: "language-configuration-javascript" */ './languageConfigurations/javascript.json')).default,
  'jsx-tags': async () => (await import(/* webpackChunkName: "language-configuration-jsx-tags" */ './languageConfigurations/jsx-tags.json')).default,
  'json': async () => (await import(/* webpackChunkName: "language-configuration-json" */ './languageConfigurations/json.json')).default,
  'jsonc': async () => (await import(/* webpackChunkName: "language-configuration-jsonc" */ './languageConfigurations/jsonc.json')).default,
  'lua': async () => (await import(/* webpackChunkName: "language-configuration-lua" */ './languageConfigurations/lua.json')).default,
  'markdown': async () => (await import(/* webpackChunkName: "language-configuration-markdown" */ './languageConfigurations/markdown.json')).default,
  'objective-c': async () => (await import(/* webpackChunkName: "language-configuration-objective-c" */ './languageConfigurations/objective-c.json')).default,
  'objective-cpp': async () => (await import(/* webpackChunkName: "language-configuration-objective-cpp" */ './languageConfigurations/objective-cpp.json')).default,
  'perl': async () => (await import(/* webpackChunkName: "language-configuration-perl" */ './languageConfigurations/perl.json')).default,
  'perl6': async () => (await import(/* webpackChunkName: "language-configuration-perl6" */ './languageConfigurations/perl6.json')).default,
  'php': async () => (await import(/* webpackChunkName: "language-configuration-php" */ './languageConfigurations/php.json')).default,
  'powershell': async () => (await import(/* webpackChunkName: "language-configuration-powershell" */ './languageConfigurations/powershell.json')).default,
  'python': async () => (await import(/* webpackChunkName: "language-configuration-python" */ './languageConfigurations/python.json')).default,
  'r': async () => (await import(/* webpackChunkName: "language-configuration-r" */ './languageConfigurations/r.json')).default,
  'ruby': async () => (await import(/* webpackChunkName: "language-configuration-ruby" */ './languageConfigurations/ruby.json')).default,
  'rust': async () => (await import(/* webpackChunkName: "language-configuration-rust" */ './languageConfigurations/rust.json')).default,
  'scss': async () => (await import(/* webpackChunkName: "language-configuration-scss" */ './languageConfigurations/scss.json')).default,
  'shellscript': async () => (await import(/* webpackChunkName: "language-configuration-shellscript" */ './languageConfigurations/shellscript.json')).default,
  'sql': async () => (await import(/* webpackChunkName: "language-configuration-sql" */ './languageConfigurations/sql.json')).default,
  'swift': async () => (await import(/* webpackChunkName: "language-configuration-swift" */ './languageConfigurations/swift.json')).default,
  'typescript': async () => (await import(/* webpackChunkName: "language-configuration-typescript" */ './languageConfigurations/typescript.json')).default,
  'typescriptreact': async () => (await import(/* webpackChunkName: "language-configuration-typescriptreact" */ './languageConfigurations/typescriptreact.json')).default,
  'vb': async () => (await import(/* webpackChunkName: "language-configuration-vb" */ './languageConfigurations/vb.json')).default,
  'xml': async () => (await import(/* webpackChunkName: "language-configuration-xml" */ './languageConfigurations/xml.json')).default,
  'xsl': async () => (await import(/* webpackChunkName: "language-configuration-xsl" */ './languageConfigurations/xsl.json')).default,
  'dockercompose': async () => (await import(/* webpackChunkName: "language-configuration-dockercompose" */ './languageConfigurations/dockercompose.json')).default,
  'yaml': async () => (await import(/* webpackChunkName: "language-configuration-yaml" */ './languageConfigurations/yaml.json')).default,
  'd': async () => (await import(/* webpackChunkName: "language-configuration-d" */ './languageConfigurations/d.json')).default,
  'dpp': async () => (await import(/* webpackChunkName: "language-configuration-dpp" */ './languageConfigurations/dpp.json')).default,
  'dscript': async () => (await import(/* webpackChunkName: "language-configuration-dscript" */ './languageConfigurations/dscript.json')).default,
  'dml': async () => (await import(/* webpackChunkName: "language-configuration-dml" */ './languageConfigurations/dml.json')).default,
  'sdl': async () => (await import(/* webpackChunkName: "language-configuration-sdl" */ './languageConfigurations/sdl.json')).default,
  'diet': async () => (await import(/* webpackChunkName: "language-configuration-diet" */ './languageConfigurations/diet.json')).default,
  'dart': async () => (await import(/* webpackChunkName: "language-configuration-dart" */ './languageConfigurations/dart.json')).default,
  'haskell': async () => (await import(/* webpackChunkName: "language-configuration-haskell" */ './languageConfigurations/haskell.json')).default,
  'cabal': async () => (await import(/* webpackChunkName: "language-configuration-cabal" */ './languageConfigurations/cabal.json')).default,
  'literate haskell': async () => (await import(/* webpackChunkName: "language-configuration-literate haskell" */ './languageConfigurations/literate haskell.json')).default,
  'kotlin': async () => (await import(/* webpackChunkName: "language-configuration-kotlin" */ './languageConfigurations/kotlin.json')).default,
  'kotlinscript': async () => (await import(/* webpackChunkName: "language-configuration-kotlinscript" */ './languageConfigurations/kotlinscript.json')).default,
  'ocaml': async () => (await import(/* webpackChunkName: "language-configuration-ocaml" */ './languageConfigurations/ocaml.json')).default,
  'reason': async () => (await import(/* webpackChunkName: "language-configuration-reason" */ './languageConfigurations/reason.json')).default,
  'pascal': async () => (await import(/* webpackChunkName: "language-configuration-pascal" */ './languageConfigurations/pascal.json')).default,
  'scala': async () => (await import(/* webpackChunkName: "language-configuration-scala" */ './languageConfigurations/scala.json')).default,
  'COBOL': async () => (await import(/* webpackChunkName: "language-configuration-COBOL" */ './languageConfigurations/COBOL.json')).default,
  'COBOL Copybook': async () => (await import(/* webpackChunkName: "language-configuration-COBOL Copybook" */ './languageConfigurations/COBOL Copybook.json')).default,
  'elixir': async () => (await import(/* webpackChunkName: "language-configuration-elixir" */ './languageConfigurations/elixir.json')).default,
  'HTML (Eex)': async () => (await import(/* webpackChunkName: "language-configuration-HTML (Eex)" */ './languageConfigurations/HTML (Eex).json')).default,
  'erlang': async () => (await import(/* webpackChunkName: "language-configuration-erlang" */ './languageConfigurations/erlang.json')).default,
  'tcl': async () => (await import(/* webpackChunkName: "language-configuration-tcl" */ './languageConfigurations/tcl.json')).default,
  'systemverilog': async () => (await import(/* webpackChunkName: "language-configuration-systemverilog" */ './languageConfigurations/systemverilog.json')).default,
  'verilog': async () => (await import(/* webpackChunkName: "language-configuration-verilog" */ './languageConfigurations/verilog.json')).default,
  'postgres': async () => (await import(/* webpackChunkName: "language-configuration-postgres" */ './languageConfigurations/postgres.json')).default,
  'aspnetcorerazor': async () => (await import(/* webpackChunkName: "language-configuration-aspnetcorerazor" */ './languageConfigurations/aspnetcorerazor.json')).default,
  'pip-requirements': async () => (await import(/* webpackChunkName: "language-configuration-pip-requirements" */ './languageConfigurations/pip-requirements.json')).default,
  'rd': async () => (await import(/* webpackChunkName: "language-configuration-rd" */ './languageConfigurations/rd.json')).default,
  'rmd': async () => (await import(/* webpackChunkName: "language-configuration-rmd" */ './languageConfigurations/rmd.json')).default,
  'debian-control.r': async () => (await import(/* webpackChunkName: "language-configuration-debian-control.r" */ './languageConfigurations/debian-control.r.json')).default,
  'solidity': async () => (await import(/* webpackChunkName: "language-configuration-solidity" */ './languageConfigurations/solidity.json')).default
} as unknown as Partial<Record<string, () => Promise<RawLanguageConfiguration>>>

export default loader
  