/* Add custom blocks parsing (for tech.io):
// { [autofold]
//  custom block content
// }
*/
const CUSTOM_BLOCK_BEGIN_REGEX = '^\\s*(?:\\/\\/|#).*(?:\\{|#region)'
const CUSTOM_BLOCK_END_REGEX = '^\\s*(?:\\/\\/|#).*(?:\\}|#endregion)'

interface IRegExp {
  pattern: string
  flags?: string
}
export interface ILanguageConfiguration {
  folding?: {
    offSide?: boolean
    markers?: {
      start?: string | IRegExp
      end?: string | IRegExp
    }
  }
}

function regexOr (regex: string, add: string): string
function regexOr (regex: undefined | string | IRegExp, add: string): string | IRegExp
function regexOr (regex: undefined | string | IRegExp, add: string): string | IRegExp {
  if (regex == null) {
    return add
  } else if (typeof regex === 'string') {
    return `(?:${regex})|(?:${add})`
  } else {
    return {
      flags: regex.flags,
      pattern: regexOr(regex.pattern, add)
    }
  }
}

export function addCustomFoldingMarkers<T extends ILanguageConfiguration> (configuration: T): T {
  const markers = configuration.folding?.markers
  return {
    ...configuration,
    folding: {
      ...configuration.folding ?? {},
      markers: {
        start: regexOr(markers?.start, CUSTOM_BLOCK_BEGIN_REGEX),
        end: regexOr(markers?.end, CUSTOM_BLOCK_END_REGEX)
      }
    }
  }
}
