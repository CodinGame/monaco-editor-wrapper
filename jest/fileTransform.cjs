module.exports = {
  process (src, filename) {
    const assetFilename = JSON.stringify(filename)

    return { code: `module.exports = ${assetFilename};` }
  }
}
