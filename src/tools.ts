import * as monaco from 'monaco-editor'

interface PastePayload {
  text: string
  pasteOnNewLine: boolean
  multicursorText: string[] | null
  mode: string | null
}

function isPasteAction (handlerId: string, payload: unknown): payload is PastePayload {
  return handlerId === 'paste'
}

export function lockCodeWithoutDecoration (
  editor: monaco.editor.IStandaloneCodeEditor,
  decorations: string[],
  allowChangeFromSources: string[],
  errorMessage?: string
): () => void {
  function displayLockedCodeError (position: monaco.Position) {
    if (errorMessage == null) {
      return
    }
    const messageContribution = editor.getContribution('editor.contrib.messageController')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(messageContribution as any).showMessage(errorMessage, position)
  }

  function canEditRange (range: monaco.IRange) {
    const model = editor.getModel()
    if (model != null) {
      const editableRanges = decorations.map(decoration => model.getDecorationRange(decoration))
      return editableRanges.some(editableRange => editableRange?.containsRange(range) ?? false)
    }
    return false
  }

  const originalExecuteCommands = editor.executeCommands
  editor.executeCommands = function (name, commands) {
    for (const command of commands) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const range: monaco.Range | undefined = (command as any)?._range
      if (range != null && !canEditRange(range)) {
        displayLockedCodeError(range.getEndPosition())
        return
      }
    }
    return originalExecuteCommands.call(editor, name, commands)
  }

  const originalTrigger = editor.trigger
  editor.trigger = function (source, handlerId, payload) {
    // Try to transform whole file pasting into a paste in the editable area only
    const lastEditableRange = decorations.length > 0 ? editor.getModel()?.getDecorationRange(decorations[decorations.length - 1]!) : null
    if (isPasteAction(handlerId, payload) && lastEditableRange != null) {
      const selections = editor.getSelections()
      const model = editor.getModel()!
      if (selections != null && selections.length === 1) {
        const selection = selections[0]!
        const fullModelRange = model.getFullModelRange()
        const wholeFileSelected = fullModelRange.equalsRange(selection)
        if (wholeFileSelected) {
          const currentEditorValue = editor.getValue()
          const before = model.getOffsetAt(lastEditableRange.getStartPosition())
          const after = currentEditorValue.length - model.getOffsetAt(lastEditableRange.getEndPosition())
          if (
            currentEditorValue.slice(0, before) === payload.text.slice(0, before) &&
            currentEditorValue.slice(currentEditorValue.length - after) === payload.text.slice(payload.text.length - after)
          ) {
            editor.setSelection(lastEditableRange)
            const newPayload: PastePayload = {
              ...payload,
              text: payload.text.slice(before, payload.text.length - after)
            }
            payload = newPayload
          }
        }
      }
    }

    if (['type', 'paste', 'cut'].includes(handlerId)) {
      const selections = editor.getSelections()
      if (selections != null && selections.some(range => !canEditRange(range))) {
        displayLockedCodeError(editor.getPosition()!)
        return
      }
    }
    return originalTrigger.call(editor, source, handlerId, payload)
  }

  let currentEditSource: string | null | undefined
  const originalExecuteEdit = editor.executeEdits
  editor.executeEdits = (source, edits, endCursorState) => {
    currentEditSource = source
    try {
      return originalExecuteEdit.call(editor, source, edits, endCursorState)
    } finally {
      currentEditSource = null
    }
  }

  let restoreModelApplyEdit: () => void = () => {}
  function lockModel () {
    restoreModelApplyEdit()
    const model = editor.getModel()
    if (model == null) {
      return
    }
    const originalApplyEdit: (operations: monaco.editor.IIdentifiedSingleEditOperation[], computeUndoEdits?: boolean) => void = model.applyEdits
    model.applyEdits = ((operations: monaco.editor.IIdentifiedSingleEditOperation[], computeUndoEdits?: boolean) => {
      if (currentEditSource != null && allowChangeFromSources.includes(currentEditSource)) {
        return originalApplyEdit.call(model, operations, computeUndoEdits!)
      }
      const filteredOperations = operations
        .filter(operation => canEditRange(operation.range))
      if (filteredOperations.length === 0 && operations.length > 0) {
        const firstRange = operations[0]!.range
        displayLockedCodeError(new monaco.Position(firstRange.startLineNumber, firstRange.startColumn))
      }
      return originalApplyEdit.call(model, filteredOperations, computeUndoEdits!)
    }) as typeof model.applyEdits

    restoreModelApplyEdit = () => {
      model.applyEdits = originalApplyEdit as typeof model.applyEdits
    }
  }
  const editorChangeModelDisposable = editor.onDidChangeModel(lockModel)
  lockModel()

  // Handle selection of the last line of an editable range
  const selectionDisposable = editor.onDidChangeCursorSelection(e => {
    if (canEditRange(e.selection)) {
      return
    }
    const model = editor.getModel()
    if (model == null) {
      return
    }
    const shiftedRange = monaco.Range.fromPositions(
      model.getPositionAt(model.getOffsetAt(e.selection.getStartPosition()) - 1),
      model.getPositionAt(model.getOffsetAt(e.selection.getEndPosition()) - 1)
    )
    if (canEditRange(shiftedRange)) {
      editor.setSelection(shiftedRange)
    }
  })

  return () => {
    selectionDisposable.dispose()
    restoreModelApplyEdit()
    editorChangeModelDisposable.dispose()
    editor.executeEdits = originalExecuteEdit
    editor.executeCommands = originalExecuteCommands
    editor.trigger = originalTrigger
  }
}

