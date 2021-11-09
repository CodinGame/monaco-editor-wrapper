import * as monaco from 'monaco-editor'

export default class EditorModelResolverService extends monaco.extra.SimpleEditorModelResolverService {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (modelService: monaco.extra.IModelService) {
    super(modelService)
  }

  private providers: monaco.extra.ITextModelContentProvider[] = []
  public registerTextModelContentProvider (scheme: string, provider: monaco.extra.ITextModelContentProvider): monaco.IDisposable {
    this.providers.push(provider)

    return {
      dispose: () => {
        const index = this.providers.indexOf(provider)
        if (index >= 0) {
          this.providers.splice(index, 1)
        }
      }
    }
  }

  public async fetchModel (resource: monaco.Uri): Promise<monaco.editor.ITextModel | null> {
    try {
      return await Promise.any(this.providers.map(provider => provider.provideTextContent(resource)))
    } catch (err) {
      return null
    }
  }

  async createModelReference (resource: monaco.Uri): Promise<monaco.IReference<monaco.extra.IResolvedTextEditorModel>> {
    try {
      return await super.createModelReference(resource)
    } catch (error) {
      await this.fetchModel(resource)
      return super.createModelReference(resource)
    }
  }
}
