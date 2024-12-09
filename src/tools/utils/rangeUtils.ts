import * as monaco from 'monaco-editor'

export function getRangesFromDecorations (
  editor: monaco.editor.ICodeEditor,
  decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean
): monaco.Range[] {
  const model = editor.getModel()
  if (model == null) {
    return []
  }

  return model
    .getAllDecorations()
    .filter(decorationFilter)
    .map((decoration) => decoration.range)
}

export function minusRanges (uniqueRange: monaco.Range, ranges: monaco.Range[]): monaco.Range[] {
  const newRanges: monaco.Range[] = []
  let lastEndPosition = uniqueRange.getStartPosition()
  const intersectingRanges = ranges.filter(range => monaco.Range.areIntersecting(range, uniqueRange))

  for (const range of intersectingRanges) {
    const newRange = monaco.Range.fromPositions(lastEndPosition, range.getStartPosition())
    lastEndPosition = range.getEndPosition()
    newRanges.push(newRange)
  }

  if (lastEndPosition.isBeforeOrEqual(uniqueRange.getEndPosition())) {
    newRanges.push(monaco.Range.fromPositions(lastEndPosition, uniqueRange.getEndPosition()))
  }

  return newRanges
}

export function getLockedRanges (
  editor: monaco.editor.ICodeEditor,
  decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean,
  withDecoration: boolean
): monaco.Range[] {
  const model = editor.getModel()
  if (model == null) {
    return []
  }

  const fullModelRange = model.getFullModelRange()
  const ranges = getRangesFromDecorations(editor, decorationFilter)
  return withDecoration ? ranges : minusRanges(fullModelRange, ranges)
}
