import * as monaco from 'monaco-editor'
import defaultTMTheme from './defaultTheme.json'
import { addVSCodeTheme } from './registry'
import './semanticHighlight'
import { IVSCodeTheme } from './tools'

addVSCodeTheme('codingame-light', defaultTMTheme as IVSCodeTheme).then(() => {
  monaco.editor.setTheme('codingame-light')
}, err => {
  console.error('Unable to add default vscode theme', err)
})

export {
  addVSCodeTheme
}
