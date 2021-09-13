import { RPC } from '../../constants'
import erc20 from '../../constants/abis/erc20.json'
const Web3 = require('web3')

export default async function handler(req, res) {
  // const { chainId, account, token } = req.query
  // const web3 = new Web3(RPC[chainId])
  // let balance = new web3.eth.Contract(erc20, token)
  // const movrUSDCReserves = await movrUSDCContract.methods.balanceOf(account).call()
  // const movrUSDCPrice = (Number(movrUSDCReserves.reserve1) / Number(movrUSDCReserves.reserve0)) * 1e12
  // let solarMovrContract = new web3.eth.Contract(IUniswapV2PairABI, '0x7eDA899b3522683636746a2f3a7814e6fFca75e1')
  // const solarMovrReserves = await solarMovrContract.methods.getReserves().call()
  // const solarMovrPrice = Number(solarMovrReserves.reserve1) / Number(solarMovrReserves.reserve0)
  // let ribMovrContract = new web3.eth.Contract(IUniswapV2PairABI, '0x0acDB54E610dAbC82b8FA454b21AD425ae460DF9')
  // const ribMovrReserves = await ribMovrContract.methods.getReserves().call()
  // const ribMovrPrice = Number(ribMovrReserves.reserve0) / Number(ribMovrReserves.reserve1)
  // let ret = {}
  // ret['movr'] = movrUSDCPrice
  // ret['solar'] = solarMovrPrice * movrUSDCPrice
  // ret['rib'] = ribMovrPrice * movrUSDCPrice
  // ret['usdc'] = 1
  // res.status(200).json(ret)
}
