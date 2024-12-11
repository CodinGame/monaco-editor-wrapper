import * as monaco from 'monaco-editor'
import { ValidAnnotatedEditOperation } from 'vscode/vscode/vs/editor/common/model'
import { getLockedRanges, minusRanges } from './rangeUtils'

function createNewOperation (
  oldOperation: ValidAnnotatedEditOperation,
  newRange: monaco.Range,
  newText: string | null,
  index: number
): ValidAnnotatedEditOperation {
  const identifier = oldOperation.identifier != null
    ? { major: oldOperation.identifier.major, minor: oldOperation.identifier.minor + index }
    : null
  return new ValidAnnotatedEditOperation(
    identifier,
    newRange,
    newText,
    oldOperation.forceMoveMarkers,
    oldOperation.isAutoWhitespaceEdit,
    oldOperation._isTracked
  )
}

function createNewOperationsFromRanges (
  oldOperation: ValidAnnotatedEditOperation,
  editableRanges: monaco.Range[],
  splitText: (string | null)[]
): ValidAnnotatedEditOperation[] {
  if (editableRanges.length <= 0) {
    return []
  }

  if (splitText.length === 1 && (splitText[0] == null || splitText[0] === '')) {
    return [createNewOperation(oldOperation, oldOperation.range, splitText[0] ?? null, 0)]
  }

  return splitText.map((text, index) => createNewOperation(oldOperation, editableRanges[index]!, text, index))
}

function splitOperationText (
  editor: monaco.editor.ICodeEditor,
  uneditableRanges: monaco.Range[],
  text: string | null
): (string | null)[] {
  if (text == null || text === '') {
    return [text]
  }

  const model = editor.getModel()
  if (model == null) {
    return []
  }

  const splitText: string[] = []
  const uneditableRangesText = uneditableRanges.map(range => model.getValueInRange(range))
  let currentRange: number = 0
  let textToSplit: string = text
  while (textToSplit !== '' && currentRange < uneditableRangesText.length) {
    const rangeText = uneditableRangesText[currentRange]
    if (rangeText != null && rangeText !== '') {
      const rangeTextIndex = textToSplit.indexOf(rangeText)
      splitText.push(textToSplit.slice(0, rangeTextIndex))
      textToSplit = textToSplit.slice(rangeTextIndex + rangeText.length)
    }
    currentRange++
  }

  if (textToSplit !== '') {
    splitText.push(textToSplit)
  }
  return splitText
}

function splitOperationsForLockedCode (
  editor: monaco.editor.ICodeEditor,
  operations: ValidAnnotatedEditOperation[],
  uneditableRanges: monaco.Range[]
): ValidAnnotatedEditOperation[] {
  let newOperations: ValidAnnotatedEditOperation[] = []
  for (const operation of operations) {
    const {
      firstRanges: operationEditableRanges,
      secondRanges: operationUneditableRanges
    } = minusRanges(editor, operation.range, uneditableRanges)
    const splitText = splitOperationText(editor, operationUneditableRanges, operation.text)
    newOperations = [
      ...newOperations,
      ...createNewOperationsFromRanges(operation, operationEditableRanges, splitText)
    ]
  }
  return newOperations
}

export function computeNewOperationsForLockedCode (
  editor: monaco.editor.ICodeEditor,
  decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean,
  editorOperations: ValidAnnotatedEditOperation[],
  withDecoration: boolean
): ValidAnnotatedEditOperation[] {
  const model = editor.getModel()
  if (model == null) {
    return []
  }

  const uneditableRanges = getLockedRanges(editor, decorationFilter, withDecoration)
  if (uneditableRanges.length <= 0) {
    return editorOperations
  }

  return splitOperationsForLockedCode(editor, editorOperations, uneditableRanges)
}
