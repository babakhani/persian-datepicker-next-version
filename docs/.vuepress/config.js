const pkg = require('../../package.json')
const title = pkg.name
const description = pkg.description
const url = pkg.homepage
const image = pkg.logo

module.exports = {
  base: '/docs/',
  dest: './docs/dist',
  title: title,
  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: `https://fonts.googleapis.com/css?family=Roboto:200,300,400`,
      },
    ],
    ['link', { rel: 'icon', href: `/favicon.png` }],
    ['meta', { name: 'theme-color', content: `green` }],
    ['format-detection', { content: 'telephone=no' }],
    ['next', { content: url }],
    ['meta', { name: 'dc.language', content: 'UK' }],
    ['meta', { name: 'dc.source', content: url }],
    ['meta', { name: 'dc.relation', content: url }],
    ['meta', { name: 'dc.title', content: title }],
    ['meta', { name: 'dc.description', content: description }],
    ['meta', { name: 'og:url', content: url }],
    ['meta', { name: 'og:title', content: title }],
    ['meta', { name: 'og:site_name', content: title }],
    ['meta', { name: 'og:description', content: description }],
    ['meta', { name: 'og:locale', content: 'en_GB' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:image', content: image }],
    ['meta', { name: 'og:image:secure_url', content: image }],
    ['meta', { name: 'og:width', content: 200 }],
    ['meta', { name: 'og:height', content: 200 }],
    ['meta', { name: 'og:type', content: 'image/png' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:site', content: `@${pkg.name}` }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }],
    ['link', { name: 'canonical', content: url }],
  ],
  description: description,
  themeConfig: {
    repo: pkg.repository,
    editLinks: true,
    editLinkText: 'Help us improve this page!',
    lastUpdated: `v${pkg.version}`,
    logo: image,
    sidebar: [
      ['/getting-started', 'Getting Started'],
      ['/example', 'Examples'],
      ['/options', 'Options'],
      ['/changes', 'Changes'],
      ['/contributing', 'Contribution'],
    ],
    docsDir: 'docs',
  },
}
