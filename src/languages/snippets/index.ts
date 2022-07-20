import * as monaco from 'monaco-editor'
import snippetLoader from '../extensions/snippetLoader'

class SimpleSnippetService implements monaco.extra.ISnippetsService {
  _serviceBrand: undefined

  isEnabled (snippet: monaco.extra.Snippet): boolean {
    return snippet.snippetIdentifier != null || true
  }

  updateEnablement (): void {
    throw new Error('Method not implemented.')
  }

  async getSnippets (languageId: string, opt?: monaco.extra.ISnippetGetOptions): Promise<monaco.extra.Snippet[]> {
    const result: monaco.extra.Snippet[] = []
    const loader = snippetLoader[languageId]
    if (loader != null) {
      const rawSnippets = await loader()
      const snippets = Object.entries(rawSnippets)
        .flatMap(([name, value]) => monaco.extra.parseSnippet(name, value, [languageId], 'User Snippet', monaco.extra.SnippetSource.Extension))
      monaco.extra.snippetScopeSelect(snippets, languageId, result)
    }
    return this._filterSnippets(result, opt)
  }

  getSnippetsSync (): monaco.extra.Snippet[] {
    throw new Error('Method not implemented.')
  }

  private _filterSnippets (snippets: monaco.extra.Snippet[], opts?: monaco.extra.ISnippetGetOptions): monaco.extra.Snippet[] {
    return snippets.filter(snippet => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return (snippet.prefix != null || (opts?.includeNoPrefixSnippets ?? false)) && // prefix or no-prefix wanted
            (this.isEnabled(snippet) || (opts?.includeDisabledSnippets ?? false)) // enabled or disabled wanted
    })
  }
}

setTimeout(() => {
  // In a timeout so the service can be overriden
  const languageService = monaco.extra.StandaloneServices.get(monaco.languages.ILanguageService)
  const languageConfigurationService = monaco.extra.StandaloneServices.get(monaco.languages.ILanguageConfigurationService)
  monaco.extra.setSnippetSuggestSupport(new monaco.extra.SnippetCompletionProvider(languageService, new SimpleSnippetService(), languageConfigurationService))
})
