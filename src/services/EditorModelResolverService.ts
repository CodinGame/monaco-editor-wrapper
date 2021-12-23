// This file is inspired by https://github.com/microsoft/vscode/blob/4ed0329e9c5e12e2c7c59697facc96020b0768ab/src/vs/workbench/services/textmodelResolver/common/textModelResolverService.ts
import * as monaco from 'monaco-editor'

export class SimpleResolvedModel implements monaco.extra.IResolvedTextEditorModel {
  private readonly _onWillDispose: monaco.Emitter<void>

  constructor (
    private model: monaco.editor.ITextModel,
    private readonly: boolean
  ) {
    this._onWillDispose = new monaco.Emitter<void>()
  }

  public get onWillDispose (): monaco.IEvent<void> {
    return this._onWillDispose.event
  }

  public resolve (): Promise<void> {
    return Promise.resolve()
  }

  public get textEditorModel (): monaco.editor.ITextModel {
    return this.model
  }

  public createSnapshot (): monaco.editor.ITextSnapshot {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.model as any).createSnapshot()
  }

  public isReadonly (): boolean {
    return this.readonly
  }

  private disposed = false
  public dispose (): void {
    this.disposed = true

    this._onWillDispose.fire()
  }

  public isDisposed (): boolean {
    return this.disposed
  }

  public isResolved (): boolean {
    return true
  }

  public getMode (): string | undefined {
    return this.model.getLanguageId()
  }
}

class ResourceModelCollection extends monaco.extra.ReferenceCollection<Promise<SimpleResolvedModel>> {
  private readonly providers = new Map<string, monaco.extra.ITextModelContentProvider[]>()
  private readonly modelsToDispose = new Set<string>()

  protected async createReferencedObject (key: string): Promise<SimpleResolvedModel> {
    // Untrack as being disposed
    this.modelsToDispose.delete(key)
    const resource = monaco.Uri.parse(key)

    const existingModel = monaco.editor.getModel(resource)
    if (existingModel != null) {
      return new SimpleResolvedModel(existingModel, false)
    }

    if (this.providers.has(resource.scheme)) {
      const model = await this.resolveTextModelContent(key)

      const resolvedModel = new SimpleResolvedModel(model, true)
      resolvedModel.onWillDispose(() => {
        model.dispose()
      })

      return resolvedModel
    }

    throw new Error(`Unable to resolve resource ${key}`)
  }

  protected destroyReferencedObject (key: string, modelPromise: Promise<SimpleResolvedModel>): void {
    const resource = monaco.Uri.parse(key)
    if (resource.scheme === 'untitled' || resource.scheme === 'inMemory') {
      return
    }

    this.modelsToDispose.add(key)

    ;(async () => {
      try {
        const model = await modelPromise

        if (!this.modelsToDispose.has(key)) {
          // return if model has been acquired again meanwhile
          return
        }

        // Finally we can dispose the model
        model.dispose()
      } finally {
        this.modelsToDispose.delete(key) // Untrack as being disposed
      }
    })().catch(() => {
      // ignore
    })
  }

  registerTextModelContentProvider (scheme: string, provider: monaco.extra.ITextModelContentProvider): monaco.IDisposable {
    let providers = this.providers.get(scheme)
    if (providers == null) {
      providers = []
      this.providers.set(scheme, providers)
    }

    providers.unshift(provider)

    return monaco.extra.toDisposable(() => {
      const providersForScheme = this.providers.get(scheme)
      if (providersForScheme == null) {
        return
      }

      const index = providersForScheme.indexOf(provider)
      if (index === -1) {
        return
      }

      providersForScheme.splice(index, 1)

      if (providersForScheme.length === 0) {
        this.providers.delete(scheme)
      }
    })
  }

  hasTextModelContentProvider (scheme: string): boolean {
    return this.providers.get(scheme) !== undefined
  }

  private async resolveTextModelContent (key: string): Promise<monaco.editor.ITextModel> {
    const resource = monaco.Uri.parse(key)

    const providersForScheme = this.providers.get(resource.scheme) ?? []

    for (const provider of providersForScheme) {
      const value = await provider.provideTextContent(resource)
      if (value != null) {
        return value
      }
    }

    throw new Error(`Unable to resolve text model content for resource ${key}`)
  }
}

export default class EditorModelResolverService extends monaco.extra.SimpleEditorModelResolverService {
  private readonly resourceModelCollection = new ResourceModelCollection()
  private readonly asyncModelCollection = new monaco.extra.AsyncReferenceCollection(this.resourceModelCollection)

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (modelService: monaco.extra.IModelService) {
    super(modelService)
  }

  public registerTextModelContentProvider (scheme: string, provider: monaco.extra.ITextModelContentProvider): monaco.IDisposable {
    return this.resourceModelCollection.registerTextModelContentProvider(scheme, provider)
  }

  public async createModelReference (resource: monaco.Uri): Promise<monaco.extra.IReference<monaco.extra.IResolvedTextEditorModel>> {
    const result = await this.asyncModelCollection.acquire(resource.toString())
    return result
  }
}
