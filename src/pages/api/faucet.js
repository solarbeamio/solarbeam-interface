const Web3 = require('web3')
const { default: axios } = require('axios')
const NETWORK_URL = 'https://rpc.moonriver.moonbeam.network'
const web3 = new Web3(NETWORK_URL)

export default async function handler(req, res) {
  const ret = await faucet(req)
  res.status(200).json(ret)
}

let inOrder = false
let history = {
  ips: {},
  wallets: {},
}

async function faucet(request) {
  const ret = []
  if (!inOrder) {
    inOrder = true
    try {
      checkLimit(request)
      const { address } = request.query
      const amount = process.env.FAUCET_AMOUNT_ADD
      const receipt = await web3Request(address, amount)
      ret.push({
        status: 200,
        message: `You have successfuly been sent ${amount} MOVR`,
      })
    } catch (error) {
      ret.push({
        status: 429,
        message: error.message,
      })
    }
    inOrder = false
  } else {
    ret.push({
      status: 429,
      message: 'Processing too many orders, please try again in a moment',
    })
  }
  return ret
}

function checkLimit(request) {
  const address = request.query.address.toLowerCase()
  const timeLimit = parseInt(process.env.FAUCET_TIME_LIMIT_MIN) * 60 * 1000
  if (
    // TODO need to find ip from request
    (history.ips.hasOwnProperty(request.ip) && history.ips[request.ip] > Date.now() - timeLimit) ||
    (history.wallets.hasOwnProperty(address) && history.wallets[address] > Date.now() - timeLimit)
  ) {
    throw new Error(
      `You have reached the daily limit. <br> <b>Limit expires</b> in ${timeLeft(history.ips[request.ip])}`
    )
  }
  history.ips[request.ip] = Date.now()
  history.wallets[address] = Date.now()
}

function secondsToString(uptime) {
  if (uptime > 86400) {
    uptime = uptime / 86400
    return uptime.toFixed(3) + ' days'
  } else if (uptime > 3600) {
    uptime = uptime / 3600
    return uptime.toFixed(2) + ' hours'
  } else if (uptime > 60) {
    uptime = uptime / 60
    return uptime.toFixed(2) + ' minutes'
  } else {
    return uptime.toFixed(0) + ' seconds'
  }
}

function timeLeft(timestamp) {
  const timeNeeded = process.env.REDIS_EXPIRE_SECONDS * 1000
  const timePassed = Date.now() - timestamp
  const timeLeft = timeNeeded - timePassed
  return secondsToString(timeLeft / 1000)
}

async function web3Request(to, value) {
  return new Promise(async (resolve, reject) => {
    const transactionParams = {
      //TODO fix nonce
      nonce: this.nonce,
      gasPrice: web3.utils.toHex(this.gasPrice),
      gasLimit: '0x9C40',
      to: to,
      //TODO fix address
      from: this.wallet.address,
      value: web3.utils.toWei(`${value}`, 'ether'),
    }
    // TODO manage wallet privateKey
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionParams, this.wallet.privateKey)

    web3.eth
      .sendSignedTransaction(signedTransaction.rawTransaction)
      .then((tx) => {
        this.nonce = `${parseInt(this.nonce, 10) + 1}`
        console.log(tx)
        resolve(tx)
      })
      .catch((error) => {
        this.nonce = `${parseInt(this.nonce, 10) + 1}`
        console.log(error)
        reject(error)
      })
    console.log(`Sent ${value} MOVR to ${to}`)
  })
}
