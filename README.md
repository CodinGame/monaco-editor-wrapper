# @codingame/monaco-editor-wrapper &middot; [![monthly downloads](https://img.shields.io/npm/dm/@codingame/monaco-editor-wrapper)](https://www.npmjs.com/package/@codingame/monaco-editor-wrapper) [![npm version](https://img.shields.io/npm/v/@codingame/monaco-editor-wrapper.svg?style=flat)](https://www.npmjs.com/package/@codingame/monaco-editor-wrapper) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/codingame/monaco-editor-wrapper/pulls)

## Synopsis
Monaco editor wrapper uses and configures [monaco-vscode-api](https://www.npmjs.com/package/@codingame/monaco-vscode-api) for you

It also includes some tools allowing to add some missing features to monaco-editor:
- `preventAlwaysConsumeTouchEvent`, mobile feature corresponding to the `alwaysConsumeMouseWheel` monaco-editor option
- `collapseCodeSectionsFromRanges` allows to create and collapse a code section
- `collapseCodeSections` allows to create and collapse a code section between 2 tokens
- `registerTextDecorationProvider` allows to compute decorations on all existing editors
- `hideCodeWithoutDecoration` allows to hide code parts that have a specific decoration
- `lockCodeSectionsFromRanges` allows to make a code section read-only
- `lockCodeSectionsWithoutRanges` allows to make the code outside of a code section read-only
- `lockCodeFromDecoration` allows to make read-only code parts within a specific decoration
- `lockCodeWithoutDecoration` allows to make read-only code parts outside of a specific decoration
- `updateEditorKeybindingsMode` allows to apply vim or emacs keybindings
- `extractRangesFromTokens` allows to extract a code section between 2 tokens

### Installation

```bash
npm install @codingame/monaco-editor-wrapper
```

### Usage

#### Simple usage

You need to call the exposed `initialize` function, and wait for the returned promise.

You will then be able to interact with the monaco-editor api (by importing `monaco-editor`) OR the VSCode api (by importing `vscode`)

#### Model creation

Instead of using `monaco.editor.createModel`, it is recommended to use `monaco.editor.createModelReference` to create models.

It makes it possible for the VSCode service to reference that file by it's reference without breaking (for instance when following file links in source code using LSP).

#### Optional features

By default, only a minimal set of features is registered (vscode extensions, editor/model services, languages, textmate, dialogs, configuration/keybindings, snippets, accessibility...)

There are some optional features that can be enabled by importing a specific export:
- `@codingame/monaco-editor-wrapper/features/extensionHostWorker` enables the worker extension host which allows to run VSCode extensions
- `@codingame/monaco-editor-wrapper/features/notifications` enables the VSCode notifications instead of logging into the console
- `@codingame/monaco-editor-wrapper/features/workbench` allows to use the full VSCode workbench
- `@codingame/monaco-editor-wrapper/features/typescriptStandalone` enables the monaco standalone typescript language feature worker

Those feature can be used if the workbench feature is enabled:
- `@codingame/monaco-editor-wrapper/features/viewPanels` enables a few panels (timeline, outline, output, markers, explorer)
- `@codingame/monaco-editor-wrapper/features/search` enables the search panel
- `@codingame/monaco-editor-wrapper/features/extensionGallery` enables the extension gallery panel and the possibility to install extensions from the marketplace
- `@codingame/monaco-editor-wrapper/features/terminal` enables the terminal panel
- `@codingame/monaco-editor-wrapper/features/testing` enables the testing panels

### Embed language IntelliSense

By default, monaco-editor contains worker to achieve IntelliSense in CSS, SCSS, JavaScript, TypeScript, JSON and HTML.

It's not possible to use them with this lib.
However they can be replaced by the corresponding VSCode extension.

To enable them, install and import for following packages:
- JSON: `import '@codingame/monaco-vscode-json-language-features-default-extension'`
- JavaScript/TypeScript: `import '@codingame/monaco-vscode-typescript-language-features-default-extension'`
- CSS/SCSS: `import '@codingame/monaco-vscode-css-language-features-default-extension'`
- HTML: `import '@codingame/monaco-vscode-html-language-features-default-extension'`

You also need to import `@codingame/monaco-editor-wrapper/features/extensionHostWorker` to allows the VSCode extensions to run in a webworker.

#### Additional apis

##### User configuration

This library exposed some functions to manage the user global configuration:
- `registerDefaultConfigurations` Allows registering default values for some configuration keys which can be overridden
- `updateUserConfiguration` Update the user configuration, overrides the default configuration, uses the same syntax as VS Code configuration
- `getUserConfiguration` Get back the current user configuration
- `onUserConfigurationChange` Get notified when the user configuration change (either after calling updateUserConfiguration or from internal configuration update)
- `getConfiguration` Allows to get a given configuration key in a given language
- `onConfigurationChanged` Listen to configuration change
- `updateKeybindings` aAlows to update the editor keybindings with the same syntax as in VS Code
- `updateEditorKeybindingsMode` Switch between `vim`, `emacs` or `classic` keybindings
