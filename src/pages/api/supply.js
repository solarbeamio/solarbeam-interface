const Web3 = require('web3')
import tokenAbi from '../../constants/abis/erc20.json'
import vaultsAbi from '../../constants/abis/solar-vault.json'

const NETWORK_URL = 'https://moonriver-api.bwarelabs.com/0e63ad82-4f98-46f9-8496-f75657e3a8e4'
const web3 = new Web3(NETWORK_URL)

export default async function handler(req, res) {
  const vaultsAddress = '0x7e6E03822D0077F3C417D33caeAc900Fc2645679'
  const solarAddress = '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B'
  const deadAddresss = '0x000000000000000000000000000000000000dEaD'

  const solarContract = new web3.eth.Contract(tokenAbi, solarAddress)
  const totalSupply = await solarContract.methods.totalSupply().call()

  const vaultsContract = new web3.eth.Contract(vaultsAbi, vaultsAddress)
  const poolLength = await vaultsContract.methods.poolLength().call()

  const forHelper = []
  for (let index = 0; index < poolLength; index++) {
    forHelper.push(index)
  }
  const poolsInfo = []
  const poolsInfoPromises = []

  for (const poolIndex of forHelper) {
    poolsInfoPromises.push(vaultsContract.methods.poolInfo(poolIndex).call())
  }

  const poolInfosResult = await Promise.all(poolsInfoPromises)
  poolInfosResult.forEach((poolInfo) => {
    poolsInfo.push({
      ...poolInfo,
    })
  })

  let lockedInVaults = 0

  poolsInfo
    .filter((r) => r.lockupDuration > 0)
    .forEach((r) => {
      lockedInVaults += +r.totalLp
    })

  const totalBurned = await solarContract.methods.balanceOf(deadAddresss).call()

  const circulatingSupply = (+totalSupply - +lockedInVaults - +totalBurned) / 1e18
  res.status(200).json(circulatingSupply)
}
