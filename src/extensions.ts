import { whenReady as whenThemeReady } from '@codingame/monaco-vscode-theme-defaults-default-extension'
import { whenReady as whenClojureReady } from '@codingame/monaco-vscode-clojure-default-extension'
import { whenReady as whenCoffeescriptReady } from '@codingame/monaco-vscode-coffeescript-default-extension'
import { whenReady as whenCppReady } from '@codingame/monaco-vscode-cpp-default-extension'
import { whenReady as whenCsharpReady } from '@codingame/monaco-vscode-csharp-default-extension'
import { whenReady as whenCssReady } from '@codingame/monaco-vscode-css-default-extension'
import { whenReady as whenDiffReady } from '@codingame/monaco-vscode-diff-default-extension'
import { whenReady as whenFSharpReady } from '@codingame/monaco-vscode-fsharp-default-extension'
import { whenReady as whenGoReady } from '@codingame/monaco-vscode-go-default-extension'
import { whenReady as whenGroovyReady } from '@codingame/monaco-vscode-groovy-default-extension'
import { whenReady as whenHtmlReady } from '@codingame/monaco-vscode-html-default-extension'
import { whenReady as whenJavaReady } from '@codingame/monaco-vscode-java-default-extension'
import { whenReady as whenJavascriptReady } from '@codingame/monaco-vscode-javascript-default-extension'
import { whenReady as whenJsonReady } from '@codingame/monaco-vscode-json-default-extension'
import { whenReady as whenJuliaReady } from '@codingame/monaco-vscode-julia-default-extension'
import { whenReady as whenLuaReady } from '@codingame/monaco-vscode-lua-default-extension'
import { whenReady as whenMarkdownReady } from '@codingame/monaco-vscode-markdown-basics-default-extension'
import { whenReady as whenObjcReady } from '@codingame/monaco-vscode-objective-c-default-extension'
import { whenReady as whenPerlReady } from '@codingame/monaco-vscode-perl-default-extension'
import { whenReady as whenPhpReady } from '@codingame/monaco-vscode-php-default-extension'
import { whenReady as whenPowershellReady } from '@codingame/monaco-vscode-powershell-default-extension'
import { whenReady as whenPythonReady } from '@codingame/monaco-vscode-python-default-extension'
import { whenReady as whenRReady } from '@codingame/monaco-vscode-r-default-extension'
import { whenReady as whenRubyReady } from '@codingame/monaco-vscode-ruby-default-extension'
import { whenReady as whenRustReady } from '@codingame/monaco-vscode-rust-default-extension'
import { whenReady as whenScssReady } from '@codingame/monaco-vscode-scss-default-extension'
import { whenReady as whenShellScriptReady } from '@codingame/monaco-vscode-shellscript-default-extension'
import { whenReady as whenSqlReady } from '@codingame/monaco-vscode-sql-default-extension'
import { whenReady as whenSwiftReady } from '@codingame/monaco-vscode-swift-default-extension'
import { whenReady as whenTypescriptReady } from '@codingame/monaco-vscode-typescript-basics-default-extension'
import { whenReady as whenVbReady } from '@codingame/monaco-vscode-vb-default-extension'
import { whenReady as wheXmlReady } from '@codingame/monaco-vscode-xml-default-extension'
import { whenReady as whenYamlReady } from '@codingame/monaco-vscode-yaml-default-extension'
import { whenReady as whenNpmReady } from '@codingame/monaco-vscode-npm-default-extension'
import { whenReady as whenOtherExtensionsReady } from '../extensions/*.vsix'

export async function whenReady(): Promise<void> {
  await Promise.allSettled([
    whenThemeReady(),
    whenClojureReady(),
    whenCoffeescriptReady(),
    whenCppReady(),
    whenCsharpReady(),
    whenCssReady(),
    whenDiffReady(),
    whenFSharpReady(),
    whenGoReady(),
    whenGroovyReady(),
    whenHtmlReady(),
    whenJavaReady(),
    whenJavascriptReady(),
    whenJsonReady(),
    whenJuliaReady(),
    whenLuaReady(),
    whenMarkdownReady(),
    whenObjcReady(),
    whenPerlReady(),
    whenPhpReady(),
    whenPowershellReady(),
    whenPythonReady(),
    whenRReady(),
    whenRubyReady(),
    whenRustReady(),
    whenScssReady(),
    whenShellScriptReady(),
    whenSqlReady(),
    whenSwiftReady(),
    whenTypescriptReady(),
    whenVbReady(),
    wheXmlReady(),
    whenYamlReady(),
    whenNpmReady(),
    whenOtherExtensionsReady()
  ])
}
