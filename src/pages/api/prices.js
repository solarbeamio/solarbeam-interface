const Web3 = require('web3')
const { default: axios } = require('axios')
import IUniswapV2PairABI from '../../constants/abis/uniswap-v2-pair.json'
const NETWORK_URL = 'https://rpc.moonriver.moonbeam.network'
const web3 = new Web3(NETWORK_URL)

export default async function handler(req, res) {
  const cg_price = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=moonriver&vs_currencies=usd')
  let ret = {
    movr: cg_price.data['moonriver']['usd'],
  }

  let solarMovrContract = new web3.eth.Contract(IUniswapV2PairABI, '0x7eDA899b3522683636746a2f3a7814e6fFca75e1')
  const solarMovrReserves = await solarMovrContract.methods.getReserves().call()

  const solarMovrPrice = Number(solarMovrReserves.reserve1) / Number(solarMovrReserves.reserve0)

  let ribMovrContract = new web3.eth.Contract(IUniswapV2PairABI, '0x0acDB54E610dAbC82b8FA454b21AD425ae460DF9')
  const ribMovrReserves = await ribMovrContract.methods.getReserves().call()

  const ribMovrPrice = Number(ribMovrReserves.reserve0) / Number(ribMovrReserves.reserve1)

  ret['solar'] = solarMovrPrice * ret.movr
  ret['rib'] = ribMovrPrice * ret.movr
  ret['usdc'] = 1;

  res.status(200).json(ret)
}