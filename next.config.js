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
      domains: ['app.solarbeam.io', 'res.cloudinary.com', 'raw.githubusercontent.com', 'logos.covalenthq.com'],
    },
    reactStrictMode: true,
    serverRuntimeConfig: {
      captchaSecret: process.env.GOOGLE_CAPTCHA_SECRET,
      faucetWalletPrivateKey: process.env.FAUCET_WALLET_PRIVATE_KEY,
      faucetAmountAdd: process.env.FAUCET_AMOUNT_ADD,
      faucetGas: process.env.FAUCET_GAS_PRICE_GWEI,
      faucetTimeLimit: process.env.FAUCET_TIME_LIMIT_MIN,
      faunadbSecret: process.env.FAUNADB_SECRET,
    },
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
