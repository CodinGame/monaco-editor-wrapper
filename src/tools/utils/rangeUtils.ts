import * as monaco from 'monaco-editor'

export function getRangesFromDecorations (
  model: monaco.editor.ITextModel,
  decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean
): monaco.Range[] {
  return model
    .getAllDecorations()
    .filter(decorationFilter)
    .map((decoration) => decoration.range)
}

export function minusRanges (
  model: monaco.editor.ITextModel,
  uniqueRange: monaco.Range,
  ranges: monaco.Range[]
): {
  firstRanges: monaco.Range[]
  secondRanges: monaco.Range[]
} {
  const firstRanges: monaco.Range[] = []
  const secondRanges: monaco.Range[] = []
  let lastEndPosition = uniqueRange.getStartPosition()
  const uniqueRangeEndPosition = uniqueRange.getEndPosition()
  const intersectingRanges = ranges.filter(range => monaco.Range.areIntersectingOrTouching(range, uniqueRange))

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
    const firstRangeStart = lastEndPosition.equals(uniqueRange.getStartPosition())
      ? lastEndPosition
      : model.modifyPosition(lastEndPosition, 1)
    firstRanges.push(monaco.Range.fromPositions(firstRangeStart, uniqueRangeEndPosition))
  }

  return { firstRanges, secondRanges }
}

export function getLockedRanges (
  model: monaco.editor.ITextModel,
  decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean,
  withDecoration: boolean
): monaco.Range[] {
  const fullModelRange = model.getFullModelRange()
  const ranges = getRangesFromDecorations(model, decorationFilter)
  const { firstRanges, secondRanges } = minusRanges(model, fullModelRange, ranges)
  return withDecoration ? secondRanges : firstRanges
}
