import { useActiveWeb3React, useSolarDistributorContract, useSolarDistributorV2Contract } from '../../hooks'

import { BigNumber } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import { useCallback } from 'react'
import { calculateGasPrice } from '../../functions'

export default function useMasterChef(version) {
  const { library } = useActiveWeb3React()
  const distributor = useSolarDistributorContract()
  const distributorV2 = useSolarDistributorV2Contract()

  const contract = version == 1 ? distributor : distributorV2

  // DepositWithPermit - Distributor V2
  const depositWithPermit = useCallback(
    async (pid: number, amount: BigNumber, deadline: number, v: number, r: string, s: string) => {
      const getGasPrice = async () => {
        let gasPrice = undefined
        try {
          gasPrice = await library.getGasPrice()
          if (gasPrice) {
            gasPrice = calculateGasPrice(gasPrice)
          }
        } catch (ex) {}
        return gasPrice
      }

      try {
        const gasPrice = await getGasPrice()
        return await contract?.depositWithPermit(pid, amount.toString(), deadline, v, r, s, { gasPrice })
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract, library]
  )

  // Deposit
  const deposit = useCallback(
    async (pid: number, amount: BigNumber) => {
      const getGasPrice = async () => {
        let gasPrice = undefined
        try {
          gasPrice = await library.getGasPrice()
          if (gasPrice) {
            gasPrice = calculateGasPrice(gasPrice)
          }
        } catch (ex) {}
        return gasPrice
      }

      try {
        const gasPrice = await getGasPrice()
        return await contract?.deposit(pid, amount.toString(), { gasPrice })
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract, library]
  )

  // Withdraw
  const withdraw = useCallback(
    async (pid: number, amount: BigNumber) => {
      const getGasPrice = async () => {
        let gasPrice = undefined
        try {
          gasPrice = await library.getGasPrice()
          if (gasPrice) {
            gasPrice = calculateGasPrice(gasPrice)
          }
        } catch (ex) {}
        return gasPrice
      }

      try {
        const gasPrice = await getGasPrice()
        return await contract?.withdraw(pid, amount, { gasPrice })
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract, library]
  )

  const harvest = useCallback(
    async (pid: number) => {
      const getGasPrice = async () => {
        let gasPrice = undefined
        try {
          gasPrice = await library.getGasPrice()
          if (gasPrice) {
            gasPrice = calculateGasPrice(gasPrice)
          }
        } catch (ex) {}
        return gasPrice
      }

      try {
        const gasPrice = await getGasPrice()
        return await contract?.deposit(pid, Zero, { gasPrice })
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract, library]
  )

  return { deposit, depositWithPermit, withdraw, harvest }
}
