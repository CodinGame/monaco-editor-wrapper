import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import * as monaco from 'monaco-editor'
import { registerWorkerLoader } from '../worker'

const registry = monaco.extra.Registry.as<monaco.extra.IJSONContributionRegistry>(monaco.extra.JsonContributionExtensions.JSONContribution)

// Hack because the commands are filled by a code not run in monaco-editor
{
  const allCommands = monaco.extra.CommandsRegistry.getCommands()
  const keybindingsCommandSchema = (registry.getSchemaContributions().schemas['vscode://schemas/keybindings']!.items as monaco.extra.IJSONSchema).properties!.command.anyOf![0]!
  keybindingsCommandSchema.enum = Array.from(allCommands.keys())
  keybindingsCommandSchema.enumDescriptions = <string[]>Array.from(allCommands.values()).map(command => command.description?.description)
}

const vimKeybindingsSchema = {
  type: 'object',
  properties: {
    before: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    after: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
}

function updateDiagnosticsOptions () {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    comments: 'ignore',
    validate: true,
    schemas: [{
      uri: 'vscode://schemas/settings/resourceLanguage',
      schema: registry.getSchemaContributions().schemas['vscode://schemas/settings/resourceLanguage']
    }, {
      uri: 'vscode://schemas/keybindings',
      fileMatch: ['file:///keybindings.json'],
      schema: registry.getSchemaContributions().schemas['vscode://schemas/keybindings']
    },
    {
      uri: 'vscode://schemas/settings/user',
      fileMatch: ['file:///settings.json'],
      schema: {
        properties: {
          ...monaco.extra.allSettings.properties,
          'vim.normalModeKeyBindings': {
            type: 'array',
            description: 'Remapped keys in Normal mode.',
            items: vimKeybindingsSchema
          },
          'vim.insertModeKeyBindings': {
            type: 'array',
            description: 'Remapped keys in Insert mode.',
            items: vimKeybindingsSchema
          },
          'vim.visualModeKeyBindings': {
            type: 'array',
            description: 'Remapped keys in Visual mode.',
            items: vimKeybindingsSchema
          }
        },
        patternProperties: monaco.extra.allSettings.patternProperties,
        additionalProperties: true,
        allowTrailingCommas: true,
        allowComments: true
      }
    }]
  })
}

updateDiagnosticsOptions()
registry.onDidChangeSchema(updateDiagnosticsOptions)

const workerLoader = async () => (await import(/* webpackChunkName: "MonacoJsonWorker" */'monaco-editor/esm/vs/language/json/json.worker?worker')).default
registerWorkerLoader('json', workerLoader)
