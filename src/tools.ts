import * as monaco from 'monaco-editor'
import { ContextKeyExpr, DisposableStore, KeybindingsRegistry } from 'vscode/monaco'

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
  editor: monaco.editor.ICodeEditor,
  decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean,
  allowChangeFromSources: string[] = [],
  errorMessage?: string
): monaco.IDisposable {
  const disposableStore = new DisposableStore()
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
      const editableRanges = model
        .getAllDecorations()
        .filter(decorationFilter)
        .map((decoration) => decoration.range)
      if (editableRanges.length === 0) {
        return true
      }
      return editableRanges.some((editableRange) => editableRange.containsRange(range))
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
    const editableRanges = editor
      .getModel()!
      .getAllDecorations()
      .filter(decorationFilter)
      .map((decoration) => decoration.range)
    const lastEditableRange =
      editableRanges.length > 0 ? editableRanges[editableRanges.length - 1] : undefined
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
          const after =
            currentEditorValue.length - model.getOffsetAt(lastEditableRange.getEndPosition())
          if (
            currentEditorValue.slice(0, before) === payload.text.slice(0, before) &&
            currentEditorValue.slice(currentEditorValue.length - after) ===
              payload.text.slice(payload.text.length - after)
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
      if (selections != null && selections.some((range) => !canEditRange(range))) {
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
    const originalApplyEdit: (
      operations: monaco.editor.IIdentifiedSingleEditOperation[],
      computeUndoEdits?: boolean
    ) => void = model.applyEdits
    model.applyEdits = ((
      operations: monaco.editor.IIdentifiedSingleEditOperation[],
      computeUndoEdits?: boolean
    ) => {
      if (currentEditSource != null && allowChangeFromSources.includes(currentEditSource)) {
        return originalApplyEdit.call(model, operations, computeUndoEdits!)
      }
      const filteredOperations = operations.filter((operation) => canEditRange(operation.range))
      if (filteredOperations.length === 0 && operations.length > 0) {
        const firstRange = operations[0]!.range
        displayLockedCodeError(
          new monaco.Position(firstRange.startLineNumber, firstRange.startColumn)
        )
      }
      return originalApplyEdit.call(model, filteredOperations, computeUndoEdits!)
    }) as typeof model.applyEdits

    restoreModelApplyEdit = () => {
      model.applyEdits = originalApplyEdit as typeof model.applyEdits
    }
  }
  disposableStore.add(editor.onDidChangeModel(lockModel))
  lockModel()

  // Handle selection of the last line of an editable range
  disposableStore.add(
    editor.onDidChangeCursorSelection((e) => {
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
  )

  disposableStore.add({
    dispose () {
      restoreModelApplyEdit()
      editor.executeEdits = originalExecuteEdit
      editor.executeCommands = originalExecuteCommands
      editor.trigger = originalTrigger
    }
  })

  return disposableStore
}

let hideCodeWithoutDecorationCounter = 0
export function hideCodeWithoutDecoration (editor: monaco.editor.ICodeEditor, decorationFilter: (decoration: monaco.editor.IModelDecoration) => boolean): monaco.IDisposable {
  const hideId = `hideCodeWithoutDecoration:${hideCodeWithoutDecorationCounter++}`

  function updateHiddenAreas (): void {
    const model = editor.getModel()
    if (model == null) {
      return
    }

    const decorations = model.getAllDecorations()
      .filter(decorationFilter)
    if (decorations.length === 0) {
      return
    }

    const ranges = decorations
      .map(decoration => decoration.range)
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

    const hiddenAreas: monaco.IRange[] = []
    let position = new monaco.Position(1, 1)
    for (const range of ranges) {
      const startPosition = model.modifyPosition(range.getStartPosition(), -1)
      const endPosition = model.modifyPosition(range.getEndPosition(), 1)
      hiddenAreas.push(monaco.Range.fromPositions(position, startPosition))
      position = endPosition
    }
    hiddenAreas.push(monaco.Range.fromPositions(position, model.getFullModelRange().getEndPosition()))

    editor.setHiddenAreas(hiddenAreas, hideId)
  }

  const disposableStore = new DisposableStore()

  disposableStore.add(editor.onDidChangeModel(() => {
    updateHiddenAreas()
  }))
  disposableStore.add(editor.onDidChangeModelDecorations(() => {
    updateHiddenAreas()
  }))
  updateHiddenAreas()

  disposableStore.add({
    dispose () {
      editor.setHiddenAreas([], hideId)
    }
  })

  return disposableStore
}

/**
 * Collapse everything between startToken and endToken
 */
export async function collapseCodeSections (editor: monaco.editor.ICodeEditor, startToken: string, endToken: string, isRegex: boolean = false): Promise<void> {
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
      await editor.getAction('editor.createFoldingRangeFromSelection')!.run()
      if (selections != null) {
        editor.setSelections(selections)
      }
    }
  }
}

interface IDecorationProvider {
  provideDecorations (model: monaco.editor.ITextModel): monaco.editor.IModelDeltaDecoration[]
}

export function registerTextDecorationProvider (provider: IDecorationProvider): monaco.IDisposable {
  const disposableStore = new DisposableStore()

  const watchEditor = (editor: monaco.editor.ICodeEditor): monaco.IDisposable => {
    const disposableStore = new DisposableStore()
    const decorationCollection = editor.createDecorationsCollection()

    const checkEditor = () => {
      const model = editor.getModel()
      if (model != null) {
        decorationCollection.set(provider.provideDecorations(model))
      } else {
        decorationCollection.clear()
      }
    }

    disposableStore.add(editor.onDidChangeModel(checkEditor))
    disposableStore.add(editor.onDidChangeModelContent(checkEditor))
    disposableStore.add({
      dispose () {
        decorationCollection.clear()
      }
    })
    checkEditor()
    return disposableStore
  }

  monaco.editor.getEditors().forEach(editor => disposableStore.add(watchEditor(editor)))
  disposableStore.add(monaco.editor.onDidCreateEditor(editor => disposableStore.add(watchEditor(editor))))

  return disposableStore
}

export function runOnAllEditors (cb: (editor: monaco.editor.ICodeEditor) => monaco.IDisposable): monaco.IDisposable {
  const disposableStore = new DisposableStore()

  const handleEditor = (editor: monaco.editor.ICodeEditor) => {
    const disposable = cb(editor)
    disposableStore.add(disposable)
    const disposeEventDisposable = editor.onDidDispose(() => {
      disposableStore.delete(disposable)
      disposableStore.delete(disposeEventDisposable)
    })
    disposableStore.add(disposeEventDisposable)
  }
  monaco.editor.getEditors().forEach(handleEditor)
  disposableStore.add(monaco.editor.onDidCreateEditor(handleEditor))

  return disposableStore
}

export function preventAlwaysConsumeTouchEvent (editor: monaco.editor.ICodeEditor): void {
  let firstX = 0
  let firstY = 0
  let atTop = false
  let atBottom = false
  let atLeft = false
  let atRight = false
  let useBrowserBehavior: null | boolean = null

  editor.onDidChangeModel(() => {
    const domNode = editor.getDomNode()
    if (domNode == null) {
      return
    }
    domNode.addEventListener('touchstart', (e) => {
      const firstTouch = e.targetTouches.item(0)
      if (firstTouch == null) {
        return
      }

      // Prevent monaco-editor from trying to call preventDefault on the touchstart event
      // so we'll be able to use the default behavior of the touchmove event
      e.preventDefault = () => {}

      firstX = firstTouch.clientX
      firstY = firstTouch.clientY

      const layoutInfo = editor.getLayoutInfo()
      atTop = editor.getScrollTop() <= 0
      atBottom = editor.getScrollTop() >= editor.getContentHeight() - layoutInfo.height
      atLeft = editor.getScrollLeft() <= 0
      atRight = editor.getScrollLeft() >= editor.getContentWidth() - layoutInfo.width
      useBrowserBehavior = null
    })
    domNode.addEventListener('touchmove', (e) => {
      const firstTouch = e.changedTouches.item(0)
      if (firstTouch == null) {
        return
      }

      if (useBrowserBehavior == null) {
        const dx = firstTouch.clientX - firstX
        const dy = firstTouch.clientY - firstY
        if (Math.abs(dx) > Math.abs(dy)) {
          // It's an horizontal scroll
          useBrowserBehavior = (dx < 0 && atRight) || (dx > 0 && atLeft)
        } else {
          // It's a vertical scroll
          useBrowserBehavior = (dy < 0 && atBottom) || (dy > 0 && atTop)
        }
      }
      if (useBrowserBehavior) {
        // Stop the event before monaco tries to preventDefault on it
        e.stopPropagation()
      }
    })
    domNode.addEventListener('touchend', (e) => {
      if (useBrowserBehavior ?? false) {
        // Prevent monaco from trying to open its context menu
        // It thinks it's a long press because it didn't receive the move events
        e.stopPropagation()
      }
    })
  })
}

// https://github.com/microsoft/monaco-editor/issues/568
class PlaceholderContentWidget implements monaco.editor.IContentWidget {
  private static readonly ID = 'editor.widget.placeholderHint'

  private domNode: HTMLElement | undefined

  constructor (
    private readonly editor: monaco.editor.ICodeEditor,
    private readonly placeholder: string
  ) {}

  getId (): string {
    return PlaceholderContentWidget.ID
  }

  getDomNode (): HTMLElement {
    if (this.domNode == null) {
      this.domNode = document.createElement('pre')
      this.domNode.style.width = 'max-content'
      this.domNode.textContent = this.placeholder
      this.domNode.style.pointerEvents = 'none'
      this.domNode.style.color = '#aaa'
      this.domNode.style.margin = '0'

      this.editor.applyFontInfo(this.domNode)
    }

    return this.domNode
  }

  getPosition (): monaco.editor.IContentWidgetPosition | null {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
    }
  }
}

