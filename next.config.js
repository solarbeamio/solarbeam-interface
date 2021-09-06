const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

const linguiConfig = require('./lingui.config.js')

const { locales, sourceLocale } = linguiConfig

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(
  withPWA({
    target: 'serverless',
    pwa: {
      dest: 'public',
      runtimeCaching,
      disable: true,
    },
    images: {
      domains: ['solarbeam.io', 'res.cloudinary.com', 'raw.githubusercontent.com', 'logos.covalenthq.com'],
    },
    reactStrictMode: true,
    i18n: {
      locales,
      defaultLocale: sourceLocale,
    },
    async redirects() {
      return [
        {
          source: '/',
          destination: '/exchange/swap',
          permanent: true,
        },
      ]
    },
  })
)



// Don't delete this console log, useful to see the config in Vercel deployments
console.log('next.config.js', JSON.stringify(module.exports, null, 2))
