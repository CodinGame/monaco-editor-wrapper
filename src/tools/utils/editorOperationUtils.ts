import * as monaco from 'monaco-editor'
import { ValidAnnotatedEditOperation } from 'vscode/vscode/vs/editor/common/model'
import { getLockedRanges, minusRanges } from './rangeUtils'

export class LockedCodeError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'LockedCodeError'
    Object.setPrototypeOf(this, LockedCodeError.prototype)
  }
}

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
    return [oldOperation]
  }

  return splitText.map((text, index) => createNewOperation(oldOperation, editableRanges[index]!, text, index))
}

function tryIgnoreLockedCodeTextForOperation (
  model: monaco.editor.ITextModel,
  uneditableRangesInOperationRange: monaco.Range[],
  operationText: string | null
): (string | null)[] {
  if (operationText == null || operationText === '') {
    if (uneditableRangesInOperationRange.length > 0) {
      throw new LockedCodeError('Cannot delete locked code sections')
    }
    return [operationText]
  }

  const splitText: string[] = []
  const uneditableRangesText = uneditableRangesInOperationRange.map(range => model.getValueInRange(range))
  let currentRange: number = 0
  let remainingText: string = operationText
  while (remainingText.length > 0 && currentRange < uneditableRangesText.length) {
    const rangeText = uneditableRangesText[currentRange]
    if (rangeText != null && rangeText !== '') {
      const rangeTextIndex = remainingText.indexOf(rangeText)

      if (rangeTextIndex === -1) {
        throw new LockedCodeError('Cannot edit locked code sections')
      }

      const currentUneditableRange = uneditableRangesInOperationRange[currentRange]!
      if (rangeTextIndex !== 0) {
        let textToKeep = remainingText.slice(0, rangeTextIndex)
        if (textToKeep.endsWith('\n') && currentUneditableRange.startColumn === 1) {
          textToKeep = textToKeep.slice(0, textToKeep.length - 1)
        }
        splitText.push(textToKeep)
      }

      const uneditableRangeMaxEndColumn = model.getLineMaxColumn(currentUneditableRange.endLineNumber)
      remainingText = remainingText.slice(rangeTextIndex + rangeText.length)
      if (remainingText.startsWith('\n') && currentUneditableRange.endColumn === uneditableRangeMaxEndColumn) {
        remainingText = remainingText.slice(1, remainingText.length)
      }
    }
    currentRange++
  }

  if (remainingText !== '') {
    splitText.push(remainingText.endsWith('\n') ? remainingText.slice(0, remainingText.length - 1) : remainingText)
  }
  return splitText
}

export function tryIgnoreLockedCodeForOperations (
  model: monaco.editor.ITextModel,
  operations: ValidAnnotatedEditOperation[],
  uneditableRanges: monaco.Range[]
): ValidAnnotatedEditOperation[] {
  let newOperations: ValidAnnotatedEditOperation[] = []
  for (const operation of operations) {
    const {
      firstRanges: operationEditableRanges,
      secondRanges: operationUneditableRanges
    } = minusRanges(model, operation.range, uneditableRanges)
    const splitText = tryIgnoreLockedCodeTextForOperation(model, operationUneditableRanges, operation.text)
    newOperations = [
      ...newOperations,
      ...createNewOperationsFromRanges(operation, operationEditableRanges, splitText)
    ]
  }
  return newOperations
}

export function tryIgnoreLockedCode (
  model: monaco.editor.ITextModel,
  decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean,
  editorOperations: ValidAnnotatedEditOperation[],
  withDecoration: boolean
): ValidAnnotatedEditOperation[] {
  const uneditableRanges = getLockedRanges(model, decorationFilter, withDecoration)
  if (uneditableRanges.length <= 0) {
    return editorOperations
  }

  return tryIgnoreLockedCodeForOperations(model, editorOperations, uneditableRanges)
}
