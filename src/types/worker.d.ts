declare module '*?worker' {
  interface WrappedWorker {
    new (): Worker
  }
  const worker: WrappedWorker
  export default worker
}
