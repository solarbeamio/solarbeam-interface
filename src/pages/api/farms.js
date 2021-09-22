const Web3 = require('web3')
import distributorAbi from '../../constants/abis/solar-distributor.json'
import pairAbi from '../../constants/abis/uniswap-v2-pair.json'
import { POOLS } from '../../constants/farms'
import { ChainId } from '../../sdk'

const NETWORK_URL = 'https://moonriver-api.bwarelabs.com/0e63ad82-4f98-46f9-8496-f75657e3a8e4'
const web3 = new Web3(NETWORK_URL)

export default async function handler(req, res) {
  const ret = await farms()
  res.status(200).json(ret)
}

let farmsResult = null

export async function farms() {
  if (!farmsResult) {
    let distributorContract = new web3.eth.Contract(distributorAbi, '0xf03b75831397D4695a6b9dDdEEA0E578faa30907')
    const poolLength = await distributorContract.methods.poolLength().call()

    const forHelper = []
    for (let index = 0; index < poolLength; index++) {
      forHelper.push(index)
    }

    const poolsInfo = []
    const poolsInfoPromises = []

    for (const poolIndex of forHelper) {
      poolsInfoPromises.push(distributorContract.methods.poolInfo(poolIndex).call())
    }

    const poolInfosResult = await Promise.all(poolsInfoPromises)
    poolInfosResult.forEach((poolInfo) => {
      poolsInfo.push({
        ...poolInfo,
      })
    })

    const ret = []
    const poolStaticInfo = POOLS[ChainId.MOONRIVER]

    for (const pool of poolsInfo) {
      const staticInfo = poolStaticInfo[web3.utils.toChecksumAddress(pool.lpToken)]

      if (!staticInfo.token1) {
        ret.push({
          address: staticInfo.token0.id,
          baseSymbol: staticInfo.token0.symbol.toLowerCase().replace('wmovr', 'movr'),
          baseAmount: pool.totalLp / 10 ** staticInfo.token0?.decimals,
          single: true,
        })
      } else {
        let lpContract = new web3.eth.Contract(pairAbi, pool.lpToken)
        const promisesCall = [
          lpContract.methods.getReserves().call(),
          lpContract.methods.totalSupply().call(),
          lpContract.methods.token0().call(),
          lpContract.methods.token1().call(),
          lpContract.methods.balanceOf('0xf03b75831397D4695a6b9dDdEEA0E578faa30907').call(),
        ]

        const [reserves, totalSupply, token0, token1, distributorBalance] = await Promise.all(promisesCall)
        const distributorRatio = distributorBalance / totalSupply

        const token0info =
          web3.utils.toChecksumAddress(token0) == web3.utils.toChecksumAddress(staticInfo.token0.id)
            ? staticInfo.token0
            : staticInfo.token1
        const token1info =
          web3.utils.toChecksumAddress(token1) == web3.utils.toChecksumAddress(staticInfo.token1.id)
            ? staticInfo.token1
            : staticInfo.token0

        const { reserve0, reserve1 } = reserves
        const token0amount = Number(Number(Number(reserve0) / 10 ** token0info?.decimals).toString()) * distributorRatio
        const token1amount = Number(Number(Number(reserve1) / 10 ** token1info?.decimals).toString()) * distributorRatio

        ret.push({
          address: web3.utils.toChecksumAddress(pool.lpToken),
          baseSymbol:
            token0info.symbol == 'SOLAR' || token1info.symbol == 'SOLAR'
              ? 'solar'
              : token0info.symbol == 'MOVR' || token1info.symbol == 'MOVR'
              ? 'movr'
              : token0info.symbol == 'USDC' || token1info.symbol == 'USDC'
              ? 'usdc'
              : '',
          baseAmount:
            token0info.symbol == 'SOLAR' || token0info.symbol == 'MOVR'
              ? token0amount
              : token1info.symbol == 'SOLAR' || token1info.symbol == 'MOVR'
              ? token1amount
              : token0info.symbol == 'USDC'
              ? token0amount
              : token1info.symbol == 'USDC'
              ? token1amount
              : 0,
          single: false,
        })
      }
    }
    farmsResult = ret;
    return ret;
  }
  else {
    return farmsResult;
  }
}
