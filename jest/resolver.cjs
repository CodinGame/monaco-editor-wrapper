const browserResolve = require('browser-resolve')

module.exports = (path, options) => {
  try {
    return browserResolve.sync(path, options)
  } catch (error) {
    return options.defaultResolver(path, options)
  }
}
