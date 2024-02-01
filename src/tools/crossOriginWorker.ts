/**
 * Cross origin workers don't work
 * The workaround used by vscode is to start a worker on a blob url containing a short script calling 'importScripts'
 * importScripts accepts to load the code inside the blob worker
 * Copied from https://github.com/jantimon/remote-web-worker/blob/main/src/index.ts
 */
export class Worker extends window.Worker {
  constructor (scriptURL: string | URL, options?: WorkerOptions) {
    const url = String(scriptURL)
    super(
      // Check if the URL is remote
      url.includes('://') && !url.startsWith(location.origin)
        // Launch the worker with an inline script that will use `importScripts`
        // to bootstrap the actual script to work around the same origin policy.
        ? URL.createObjectURL(
          new Blob(
            [
                // Replace the `importScripts` function with
                // a patched version that will resolve relative URLs
                // to the remote script URL.
                //
                // Without a patched `importScripts` Webpack 5 generated worker chunks will fail with the following error:
                //
                // Uncaught (in promise) DOMException: Failed to execute 'importScripts' on 'WorkerGlobalScope':
                // The script at 'http://some.domain/worker.1e0e1e0e.js' failed to load.
                //
                // For minification, the inlined variable names are single letters:
                // i = original importScripts
                // a = arguments
                // u = URL
                `importScripts=((i)=>(...a)=>i(...a.map((u)=>''+new URL(u,"${url}"))))(importScripts);importScripts("${url}")`
            ],
            { type: 'text/javascript' }
          )
        )
        : scriptURL,
      options
    )
  }
}
