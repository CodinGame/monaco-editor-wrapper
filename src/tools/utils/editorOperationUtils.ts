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

function getLockedRangeValueIndexesInText (
  editor: monaco.editor.ICodeEditor,
  range: monaco.Range,
  text: string
): {
  startIndex: number | null
  endIndex: number | null
} {
  const model = editor.getModel()
  if (model == null) {
    return { startIndex: null, endIndex: null }
  }

  const rangeValue = model.getValueInRange(range)
  const startIndex = text.indexOf(rangeValue)
  return {
    startIndex,
    endIndex: startIndex + rangeValue.length
  }
}

function computeNewOperationsWithIntersectingLockedCode (
  editor: monaco.editor.ICodeEditor,
  operation: ValidAnnotatedEditOperation,
  uneditableRanges: monaco.Range[]
): ValidAnnotatedEditOperation[] {
  const newOperations: ValidAnnotatedEditOperation[] = []
  const editableRanges: monaco.Range[] = minusRanges(operation.range, uneditableRanges)

  // Index of the current uneditable range in the text
  let uneditableRangeIndex: number = 0
  // Index of the current editable range in the text
  let editableRangeIndex: number = 0
  // The operation text is null or an empty string when it's a delete
  let remainingText: string = operation.text ?? ''

  do {
    const editableRange = editableRanges[editableRangeIndex]
    if (editableRange == null) {
      // There are no editable ranges left
      return newOperations
    }

    const uneditableRange = uneditableRanges[uneditableRangeIndex]
    if (uneditableRange == null) {
      // There are no more locked ranges
      return [
        ...newOperations,
        createNewOperation(operation, editableRange, remainingText, editableRangeIndex)
      ]
    }

    const { startIndex, endIndex } = getLockedRangeValueIndexesInText(editor, uneditableRange, remainingText)
    if (startIndex == null || endIndex == null) {
      return newOperations
    } else if (startIndex === -1) {
      // The uneditable text is not in the remaining operation text
      return [
        ...newOperations,
        createNewOperation(operation, editableRange, remainingText, editableRangeIndex)
      ]
      // remainingText = null
    } else if (startIndex === 0) {
      // The uneditable text is at the beginning of the remaining operation text
      uneditableRangeIndex++
      remainingText = remainingText.slice(endIndex)
    } else {
      // The uneditable text is in the middle or at the end of the remaining operation text
      newOperations.push(
        createNewOperation(operation, editableRange, remainingText.slice(0, startIndex), editableRangeIndex)
      )
      uneditableRangeIndex++
      editableRangeIndex++
      remainingText = remainingText.slice(endIndex)
    }
  } while (remainingText.length > 0)

  return newOperations
}

export function computeNewOperationsForLockedCode (
  editor: monaco.editor.ICodeEditor,
  decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean,
  editorOperations: ValidAnnotatedEditOperation[],
  withDecoration: boolean
): ValidAnnotatedEditOperation[] {
  const uneditableRanges = getLockedRanges(editor, decorationFilter, withDecoration)
  if (uneditableRanges.length <= 0) {
    return editorOperations
  }

  const newOperations: ValidAnnotatedEditOperation[] = []
  for (const operation of editorOperations) {
    const operationRange = operation.range
    const uneditableRangesThatIntersects = uneditableRanges.filter(range => monaco.Range.areIntersecting(range, operationRange))

    if (uneditableRangesThatIntersects.length <= 0) {
      // The operation range doesn't intersect with an uneditable range
      newOperations.push(operation)
    } else {
      // The operation range intersects with one or more uneditable range
      newOperations.push(...computeNewOperationsWithIntersectingLockedCode(editor, operation, uneditableRangesThatIntersects))
    }
  }

  return newOperations
}
