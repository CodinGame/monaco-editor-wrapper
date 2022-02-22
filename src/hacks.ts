
import * as monaco from 'monaco-editor'

monaco.errorHandler.setUnexpectedErrorHandler(error => {
  console.error('Unexpected error', error)
})

/* Add custom blocks parsing (for tech.io):
// { [autofold]
//  custom block content
// }
*/
const CUSTOM_BLOCK_BEGIN_REGEX = '^\\w*(?:\\/\\/|#).*\\{'
const CUSTOM_BLOCK_END_REGEX = '^\\w*(?:\\/\\/|#).*\\}'
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
