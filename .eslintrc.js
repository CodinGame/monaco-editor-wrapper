module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'unused-imports'
  ],
  rules: {
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none'
        },
        singleline: {
          delimiter: 'comma'
        }
      }
    ],
    '@typescript-eslint/no-misused-promises': [
      'error',
      { checksVoidReturn: false }
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
        variables: false
      }
    ],
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/no-unresolved': 'off',
    'import/order': [
      'warn',
      {
        groups: ['unknown', 'external', 'internal', 'builtin', 'index', 'sibling', 'parent'],
        'newlines-between': 'never'
      }
    ],
    'no-console': ['warn', { allow: ['warn', 'error', 'debug', 'info'] }],
    'no-useless-constructor': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': ['error'],
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': [
      'warn',
      {
        allowArgumentsExplicitlyTypedAsAny: true
      }
    ],
    semi: 'off',
    '@typescript-eslint/semi': [
      'error', 'never'
    ],
    'eslint/no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': [
      'warn'
    ],
    '@typescript-eslint/strict-boolean-expressions': [
      'warn',
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false
      }
    ],
    '@typescript-eslint/no-explicit-any': [
      'error',
      {
        ignoreRestArgs: true
      }
    ],
    '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
    '@typescript-eslint/no-floating-promises': [
      'error'
    ],
    'no-void': [
      'error',
      {
        allowAsStatement: true
      }
    ]
  }
}
