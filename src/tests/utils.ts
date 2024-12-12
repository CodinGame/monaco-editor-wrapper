import * as monaco from 'monaco-editor'
import { ISingleEditOperationIdentifier, ValidAnnotatedEditOperation } from 'vscode/vscode/vs/editor/common/model'
import { EDITOR_DEFAULT_CODE } from './constants'

export function createTestModel (content: string, language: string = 'typescript'): monaco.editor.ITextModel {
  return monaco.editor.createModel(content, language)
}

export function createDefaultTestModel (): monaco.editor.ITextModel {
  return createTestModel(EDITOR_DEFAULT_CODE)
}

export function createTestRange (
  model: monaco.editor.ITextModel,
  startLine: number,
  endLine: number,
  startColumn: number = 1,
  endColumn: number = model.getLineMaxColumn(endLine)
): monaco.Range {
  return new monaco.Range(startLine, startColumn, endLine, endColumn)
}

export function createTestOperation (
  range: monaco.Range,
  text: string,
  identifier?: ISingleEditOperationIdentifier
): ValidAnnotatedEditOperation {
  return new ValidAnnotatedEditOperation(
    identifier ?? { major: 0, minor: 0 },
    range,
    text,
    false,
    false,
    false
  )
}

export function createDefaultTestLockedCodeRanges (model: monaco.editor.ITextModel): monaco.Range[] {
  return [
    createTestRange(model, 3, 5),
    createTestRange(model, 12, 14),
    createTestRange(model, 18, 20)
  ]
}

export function canTestOperationsEditRanges (splitOperations: ValidAnnotatedEditOperation[], uneditableRanges: monaco.Range[]): boolean {
  if (splitOperations.length <= 0) {
    return false
  }

  return splitOperations.every(({ range }) =>
    uneditableRanges.every((uneditableRange) => !monaco.Range.areIntersectingOrTouching(uneditableRange, range))
  )
}
