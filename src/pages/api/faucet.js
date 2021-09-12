const Web3 = require('web3')
const { default: axios } = require('axios')
const NETWORK_URL = 'https://rpc.moonriver.moonbeam.network'
const web3 = new Web3(NETWORK_URL)

let inOrder = false
let history = {
  ips: {},
  wallets: {},
}

async function verifyRecaptcha(req) {
  const key = req.body['g-recaptcha-response']
  console.log(process.env.GOOGLE_CAPTCHA_SECRET)
  console.log(key)
  try {
    const response = await axios.get(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA_SECRET}&response=${key}`
    )
    if (response.data.success) {
      return true
    }
  } catch (ex) {}
  return false
}

function checkLimit(req) {
  const address = req.body['address'].toLowerCase()
  const ip = req.connection.remoteAddress
  const timeLimit = parseInt(process.env.FAUCET_TIME_LIMIT_MIN) * 60 * 1000
  if (
    (history.ips.hasOwnProperty(ip) && history.ips[ip] > Date.now() - timeLimit) ||
    (history.wallets.hasOwnProperty(address) && history.wallets[address] > Date.now() - timeLimit)
  ) {
    return `You have reached the daily limit. Try again in ${timeLeft(history.ips[ip])}`
  }
}

async function faucetSend(req) {
  const to = req.body['address']
  const value = process.env.FAUCET_AMOUNT_ADD
  const wallet = await web3.eth.accounts.wallet.add(process.env.FAUCET_WALLET_PRIVATE_KEY)
  const gasPrice = await web3.utils.toWei(process.env.FAUCET_GAS_PRICE_GWEI, 'gwei')
  return new Promise(async (resolve, reject) => {
    const transactionParams = {
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: '0x9C40',
      to: to,
      from: wallet.address,
      value: web3.utils.toWei(`${value}`, 'ether'),
    }
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionParams, wallet.privateKey)

    history.ips[req.connection.remoteAddress] = Date.now()
    history.wallets[to] = Date.now()

    web3.eth
      .sendSignedTransaction(signedTransaction.rawTransaction)
      .then(() => {
        history.ips[req.connection.remoteAddress] = Date.now()
        history.wallets[to] = Date.now()
      })
      .catch((ex) => {
        delete history.ips[req.connection.remoteAddress]
        delete history.wallets[to]
      })

    resolve({
      status: 200,
      message: 'You will receive MOVR in your wallet soon.',
    })
  })
}

function secondsToString(uptime) {
  if (uptime > 86400) {
    uptime = uptime / 86400
    return uptime.toFixed(3) + ' days.'
  } else if (uptime > 3600) {
    uptime = uptime / 3600
    return uptime.toFixed(0) + ' hours.'
  } else if (uptime > 60) {
    uptime = uptime / 60
    return uptime.toFixed(0) + ' minutes.'
  } else {
    return uptime.toFixed(0) + ' seconds.'
  }
}

function timeLeft(timestamp) {
  const timeNeeded = process.env.FAUCET_TIME_LIMIT_MIN * 60 * 1000
  const timePassed = Date.now() - timestamp
  const timeLeft = timeNeeded - timePassed
  return secondsToString(timeLeft / 1000)
}

export default async function handler(req, res) {
  if (!inOrder) {
    inOrder = true
    const verified = await verifyRecaptcha(req)
    if (verified) {
      const limitMessage = checkLimit(req)
      if (!limitMessage) {
        const ret = await faucetSend(req)
        inOrder = false
        res.status(200).json(ret)
      } else {
        inOrder = false
        res.status(200).json({
          status: 400,
          message: limitMessage,
        })
      }
    } else {
      inOrder = false
      res.status(200).json({
        status: 400,
        message: 'Invalid captcha.',
      })
    }
  } else {
    inOrder = false
    res.status(200).json({
      status: 429,
      message: 'Processing too many orders, please try again in a moment.',
    })
  }
}
