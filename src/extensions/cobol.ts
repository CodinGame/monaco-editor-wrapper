import * as monaco from 'monaco-editor'

const fixedPositions = [0, 6, 7, 11]
const lastFixedPosition = fixedPositions[fixedPositions.length - 1]!

function getIndentWidth (editor: monaco.editor.IStandaloneCodeEditor): number {
  return editor.getModel()!.getOptions().tabSize
}

function findFirstNonSpacePosition (line: string): number {
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== ' ') {
      return i
    }
  }
  return line.length
}

function indentLine (editor: monaco.editor.IStandaloneCodeEditor, lineNumber: number) {
  if (editor.getModel() == null) {
    return
  }
  const line = editor.getModel()!.getLineContent(lineNumber)
  const nonSpacePosition = findFirstNonSpacePosition(line)
  const nextFixedPosition = fixedPositions.find(p => p > nonSpacePosition)

  let expectedIndent = nextFixedPosition
  if (expectedIndent == null) {
    const expectedIndentCount = Math.floor((nonSpacePosition - lastFixedPosition) / getIndentWidth(editor)) + 1
    expectedIndent = lastFixedPosition + getIndentWidth(editor) * expectedIndentCount
  }

  const toInsert = expectedIndent - nonSpacePosition

  const range = new monaco.Range(
    lineNumber,
    1,
    lineNumber,
    1
  )

  editor.executeEdits('indent', [{ range, text: ' '.repeat(toInsert), forceMoveMarkers: true }])
}

function unindentLine (editor: monaco.editor.IStandaloneCodeEditor, lineNumber: number) {
  if (editor.getModel() == null) {
    return
  }
  const line = editor.getModel()!.getLineContent(lineNumber)
  const nonSpacePosition = findFirstNonSpacePosition(line)
  const fixedIndentWidth = getIndentWidth(editor)
  const prevFixedPosition = fixedPositions.slice().reverse().find(p => p < nonSpacePosition) ?? 0

  let expectedIndent = prevFixedPosition

  if (prevFixedPosition === lastFixedPosition) {
    // Instead of going back to the last fixed position, go to the nearest (prevFixedPosition + tabSize * N) position
    const expectedIndentCount = Math.floor((nonSpacePosition - lastFixedPosition - 1) / fixedIndentWidth)
    expectedIndent = lastFixedPosition + fixedIndentWidth * expectedIndentCount
  }

  const toRemove = nonSpacePosition - expectedIndent

  const range = new monaco.Range(
    lineNumber,
    1,
    lineNumber,
    1 + toRemove
  )

  editor.executeEdits('indent', [{ range, text: '', forceMoveMarkers: true }])
}

export default function setup (editor: monaco.editor.IStandaloneCodeEditor): void {
  editor.addCommand(monaco.KeyCode.Tab, () => {
    editor.getSelections()?.forEach(selection => {
      for (let lineNumber = selection.startLineNumber; lineNumber <= selection.endLineNumber; lineNumber++) {
        indentLine(editor, lineNumber)
      }
    })
  }, 'editorLangId == COBOL && !inSnippetMode')

  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
    editor.getSelections()?.forEach(selection => {
      for (let lineNumber = selection.startLineNumber; lineNumber <= selection.endLineNumber; lineNumber++) {
        unindentLine(editor, lineNumber)
      }
    })
  }, 'editorLangId == COBOL && !inSnippetMode')
}
