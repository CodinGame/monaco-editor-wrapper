export function normalizeStringLineBreaks (str: string, lineBreakCharacter: string): string {
  return str.replace(/\r\n|\r|\n/g, lineBreakCharacter)
}
