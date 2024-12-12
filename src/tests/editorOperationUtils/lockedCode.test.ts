import { describe, expect, test } from '@jest/globals'
import { canTestOperationsEditRanges, createDefaultTestLockedCodeRanges, createDefaultTestModel, createTestOperation, createTestRange } from '../utils'
import { tryIgnoreLockedCodeForOperations } from '../../tools/utils/editorOperationUtils'

describe('Locked code', () => {
  test('Edit editable range', async () => {
    const model = createDefaultTestModel()
    const uneditableRanges = createDefaultTestLockedCodeRanges(model)

    const operationRange = createTestRange(model, 8, 9)
    const operation = createTestOperation(operationRange, '  return 42;')
    const splitOperations = tryIgnoreLockedCodeForOperations(model, [operation], uneditableRanges)

    expect(splitOperations.length).toEqual(1)
    expect(splitOperations[0]).toEqual(createTestOperation(operationRange, '  return 42;'))
    expect(canTestOperationsEditRanges(splitOperations, uneditableRanges)).toBe(true)
  })

  test('Edit locked code', () => {
    const model = createDefaultTestModel()
    const uneditableRanges = createDefaultTestLockedCodeRanges(model)

    const operationRange = createTestRange(model, 4, 4)
    const operation = createTestOperation(operationRange, '// tata')
    const splitOperations = tryIgnoreLockedCodeForOperations(model, [operation], uneditableRanges)

    expect(splitOperations.length).toEqual(1)
    expect(splitOperations[0]).toEqual(createTestOperation(operationRange, '// tata'))
    expect(canTestOperationsEditRanges(splitOperations, uneditableRanges)).toBe(false)
  })

  test('Paste the whole editor with the locked code sections intact', () => {
    const model = createDefaultTestModel()
    const fullModelRange = model.getFullModelRange()
    const uneditableRanges = createDefaultTestLockedCodeRanges(model)

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
    const splitOperations = tryIgnoreLockedCodeForOperations(model, [operation], uneditableRanges)

    expect(splitOperations.length).toEqual(4)
    expect(splitOperations[0]).toEqual(
      createTestOperation(createTestRange(model, 1, 2), '// first comment\n', { major: 0, minor: 0 })
    )
    expect(splitOperations[1]).toEqual(
      createTestOperation(
        createTestRange(model, 6, 11),
        `
function findLargest(numbers: number[]): number {
  // function
  return 42;
}
`,
        { major: 0, minor: 1 }
      )
    )
    expect(splitOperations[2]).toEqual(
      createTestOperation(createTestRange(model, 15, 17), '\n// second comment\n', { major: 0, minor: 2 })
    )
    expect(splitOperations[3]).toEqual(
      createTestOperation(createTestRange(model, 21, 22), '\n// last comment', { major: 0, minor: 3 })
    )
    expect(canTestOperationsEditRanges(splitOperations, uneditableRanges)).toBe(true)
  })

  test('Paste the whole editor without the locked code sections', () => {
    const model = createDefaultTestModel()
    const fullModelRange = model.getFullModelRange()
    const uneditableRanges = createDefaultTestLockedCodeRanges(model)

    const operation = createTestOperation(fullModelRange, `function findLargest(numbers: number[]): number {
  // function
  return 42;
}`)
    const splitOperations = tryIgnoreLockedCodeForOperations(model, [operation], uneditableRanges)

    expect(splitOperations.length).toEqual(1)
    expect(splitOperations[0]).toEqual(createTestOperation(fullModelRange, `function findLargest(numbers: number[]): number {
  // function
  return 42;
}`))
    expect(canTestOperationsEditRanges(splitOperations, uneditableRanges)).toBe(false)
  })

  test('Edit range intersecting with one locked code section', () => {
    const model = createDefaultTestModel()
    const uneditableRanges = createDefaultTestLockedCodeRanges(model)

    const operationRange = createTestRange(model, 9, 13)
    const operation = createTestOperation(operationRange, `  return 42;
}

/* Ignore and do not change the code below */
// toto`)
    const splitOperations = tryIgnoreLockedCodeForOperations(model, [operation], uneditableRanges)

    expect(splitOperations.length).toEqual(1)
    expect(splitOperations[0]).toEqual(
      createTestOperation(createTestRange(model, 9, 11), '  return 42;\n}\n')
    )
    expect(canTestOperationsEditRanges(splitOperations, uneditableRanges)).toBe(true)
  })

  test('Edit range intersecting with multiple locked code sections', () => {
    const model = createDefaultTestModel()
    const uneditableRanges = createDefaultTestLockedCodeRanges(model)

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
    const splitOperations = tryIgnoreLockedCodeForOperations(model, [operation], uneditableRanges)

    expect(splitOperations.length).toEqual(2)
    expect(splitOperations[0]).toEqual(
      createTestOperation(createTestRange(model, 15, 17), '\n// new comment\n// on two lines\n', { major: 0, minor: 0 })
    )
    expect(splitOperations[1]).toEqual(
      createTestOperation(createTestRange(model, 21, 22), '\n// other comment', { major: 0, minor: 1 })
    )
    expect(canTestOperationsEditRanges(splitOperations, uneditableRanges)).toBe(true)
  })

  test('Multiple edits on only editable ranges', () => {
    const model = createDefaultTestModel()
    const uneditableRanges = createDefaultTestLockedCodeRanges(model)

    const firstRange = createTestRange(model, 8, 9)
    const firstOperation = createTestOperation(firstRange, '  // first comment\n  return 42;', { major: 0, minor: 0 })
    const secondRange = createTestRange(model, 16, 16)
    const secondOperation = createTestOperation(secondRange, '// second operation comment', { major: 1, minor: 0 })
    const splitOperations = tryIgnoreLockedCodeForOperations(model, [firstOperation, secondOperation], uneditableRanges)

    expect(splitOperations.length).toEqual(2)
    expect(splitOperations[0]).toEqual(
      createTestOperation(firstRange, '  // first comment\n  return 42;', { major: 0, minor: 0 })
    )
    expect(splitOperations[1]).toEqual(
      createTestOperation(secondRange, '// second operation comment', { major: 1, minor: 0 })
    )
    expect(canTestOperationsEditRanges(splitOperations, uneditableRanges)).toBe(true)
  })

  test('Multiple edits on editable and locked code ranges', () => {
    const model = createDefaultTestModel()
    const uneditableRanges = createDefaultTestLockedCodeRanges(model)

    const firstRange = createTestRange(model, 8, 9)
    const firstOperation = createTestOperation(firstRange, '  // function comment\n  return 42;', { major: 0, minor: 0 })
    const secondRange = createTestRange(model, 13, 13)
    const secondOperation = createTestOperation(secondRange, '// uneditable comment', { major: 1, minor: 0 })
    const splitOperations = tryIgnoreLockedCodeForOperations(model, [firstOperation, secondOperation], uneditableRanges)

    expect(splitOperations.length).toEqual(2)
    expect(splitOperations[0]).toEqual(
      createTestOperation(firstRange, '  // function comment\n  return 42;', { major: 0, minor: 0 })
    )
    expect(splitOperations[1]).toEqual(
      createTestOperation(secondRange, '// uneditable comment', { major: 1, minor: 0 })
    )
    expect(canTestOperationsEditRanges(splitOperations, uneditableRanges)).toBe(false)
  })
})