export function addPlaceholder (
  editor: monaco.editor.ICodeEditor,
  placeholder: string
): monaco.IDisposable {
  const widget = new PlaceholderContentWidget(editor, placeholder)

  function onDidChangeModelContent (): void {
    if (editor.getValue() === '') {
      editor.addContentWidget(widget)
    } else {
      editor.removeContentWidget(widget)
    }
  }

  onDidChangeModelContent()
  const changeDisposable = editor.onDidChangeModelContent(() => onDidChangeModelContent())
  return {
    dispose () {
      changeDisposable.dispose()
      editor.removeContentWidget(widget)
    }
  }
}

export function mapClipboard (
  editor: monaco.editor.ICodeEditor,
  {
    toClipboard,
    fromClipboard
  }: {
    toClipboard: (data: string) => string
    fromClipboard: (data: string) => string
  }
): monaco.IDisposable {
  const disposableStore = new DisposableStore()
  let copiedText = ''

  disposableStore.add(
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: 'customCopy',
      weight: 1000,
      handler: () => {
        copiedText = editor.getModel()!.getValueInRange(editor.getSelection()!)
        document.execCommand('copy')
      },
      when: ContextKeyExpr.equals('editorId', editor.getId()),
      primary: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC
    })
  )

  disposableStore.add(
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: 'customCut',
      weight: 1000,
      handler: () => {
        copiedText = editor.getModel()!.getValueInRange(editor.getSelection()!)
        document.execCommand('copy')
      },
      when: ContextKeyExpr.equals('editorId', editor.getId()),
      primary: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX
    })
  )

  const originalTrigger = editor.trigger
  editor.trigger = function (source, handlerId, payload) {
    if (handlerId === 'editor.action.clipboardCopyAction') {
      copiedText = editor.getModel()!.getValueInRange(editor.getSelection()!)
    } else if (handlerId === 'editor.action.clipboardCutAction') {
      copiedText = editor.getModel()!.getValueInRange(editor.getSelection()!)
    } else if (handlerId === 'paste') {
      const newText = fromClipboard(payload.text)
      if (newText !== payload.text) {
        payload = {
          ...payload,
          text: newText
        }
      }
    }
    originalTrigger.call(this, source, handlerId, payload)
  }
  disposableStore.add({
    dispose () {
      editor.trigger = originalTrigger
    }
  })

  function mapCopy (event: ClipboardEvent): void {
    const clipdata = event.clipboardData ?? (window as unknown as { clipboardData: DataTransfer }).clipboardData
    let content = clipdata.getData('Text')
    if (content.length === 0) {
      content = copiedText
    }
    const transformed = toClipboard(content)
    if (transformed !== content) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (clipdata.types != null) {
        clipdata.types.forEach(type => clipdata.setData(type, toClipboard(content)))
      } else {
        clipdata.setData('text/plain', toClipboard(content))
      }
    }
  }
  const editorDomNode = editor.getContainerDomNode()
  editorDomNode.addEventListener('copy', mapCopy)
  editorDomNode.addEventListener('cut', mapCopy)
  disposableStore.add({
    dispose () {
      editorDomNode.removeEventListener('copy', mapCopy)
      editorDomNode.removeEventListener('cut', mapCopy)
    }
  })

  return disposableStore
}
