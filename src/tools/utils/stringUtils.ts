export function normalizeStringLineBreaks (str: string, lineBreakCharacter: string = '\n'): string {
  return str.replaceAll(/\r?\n|\r/g, lineBreakCharacter)
}
