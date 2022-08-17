import { configurationRegistry, ConfigurationScope } from 'vscode/service-override/configuration'

/**
 * comes from https://github.com/microsoft/vscode/blob/16d0a319b28caa4b6cf4e6801fd508282b7533e0/src/vs/workbench/contrib/files/browser/files.contribution.ts#L132
 * files.exclude and files.associations are required by the Lua language server
 */
export const FILES_EXCLUDE_CONFIG = 'files.exclude'
export const FILES_ASSOCIATIONS_CONFIG = 'files.associations'
const isWeb = true
const nls = {
  localize: (key: string, defaultValue: string) => defaultValue
}
configurationRegistry.registerConfiguration({
  id: 'files',
  order: 9,
  title: 'Files',
  type: 'object',
  properties: {
    'files.eol': {
      type: 'string',
      enum: [
        '\n',
        '\r\n',
        'auto'
      ],
      enumDescriptions: [
        nls.localize('eol.LF', 'LF'),
        nls.localize('eol.CRLF', 'CRLF'),
        nls.localize('eol.auto', 'Uses operating system specific end of line character.')
      ],
      default: 'auto',
      description: nls.localize('eol', 'The default end of line character.'),
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE
    },
    [FILES_EXCLUDE_CONFIG]: {
      type: 'object',
      markdownDescription: nls.localize('exclude', 'Configure glob patterns for excluding files and folders. For example, the file Explorer decides which files and folders to show or hide based on this setting. Refer to the `#search.exclude#` setting to define search specific excludes. Read more about glob patterns [here](https://code.visualstudio.com/docs/editor/codebasics#_advanced-search-options).'),
      default: {
        ...{ '**/.git': true, '**/.svn': true, '**/.hg': true, '**/CVS': true, '**/.DS_Store': true, '**/Thumbs.db': true },
        ...(isWeb as boolean ? { '**/*.crswap': true /* filter out swap files used for local file access */ } : undefined)
      },
      scope: ConfigurationScope.RESOURCE,
      additionalProperties: {
        anyOf: [
          {
            type: 'boolean',
            description: nls.localize('files.exclude.boolean', 'The glob pattern to match file paths against. Set to true or false to enable or disable the pattern.')
          },
          {
            type: 'object',
            properties: {
              when: {
                type: 'string', // expression ({ "**/*.js": { "when": "$(basename).js" } })
                pattern: '\\w*\\$\\(basename\\)\\w*',
                default: '$(basename).ext',
                description: nls.localize('files.exclude.when', 'Additional check on the siblings of a matching file. Use $(basename) as variable for the matching file name.')
              }
            }
          }
        ]
      }
    },
    [FILES_ASSOCIATIONS_CONFIG]: {
      type: 'object',
      markdownDescription: nls.localize('associations', 'Configure file associations to languages (e.g. `"*.extension": "html"`). These have precedence over the default associations of the languages installed.'),
      additionalProperties: {
        type: 'string'
      }
    }
  }
})
