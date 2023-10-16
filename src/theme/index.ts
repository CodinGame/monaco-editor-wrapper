import { registerColor } from 'vscode/monaco'

// Export 3 new colors used
registerColor('statusBar.foreground', {
  dark: '#ffffff',
  light: '#20252a',
  hcDark: '#ffffff',
  hcLight: '#20252a'
}, 'Status bar foreground color.')
registerColor('statusBar.background', {
  dark: '#252e38',
  light: '#ffffff',
  hcDark: null,
  hcLight: null
}, 'Status bar background color.')
registerColor('statusBar.border', {
  dark: '#41454a',
  light: '#dadada',
  hcDark: '#41454a',
  hcLight: '#dadada'
}, 'Status bar border color.')
