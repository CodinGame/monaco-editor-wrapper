import { whenReady as whenReadyCustomExtension } from './customExtensions'
import { whenReady as whenReadyExtension } from '../extensions/*.vsix'

const whenReady = async () => {
  await Promise.all([whenReadyCustomExtension(), whenReadyExtension()])
}

export { whenReady }
