import * as monaco from 'monaco-editor'
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
  text: string
): monaco.editor.IIdentifiedSingleEditOperation {
  return {
    range,
    text
  }
}

export function createDefaultTestLockedCodeRanges (model: monaco.editor.ITextModel): monaco.Range[] {
  return [
    createTestRange(model, 3, 5),
    createTestRange(model, 12, 14),
    createTestRange(model, 18, 20)
  ]
}
