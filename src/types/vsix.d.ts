declare module '*.vsix' {
  const whenReady: () => Promise<void>
  export { whenReady }
}
