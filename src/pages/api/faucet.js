const Web3 = require('web3')
import distributorAbi from '../../constants/abis/solar-distributor.json'
import pairAbi from '../../constants/abis/uniswap-v2-pair.json'
import { POOLS } from '../../constants/farms'
import { ChainId } from '../../sdk'

const NETWORK_URL = 'https://rpc.moonriver.moonbeam.network'
const web3 = new Web3(NETWORK_URL)

export default async function handler(req, res) {
  const ret = await faucet()
  res.status(200).json(ret)
}

let inOrder = false
let history = {
  ips: {},
  wallets: {},
}

export async function faucet() {
  try {
    inOrder = true
    const { address } = request.body
    const amount = process.env.AMOUNT_ADD
    // const receipt = await web3.request(address, amount)
    inOrder = false
    return response.send({
      success: true,
      message: `You have successfuly been sent ${amount} MOVR`,
      // receipt,
      amount,
    })
  } catch (error) {
    inOrder = false
    return errorResponse(response, error)
  }
}

function checkLimit(request, response, next) {
  const address = request.body.address.toLowerCase()
  const timeLimit = parseInt(process.env.TIME_LIMIT) * 60 * 1000
  if (
    (history.ips.hasOwnProperty(request.ip) && history.ips[request.ip] > Date.now() - timeLimit) ||
    (history.wallets.hasOwnProperty(address) && history.wallets[address] > Date.now() - timeLimit)
  ) {
    logRequest(request)
    return response.send({
      success: false,
      message: `You have reached the daily limit. <br> <b>Limit expires</b> in ${timeLeft(history.ips[request.ip])}`,
    })
  }
  logRequest(request)
  next()
}
