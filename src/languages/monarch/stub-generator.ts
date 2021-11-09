import * as monaco from 'monaco-editor'

export const language = <monaco.languages.IMonarchLanguage>{
  keywords: ['read', 'loop', 'gameloop', 'write', 'INPUT', 'OUTPUT', 'STATEMENT', 'loopline', 'call', 'dump'],
  tokenizer: {
    root: [
      [/[a-zA-Z_$][\w$]*/, {
        cases: {
          '@keywords': { token: 'keyword.$0' },
          '@default': 'identifier'
        }
      }]
    ]
  }
}
