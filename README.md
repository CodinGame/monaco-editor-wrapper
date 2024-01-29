# @codingame/monaco-editor-wrapper &middot; [![monthly downloads](https://img.shields.io/npm/dm/@codingame/monaco-editor-wrapper)](https://www.npmjs.com/package/@codingame/monaco-editor-wrapper) [![npm version](https://img.shields.io/npm/v/@codingame/monaco-editor-wrapper.svg?style=flat)](https://www.npmjs.com/package/@codingame/monaco-editor-wrapper) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/codingame/monaco-editor-wrapper/pulls)

## Synopsis
Monaco editor wrapper that adds some features and improvements to it:
- It uses VS Code extensions for all languages, including:
  - TextMate grammars
  - Language configurations
  - Language snippets
  - Language default editor configuration
- Language resources loading are lazy using dynamic imports (compatible with webpack)
- It requires using VS Code themes instead of Monaco themes and includes default vscode themes
- Keybindings and user configuration like in VS Code
- Vim and Emacs modes
- It configures the workers
- It adds some features:
  - Smart tabs in Cobol
  - `editor.foldAllAutofoldRegions` action
  - A way to register a text model content provider and a editor open handler
  - It allows the opening of an overlay editor when navigating to an external file
  - It adds some language aliases

### Installation

```bash
npm install @codingame/monaco-editor-wrapper
```

### Usage

#### Simple usage

The monaco-editor api should be used except for the editor creation.
Instead of using `monaco.editor.create`, you should use the `createEditor` exposed by this library.

### Embed language IntelliSense

By default, monaco-editor contains worker to achieve IntelliSense in CSS, SCSS, JavaScript, TypeScript, JSON and HTML.

To enable them, import the following files:
- JSON: `import '@codingame/monaco-editor-wrapper/features/jsonContribution'`
- JavaScript/TypeScript: `import '@codingame/monaco-editor-wrapper/features/typescriptContribution'`
- CSS/SCSS: `import '@codingame/monaco-editor-wrapper/features/cssContribution'`
- HTML: `import '@codingame/monaco-editor-wrapper/features/htmlContribution'`

#### Additional apis

##### User configuration

This library exposed some functions to manage the user global configuration:
- `registerDefaultConfigurations` Allows registering default values for some configuration keys which can be overridden
- `updateUserConfiguration` Update the user configuration, overrides the default configuration, uses the same syntax as VS Code configuration
- `getUserConfiguartion` Get back the current user configuration
- `onUserConfigurationChange` Get notified when the user configuration change (either after calling updateUserConfiguration or from internal configuration update)
- `getConfiguration` Allows to get a given configuration key in a given language
- `onConfigurationChanged` Listen to configuration change
- `updateKeybindings` aAlows to update the editor keybindings with the same syntax as in VS Code
- `updateEditorKeybindingsMode` Switch between `vim`, `emacs` or `classic` keybindings
