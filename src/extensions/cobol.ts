import { ExtensionHostKind, registerExtension } from 'vscode/extensions'
import type * as vscode from 'vscode'

const fixedPositions = [0, 6, 7, 11]
const lastFixedPosition = fixedPositions[fixedPositions.length - 1]!

function findFirstNonSpacePosition (line: string): number {
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== ' ') {
      return i
    }
  }
  return line.length
}

const { getApi } = registerExtension({
  name: 'cobol-indent',
  publisher: 'codingame',
  version: '1.0.0',
  engines: {
    vscode: '*'
  },
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
  }
}, ExtensionHostKind.LocalProcess)

void getApi().then(api => {
  async function indentEditor (editor: vscode.TextEditor) {
    await editor.edit(builder => {
      for (const selection of editor.selections) {
        for (let lineNumber = selection.start.line; lineNumber <= selection.end.line; lineNumber++) {
          const line = editor.document.lineAt(lineNumber).text
          const nonSpacePosition = findFirstNonSpacePosition(line)
          const nextFixedPosition = fixedPositions.find(p => p > nonSpacePosition)

          let expectedIndent = nextFixedPosition
          if (expectedIndent == null) {
            const indentWidth = editor.options.tabSize as number
            const expectedIndentCount = Math.floor((nonSpacePosition - lastFixedPosition) / indentWidth) + 1
            expectedIndent = lastFixedPosition + (indentWidth) * expectedIndentCount
          }

          const toInsert = expectedIndent - nonSpacePosition

          builder.insert(new api.Position(lineNumber, 0), ' '.repeat(toInsert))
        }
      }
    })
  }

  async function unindentEditor (editor: vscode.TextEditor) {
    await editor.edit(builder => {
      for (const selection of editor.selections) {
        for (let lineNumber = selection.start.line; lineNumber <= selection.end.line; lineNumber++) {
          const line = editor.document.lineAt(lineNumber).text
          const nonSpacePosition = findFirstNonSpacePosition(line)
          const fixedIndentWidth = editor.options.tabSize as number
          const prevFixedPosition = fixedPositions.slice().reverse().find(p => p < nonSpacePosition) ?? 0

          let expectedIndent = prevFixedPosition

          if (prevFixedPosition === lastFixedPosition) {
            // Instead of going back to the last fixed position, go to the nearest (prevFixedPosition + tabSize * N) position
            const expectedIndentCount = Math.floor((nonSpacePosition - lastFixedPosition - 1) / fixedIndentWidth)
            expectedIndent = lastFixedPosition + fixedIndentWidth * expectedIndentCount
          }

          const toRemove = nonSpacePosition - expectedIndent

          builder.delete(new api.Range(
            lineNumber,
            0,
            lineNumber,
            0 + toRemove
          ))
        }
      }
    })
  }

  api.commands.registerTextEditorCommand('cobol-indent', indentEditor)
  api.commands.registerTextEditorCommand('cobol-unindent', unindentEditor)
})
