export function addStyle(styleString: string): void {
  const style = document.createElement('style')
  style.textContent = styleString
  document.head.append(style)
}

addStyle(`
.monaco-hover-content h1, .monaco-hover-content h2, .monaco-hover-content h3, .monaco-hover-content h4, .monaco-hover-content h5, .monaco-hover-content h6 {
  all: revert;
}
`)