export function hideCodeWithoutDecoration (editor: monaco.editor.IStandaloneCodeEditor, decorations: string[]): () => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let otherHiddenAreas: monaco.IRange[] = (editor as any)._getViewModel()._lines.getHiddenAreas()
  function getHiddenAreas () {
    const model = editor.getModel()!

    const ranges = decorations
      .map(decoration => model.getDecorationRange(decoration)!)
      .sort((a, b) => a.startLineNumber - b.startLineNumber)
      // merge ranges
      .reduce<monaco.Range[]>((acc, range) => {
        if (acc.length === 0) {
          return [range]
        }
        const lastRange = acc[acc.length - 1]!
        if (range.getStartPosition().isBeforeOrEqual(lastRange.getEndPosition())) {
          return [
            ...acc.slice(0, -1),
            monaco.Range.fromPositions(lastRange.getStartPosition(), range.getEndPosition())
          ]
        } else {
          return [
            ...acc,
            range
          ]
        }
      }, [])

    let hiddenAreas: monaco.IRange[] = [...otherHiddenAreas]
    let position = new monaco.Position(1, 1)
    for (const range of ranges) {
      const startPosition = model.modifyPosition(range.getStartPosition(), -1)
      const endPosition = model.modifyPosition(range.getEndPosition(), 1)
      hiddenAreas = [
        ...hiddenAreas,
        monaco.Range.fromPositions(position, startPosition)
      ]
      position = endPosition
    }
    hiddenAreas = [
      ...hiddenAreas,
      monaco.Range.fromPositions(position, model.getFullModelRange().getEndPosition())
    ]

    return hiddenAreas
  }

  const originalSetHiddenAreas = editor.setHiddenAreas.bind(editor)
  function updateHiddenAreas () {
    originalSetHiddenAreas(getHiddenAreas())
  }

  // Hack to make it work with the folding service calling setHiddenAreas with its own areas
  editor.setHiddenAreas = (ranges) => {
    otherHiddenAreas = ranges
    updateHiddenAreas()
  }

  updateHiddenAreas()

  return () => {
    editor.setHiddenAreas = originalSetHiddenAreas
    editor.setHiddenAreas(otherHiddenAreas)
  }
}

/**
 * Collapse everything between startToken and endToken
 */
export async function collapseCodeSections (editor: monaco.editor.IStandaloneCodeEditor, startToken: string, endToken: string, isRegex: boolean = false): Promise<void> {
  const editorModel = editor.getModel()
  const ranges: monaco.IRange[] = []
  if (editorModel != null) {
    let currentPosition = editorModel.getFullModelRange().getStartPosition()
    let match: monaco.editor.FindMatch | null
    while ((match = editorModel.findNextMatch(startToken,
      /* searchStart */currentPosition,
      /* isRegex */isRegex,
      /* matchCase */true,
      /* wordSeparators */null,
      /* captureMatches */false
    )) != null) {
      if (match.range.getStartPosition().isBefore(currentPosition)) {
        break
      }
      const matchEnd = editorModel.findNextMatch(endToken,
        /* searchStart */match.range.getEndPosition(),
        /* isRegex */isRegex,
        /* matchCase */true,
        /* wordSeparators */null,
        /* captureMatches */false
      )
      if (matchEnd != null && matchEnd.range.getStartPosition().isBefore(match.range.getStartPosition())) {
        break
      }
      currentPosition = matchEnd?.range.getEndPosition() ?? editorModel.getFullModelRange().getEndPosition()
      ranges.push(monaco.Range.fromPositions(match.range.getStartPosition(), currentPosition))
    }

    if (ranges.length > 0) {
      const selections = editor.getSelections()
      editor.setSelections(ranges.map(r => ({
        selectionStartLineNumber: r.startLineNumber,
        selectionStartColumn: r.startColumn,
        positionLineNumber: r.endLineNumber,
        positionColumn: r.endColumn
      })))
      await editor.getAction('editor.createFoldingRangeFromSelection').run()
      if (selections != null) {
        editor.setSelections(selections)
      }
    }
  }
}
