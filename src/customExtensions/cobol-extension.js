const vscode = require('vscode')

const fixedPositions = [0, 6, 7, 11]
const lastFixedPosition = fixedPositions[fixedPositions.length - 1]

function findFirstNonSpacePosition (line) {
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== ' ') {
      return i
    }
  }
  return line.length
}

async function indentEditor (editor) {
  await editor.edit(builder => {
    for (const selection of editor.selections) {
      for (let lineNumber = selection.start.line; lineNumber <= selection.end.line; lineNumber++) {
        const line = editor.document.lineAt(lineNumber).text
        const nonSpacePosition = findFirstNonSpacePosition(line)
        const nextFixedPosition = fixedPositions.find(p => p > nonSpacePosition)

        let expectedIndent = nextFixedPosition
        if (expectedIndent == null) {
          const indentWidth = editor.options.tabSize
          const expectedIndentCount = Math.floor((nonSpacePosition - lastFixedPosition) / indentWidth) + 1
          expectedIndent = lastFixedPosition + (indentWidth) * expectedIndentCount
        }

        const toInsert = expectedIndent - nonSpacePosition

        builder.insert(new vscode.Position(lineNumber, 0), ' '.repeat(toInsert))
      }
    }
  })
}

async function unindentEditor (editor) {
  await editor.edit(builder => {
    for (const selection of editor.selections) {
      for (let lineNumber = selection.start.line; lineNumber <= selection.end.line; lineNumber++) {
        const line = editor.document.lineAt(lineNumber).text
        const nonSpacePosition = findFirstNonSpacePosition(line)
        const fixedIndentWidth = editor.options.tabSize
        const prevFixedPosition = fixedPositions.slice().reverse().find(p => p < nonSpacePosition) ?? 0

        let expectedIndent = prevFixedPosition

        if (prevFixedPosition === lastFixedPosition) {
          // Instead of going back to the last fixed position, go to the nearest (prevFixedPosition + tabSize * N) position
          const expectedIndentCount = Math.floor((nonSpacePosition - lastFixedPosition - 1) / fixedIndentWidth)
          expectedIndent = lastFixedPosition + fixedIndentWidth * expectedIndentCount
        }

        const toRemove = nonSpacePosition - expectedIndent

        builder.delete(new vscode.Range(
          lineNumber,
          0,
          lineNumber,
          0 + toRemove
        ))
      }
    }
  })
}

vscode.commands.registerTextEditorCommand('cobol-indent', indentEditor)
vscode.commands.registerTextEditorCommand('cobol-unindent', unindentEditor)
