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

export function minusRanges (
  editor: monaco.editor.ICodeEditor,
  uniqueRange: monaco.Range,
  ranges: monaco.Range[]
): {
  firstRanges: monaco.Range[]
  secondRanges: monaco.Range[]
} {
  const model = editor.getModel()!
  const firstRanges: monaco.Range[] = []
  const secondRanges: monaco.Range[] = []
  let lastEndPosition = uniqueRange.getStartPosition()
  const uniqueRangeEndPosition = uniqueRange.getEndPosition()
  const intersectingRanges = ranges.filter(range => monaco.Range.areIntersecting(range, uniqueRange))

  for (const range of intersectingRanges) {
    const rangeStart = range.getStartPosition()
    const rangeEnd = range.getEndPosition()

    if (lastEndPosition.isBefore(rangeStart)) {
      const firstRangeStart = lastEndPosition.equals(uniqueRange.getStartPosition())
        ? lastEndPosition
        : model.modifyPosition(lastEndPosition, 1)
      firstRanges.push(monaco.Range.fromPositions(
        firstRangeStart,
        (model.modifyPosition(rangeStart, -1))
      ))
    }

    const secondRangeStart = lastEndPosition.isBefore(rangeStart) ? rangeStart : lastEndPosition
    const secondRangeEnd = uniqueRangeEndPosition.isBefore(rangeEnd) ? uniqueRangeEndPosition : rangeEnd
    secondRanges.push(monaco.Range.fromPositions(secondRangeStart, secondRangeEnd))

    lastEndPosition = rangeEnd
  }

  if (lastEndPosition.isBeforeOrEqual(uniqueRangeEndPosition)) {
    firstRanges.push(monaco.Range.fromPositions(model.modifyPosition(lastEndPosition, 1), uniqueRangeEndPosition))
  }

  return { firstRanges, secondRanges }
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
  const { firstRanges, secondRanges } = minusRanges(editor, fullModelRange, ranges)
  return withDecoration ? secondRanges : firstRanges
}
