import { TestEnvironment } from 'jest-environment-jsdom'

class FixJSDOMEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context)

    this.dom.virtualConsole.removeAllListeners('jsdomError')
    this.dom.virtualConsole.on('jsdomError', (error) => {
      if (error.message.startsWith('Could not parse CSS stylesheet')) {
        return
      }
      context.console.error(error)
    })

    // FIXME https://github.com/jsdom/jsdom/issues/3363
    this.global.structuredClone = structuredClone
  }
}

// https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
export default FixJSDOMEnvironment
