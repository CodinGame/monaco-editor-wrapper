module.exports = {
  plugins: [
    ['@babel/plugin-transform-modules-commonjs', {
      importInterop: 'babel'
    }],
    'babel-plugin-transform-import-meta'
  ],
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript'
  ]
}
