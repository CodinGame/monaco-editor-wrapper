module.exports = {
  ...require('@codingame/semantic-release-config'),
  branches: [
    'main',
    { name: '*', channel: 'next', prerelease: true }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    '@semantic-release/github'
  ]
}