import getConfig from 'next/config'
import faunadb from 'faunadb' /* Import faunaDB sdk */
const { serverRuntimeConfig } = getConfig()

const Web3 = require('web3')
const { default: axios } = require('axios')
const NETWORK_URL = 'https://rpc.moonriver.moonbeam.network'
const web3 = new Web3(NETWORK_URL)

let inOrder = false
let history = {
  ips: {},
  wallets: {}
}

const q = faunadb.query
const client = new faunadb.Client({
  secret: serverRuntimeConfig.faunadbSecret
})

async function verifyRecaptcha(req) {
  const key = req.body['g-recaptcha-response']
  try {
    const response = await axios.get(
      `https://www.google.com/recaptcha/api/siteverify?secret=${serverRuntimeConfig.captchaSecret}&response=${key}`
    )
    if (response.data.success) {
      return true
    }
  } catch (ex) {
  }
  return false
}

function checkLimit(req) {
  const address = req.body['address'].toLowerCase()
  const ip = req.headers['x-nf-client-connection-ip']

  const timeLimit = parseInt(serverRuntimeConfig.faucetTimeLimit) * 60 * 1000
  if (
    (history.ips.hasOwnProperty(ip) && history.ips[ip] > Date.now() - timeLimit) ||
    (history.wallets.hasOwnProperty(address) && history.wallets[address] > Date.now() - timeLimit)
  ) {
    return `You have reached the daily limit. Try again in ${timeLeft(history.ips[ip])}`
  }
}

async function faucetSend(req) {
  const to = req.body['address']
  const ip = req.headers['x-nf-client-connection-ip']
  const value = serverRuntimeConfig.faucetAmountAdd
  const wallet = await web3.eth.accounts.wallet.add(serverRuntimeConfig.faucetWalletPrivateKey)
  const gasPrice = await web3.utils.toWei(serverRuntimeConfig.faucetGas, 'gwei')
  return new Promise(async (resolve, reject) => {
    const transactionParams = {
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: '0x9C40',
      to: to,
      from: wallet.address,
      value: web3.utils.toWei(`${value}`, 'ether')
    }
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionParams, wallet.privateKey)

    await blackList(to, ip)

    web3.eth
      .sendSignedTransaction(signedTransaction.rawTransaction)
      .then(async () => {
      })
      .catch((ex) => {
      })

    resolve({
      status: 200,
      message: `You will receive MOVR in your wallet soon.`
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
  const timeNeeded = serverRuntimeConfig.faucetTimeLimit * 60 * 1000
  const timePassed = Date.now() - timestamp
  const timeLeft = timeNeeded - timePassed
  return secondsToString(timeLeft / 1000)
}

async function isBlacklisted(addr, ip) {
  let ref
  if (addr) {
    addr = addr.toLowerCase()
  }
  if (ip) {
    ip = ip.toLowerCase()
  }

  try {
    ref = await client.query(q.Get(q.Match(q.Index('address'), addr)))
  } catch (ex) {
    try {
      ref = await client.query(q.Get(q.Match(q.Index('ip'), ip)))
    } catch (ex2) {
    }
  }

  return ref
}

async function blackList(addr, ip) {
  if (addr) {
    addr = addr.toLowerCase()
  }
  if (ip) {
    ip = ip.toLowerCase()
  }
  await client.query(q.Create(q.Collection('wallets'), { data: { address: addr, ip: ip } }))
}

// async function removeFromBlackList(addr, ip) {
//   await client.query(q.Create(q.Collection('wallets'), { data: { address: addr, ip } }))
// }

export default async function handler(req, res) {
  const address = req.body['address']
  const ip = req.headers['x-nf-client-connection-ip']

  if (!inOrder) {
    inOrder = true
    const verified = await verifyRecaptcha(req)
    if (verified) {
      const ref = await isBlacklisted(address, ip)
      if (ref) {
        res.status(200).json({
          status: 400,
          message: 'Personal limit reached.'
        })
      } else {
        const ret = await faucetSend(req)
        res.status(200).json(ret)
      }
    } else {
      res.status(200).json({
        status: 400,
        message: 'Invalid captcha.'
      })
    }
    inOrder = false
  } else {
    res.status(200).json({
      status: 429,
      message: 'Processing too many orders, please try again in a moment.'
    })
  }
}
