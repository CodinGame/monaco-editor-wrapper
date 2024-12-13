import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals'
import * as monaco from 'monaco-editor'
import { DisposableStore } from 'vscode/monaco'
import { createDefaultTestLockedCodeRanges, createDefaultTestModel, createTestOperation, createTestRange } from '../utils'
import { lockCodeRanges } from '../../tools'

let disposableStore: DisposableStore
beforeEach(() => {
  disposableStore = new DisposableStore()
})
afterEach(() => {
  disposableStore.dispose()
})

describe('Locked code', () => {
  test('Edit editable range', () => {
    const model = createDefaultTestModel()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      }
    }))

    const operationRange = createTestRange(model, 8, 9)
    const operation = createTestOperation(operationRange, '  return 42;')

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [operation])

    expect(onDidChangeContent).toHaveBeenCalledTimes(1)
    expect(onDidChangeContent.mock.calls[0]![0]).toMatchObject({
      changes: [{
        range: operation.range,
        text: operation.text
      }]
    })
  })

  test('Edit locked code', () => {
    const model = createDefaultTestModel()
    const onError = jest.fn()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      },
      onError (editor, firstForbiddenOperation) {
        onError(firstForbiddenOperation)
      }
    }))

    const operationRange = createTestRange(model, 4, 4)
    const operation = createTestOperation(operationRange, '// tata')

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [operation])

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0]).toMatchObject({
      range: { startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 8 },
      text: '// tata'
    })
  })

  test('Paste the whole editor with the locked code sections intact', () => {
    const model = createDefaultTestModel()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      }
    }))

    const fullModelRange = model.getFullModelRange()
    const operation = createTestOperation(fullModelRange, `// first comment

/* Ignore and do not change the code below */
// tutu
/* Ignore and do not change the code above */

function findLargest(numbers: number[]): number {
  // function
  return 42;
}

/* Ignore and do not change the code below */
// toto
/* Ignore and do not change the code above */

// second comment

/* Ignore and do not change the code below */
// toto
/* Ignore and do not change the code above */

// last comment`)

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [operation])

    expect(onDidChangeContent).toHaveBeenCalledTimes(1)
    expect(onDidChangeContent.mock.calls[0]![0]).toMatchObject({
      changes: [{
        range: { startLineNumber: 21, startColumn: 1, endLineNumber: 22, endColumn: 24 },
        text: '\n// last comment'
      }, {
        range: { startLineNumber: 15, startColumn: 1, endLineNumber: 17, endColumn: 1 },
        text: '\n// second comment\n'
      }, {
        range: { startLineNumber: 6, startColumn: 1, endLineNumber: 11, endColumn: 1 },
        text: `
function findLargest(numbers: number[]): number {
  // function
  return 42;
}
`
      }, {
        range: { startLineNumber: 1, startColumn: 1, endLineNumber: 2, endColumn: 1 },
        text: '// first comment\n'
      }]
    })
  })

  test('Paste the whole editor without the locked code sections', () => {
    const model = createDefaultTestModel()
    const onError = jest.fn()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      },
      onError (editor, firstForbiddenOperation) {
        onError(firstForbiddenOperation)
      }
    }))

    const fullModelRange = model.getFullModelRange()
    const operation = createTestOperation(fullModelRange, `function findLargest(numbers: number[]): number {
  // function
  return 42;
}`)

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [operation])

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0]).toMatchObject({
      range: fullModelRange,
      text: `function findLargest(numbers: number[]): number {
  // function
  return 42;
}`
    })
  })

  test('Edit range intersecting with one locked code section', () => {
    const model = createDefaultTestModel()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      }
    }))

    const operationRange = createTestRange(model, 9, 13)
    const operation = createTestOperation(operationRange, `  return 42;
}

/* Ignore and do not change the code below */
// toto`)

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [operation])

    expect(onDidChangeContent).toHaveBeenCalledTimes(1)
    expect(onDidChangeContent.mock.calls[0]![0]).toMatchObject({
      changes: [{
        range: { startLineNumber: 9, startColumn: 1, endLineNumber: 11, endColumn: 1 },
        text: '  return 42;\n}\n'
      }]
    })
  })

  test('Edit range intersecting with multiple locked code sections', () => {
    const model = createDefaultTestModel()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      }
    }))

    const operationRange = createTestRange(model, 12, 22)
    const operation = createTestOperation(operationRange, `/* Ignore and do not change the code below */
// toto
/* Ignore and do not change the code above */

// new comment
// on two lines

/* Ignore and do not change the code below */
// toto
/* Ignore and do not change the code above */

// other comment`)

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [operation])

    expect(onDidChangeContent).toHaveBeenCalledTimes(1)
    expect(onDidChangeContent.mock.calls[0]![0]).toMatchObject({
      changes: [{
        range: { startLineNumber: 21, startColumn: 1, endLineNumber: 22, endColumn: 24 },
        text: '\n// other comment'
      }, {
        range: { startLineNumber: 15, startColumn: 1, endLineNumber: 17, endColumn: 1 },
        text: '\n// new comment\n// on two lines\n'
      }]
    })
  })

  test('Multiple edits on only editable ranges', () => {
    const model = createDefaultTestModel()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      }
    }))

    const firstRange = createTestRange(model, 8, 9)
    const firstOperation = createTestOperation(firstRange, '  // first comment\n  return 42;')
    const secondRange = createTestRange(model, 16, 16)
    const secondOperation = createTestOperation(secondRange, '// second operation comment')

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [firstOperation, secondOperation])

    expect(onDidChangeContent).toHaveBeenCalledTimes(1)
    expect(onDidChangeContent.mock.calls[0]![0]).toMatchObject({
      changes: [{
        range: secondOperation.range,
        text: secondOperation.text
      }, {
        range: firstOperation.range,
        text: firstOperation.text
      }]
    })
  })

  test('Multiple edits on editable and locked code ranges', () => {
    const model = createDefaultTestModel()
    const onError = jest.fn()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      },
      onError (editor, firstForbiddenOperation) {
        onError(firstForbiddenOperation)
      }
    }))

    const firstRange = createTestRange(model, 8, 9)
    const firstOperation = createTestOperation(firstRange, '  // function comment\n  return 42;')
    const secondRange = createTestRange(model, 13, 13)
    const secondOperation = createTestOperation(secondRange, '// uneditable comment')

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [firstOperation, secondOperation])

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0]).toMatchObject({
      range: { startLineNumber: 13, startColumn: 1, endLineNumber: 13, endColumn: 8 },
      text: '// uneditable comment'
    })
  })

  test('Removing line return before a locked code range', () => {
    const model = createDefaultTestModel()
    const onError = jest.fn()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      },
      onError (editor, firstForbiddenOperation) {
        onError(firstForbiddenOperation)
      }
    }))

    const operationRange = createTestRange(model, 2, 3)
    const operation = createTestOperation(operationRange, '')

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [operation])

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0]).toMatchObject({
      range: { startLineNumber: 2, startColumn: 1, endLineNumber: 3, endColumn: 46 },
      text: ''
    })
  })

  test('Handle all systems line break character', () => {
    const model = createDefaultTestModel()
    disposableStore.add(model)
    const editor = monaco.editor.create(document.createElement('div'), {
      model
    })
    disposableStore.add(editor)
    disposableStore.add(lockCodeRanges(editor, {
      getLockedRanges () {
        return createDefaultTestLockedCodeRanges(model)
      }
    }))

    const operationRange = createTestRange(model, 12, 22)
    const operation = createTestOperation(operationRange,
      '/* Ignore and do not change the code below */\n' +
      '// toto\r\n' +
      '/* Ignore and do not change the code above */\n' +
      '\n' +
      '// new comment\r\n' +
      '// on two lines\r' +
      '\n' +
      '/* Ignore and do not change the code below */\r\n' +
      '// toto\r' +
      '/* Ignore and do not change the code above */\n' +
      '\n' +
      '// other comment\n'
    )

    const onDidChangeContent = jest.fn()
    disposableStore.add(model.onDidChangeContent(onDidChangeContent))

    editor.executeEdits(null, [operation])

    expect(onDidChangeContent).toHaveBeenCalledTimes(1)
    expect(onDidChangeContent.mock.calls[0]![0]).toMatchObject({
      changes: [{
        range: { startLineNumber: 21, startColumn: 1, endLineNumber: 22, endColumn: 24 },
        text: '\n// other comment\n'
      }, {
        range: { startLineNumber: 15, startColumn: 1, endLineNumber: 17, endColumn: 1 },
        text: '\n// new comment\n// on two lines'
      }]
    })
  })
})
