import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
  rules: { '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }] },
  languageOptions: {
    globals: {
      ...globals.browser
    }
  }
})
