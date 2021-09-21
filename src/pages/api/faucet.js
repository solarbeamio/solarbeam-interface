import getConfig from 'next/config'
import faunadb from 'faunadb'

const { serverRuntimeConfig } = getConfig()
const Web3 = require('web3')
const { default: axios } = require('axios')
const NETWORK_URL = 'https://rpc.moonriver.moonbeam.network'
const web3 = new Web3(NETWORK_URL)
const q = faunadb.query
const client = new faunadb.Client({
  secret: serverRuntimeConfig.faunadbSecret,
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
  } catch (ex) {}
  return false
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
      value: web3.utils.toWei(`${value}`, 'ether'),
    }
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionParams, wallet.privateKey)

    await blackList(to, ip)

    web3.eth
      .sendSignedTransaction(signedTransaction.rawTransaction)
      .then(async () => {})
      .catch((ex) => {
        removeFromBlackList(to)
      })

    resolve({
      status: 200,
      message: `You will receive MOVR in your wallet soon.`,
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
  let result = true
  if (addr) {
    addr = addr.toLowerCase()
  }
  if (ip) {
    ip = ip.toLowerCase()
  }

  try {
    ref = await client.query(q.Get(q.Match(q.Index('address'), addr)))
  } catch (ex2) {
    try {
      ref = await client.query(q.Get(q.Match(q.Index('ip'), ip)))
      const timeLimit = parseInt(serverRuntimeConfig.faucetTimeLimit) * 60 * 1000
      if (ref && ref.data.timestamp < Date.now() - timeLimit) result = false
    } catch (ex) {
      result = false
    }
  }
  return result
}

async function blackList(addr, ip) {
  if (addr) {
    addr = addr.toLowerCase()
  }
  if (ip) {
    ip = ip.toLowerCase()
  }
  await client.query(
    q.Let(
      {
        match: q.Match(q.Index('address'), addr),
        data: { data: { address: addr, ip: ip, timestamp: Date.now() } },
      },
      q.If(
        q.Exists(q.Var('match')),
        q.Update(q.Select('ref', q.Get(q.Var('match'))), q.Var('data')),
        q.Create(q.Collection('wallets'), q.Var('data'))
      )
    )
  )
}

async function removeFromBlackList(addr) {
  if (addr) {
    addr = addr.toLowerCase()
  }
  await client.query(q.Delete(q.Select('ref', q.Get(q.Match(q.Index('address'), addr)))))
}

async function checkBridgeUsage(address) {
  const bridges = {
    ETH: `https://bridgeapi.anyswap.exchange/v2/swapin/history/${address}/1285/1/allv2?offset=0&limit=1`,
    BSC: `https://bridgeapi.anyswap.exchange/v2/swapin/history/${address}/1285/56/allv2?offset=0&limit=1`,
  }

  for (let net in bridges) {
    try {
      const res = await axios.get(bridges[net])
      if (res.data.info.length !== 0) {
        return true
      }
    } catch (error) {
      console.log(error)
    }
  }
  return false
}

export default async function handler(req, res) {
  const address = req.body['address']
  const ip = req.headers['x-nf-client-connection-ip']

  const verified = await verifyRecaptcha(req)
  if (verified) {
    const usedBridge = await checkBridgeUsage(address)
    if (usedBridge) {
      const movrBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(address)))
      if (movrBalance < 0.001) {
        const ref = await isBlacklisted(address, ip)
        if (ref) {
          res.status(200).json({
            status: 400,
            message: 'You have reach your personal limit.',
          })
        } else {
          const ret = await faucetSend(req)
          res.status(200).json(ret)
        }
      } else {
        await blackList(address, ip)
        res.status(200).json({
          status: 403,
          message:
            'Your current MOVR balance is above the minimum requirement to use the faucet.',
        })
      }
    } else {
      res.status(200).json({
        status: 403,
        message: 'This feature is available only for wallets which have used a bridge. If you used a bridge recently, please try again in some minutes.',
      })
    }
  } else {
    res.status(200).json({
      status: 400,
      message: 'Invalid captcha.',
    })
  }
}