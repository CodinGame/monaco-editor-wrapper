
import * as monaco from 'monaco-editor'
import { ModelSemanticColoring } from 'monaco-editor/esm/vs/editor/common/services/modelServiceImpl'

ModelSemanticColoring.FETCH_DOCUMENT_SEMANTIC_TOKENS_DELAY = Math.max(
  ModelSemanticColoring.FETCH_DOCUMENT_SEMANTIC_TOKENS_DELAY,
  2000
)

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
const original = monaco.languages.LanguageConfigurationRegistryImpl.prototype.getFoldingRules
monaco.languages.LanguageConfigurationRegistryImpl.prototype.getFoldingRules = function (languageId: string) {
  const foldingRules: monaco.languages.FoldingRules = original.call(this, languageId)

  const markers = foldingRules.markers
  return {
    ...foldingRules,
    markers: {
      start: markers != null ? new RegExp(markers.start.source + '|' + CUSTOM_BLOCK_BEGIN_REGEX) : new RegExp(CUSTOM_BLOCK_BEGIN_REGEX),
      end: markers != null ? new RegExp(markers.end.source + '|' + CUSTOM_BLOCK_END_REGEX) : new RegExp(CUSTOM_BLOCK_END_REGEX)
    }
  }
}
