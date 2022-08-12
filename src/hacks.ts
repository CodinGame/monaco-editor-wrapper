
import * as monaco from 'monaco-editor'

/* Add custom blocks parsing (for tech.io):
// { [autofold]
//  custom block content
// }
*/
const CUSTOM_BLOCK_BEGIN_REGEX = '^\\s*(?:\\/\\/|#).*(?:\\{|#region)'
const CUSTOM_BLOCK_END_REGEX = '^\\s*(?:\\/\\/|#).*(?:\\}|#endregion)'
export function addCustomFoldingMarkers (configuration: monaco.extra.ILanguageConfiguration): monaco.extra.ILanguageConfiguration {
  const markers = configuration.folding?.markers
  return {
    ...configuration,
    folding: {
      ...configuration.folding ?? {},
      markers: {
        start: markers != null ? new RegExp(markers.start.source + '|' + CUSTOM_BLOCK_BEGIN_REGEX) : new RegExp(CUSTOM_BLOCK_BEGIN_REGEX),
        end: markers != null ? new RegExp(markers.end.source + '|' + CUSTOM_BLOCK_END_REGEX) : new RegExp(CUSTOM_BLOCK_END_REGEX)
      }
    }
  }
}
