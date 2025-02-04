import { ExtensionHostKind, registerExtension } from '@codingame/monaco-vscode-api/extensions'

const { registerFileUrl } = registerExtension({
  name: 'cobol-indent',
  publisher: 'codingame',
  version: '1.0.0',
  engines: {
    vscode: '*'
  },
  activationEvents: ['onLanguage:cobol'],
  contributes: {
    commands: [{
      command: 'cobol-indent',
      title: 'Indent cobol',
      enablement: 'editorLangId == cobol && !inSnippetMode'
    }, {
      command: 'cobol-unindent',
      title: 'Unindent cobol',
      enablement: 'editorLangId == cobol && !inSnippetMode'
    }],
    keybindings: [{
      command: 'cobol-indent',
      key: 'tab',
      when: 'editorLangId == cobol && !inSnippetMode'
    }, {
      command: 'cobol-unindent',
      key: 'shift+tab',
      when: 'editorLangId == cobol && !inSnippetMode'
    }]
  },
  browser: './extension.js'
}, ExtensionHostKind.LocalWebWorker)

registerFileUrl('./extension.js', new URL('./cobol-extension.js', import.meta.url).href)
