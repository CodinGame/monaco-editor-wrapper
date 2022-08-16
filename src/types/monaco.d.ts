import { IRange } from 'monaco-editor'

declare module 'monaco-editor' {
    namespace editor {
        interface IStandaloneCodeEditor {
            setHiddenAreas(ranges: IRange[]): void
        }
    }
}
