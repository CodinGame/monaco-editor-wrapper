import { IRange } from 'monaco-editor'

declare module 'monaco-editor' {
    namespace editor {
        interface ICodeEditor {
            // This method is internal and is supposed to be used by the folding feature
            // We still use it to hide parts of the code in the `hideCodeWithoutDecoration` function
            setHiddenAreas(ranges: IRange[], source?: unknown): void

            _getViewModel(): {
                getHiddenAreas(): IRange[]
            } | undefined
        }
    }
}
