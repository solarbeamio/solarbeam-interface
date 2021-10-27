import { useCallback, useMemo } from 'react'
import { useActiveWeb3React, useEclipseContract } from '../../hooks'
import { NEVER_RELOAD, useSingleCallResult, useSingleContractMultipleData } from '../../state/multicall/hooks'
import { zip } from 'lodash'
import { BigNumber } from 'ethers'

export function useEclipseUserInfo(contractAddress?: string) {
  const { account } = useActiveWeb3React()
  const contract = useEclipseContract(contractAddress, true)

  const eligible = useSingleCallResult(account ? (contract ? contract : null) : null, 'getUserEligibility', [account])
    ?.result?.[0]

  const multiplier = useSingleCallResult(contract ? contract : null, 'getUserMultiplier', [account])?.result?.[0]

  const numberPools = useSingleCallResult(contract ? contract : null, 'numberPools', undefined)?.result?.[0]

  const harvestPeriods = useSingleCallResult(contract ? contract : null, 'HARVEST_PERIODS')?.result?.[0]

  const args = useMemo(() => {
    if (!account || !numberPools) {
      return
    }
    return [account, [...Array(parseInt(numberPools.toString())).keys()]]
  }, [numberPools, account])

  const args2 = useMemo(() => {
    if (!account || !numberPools) {
      return
    }
    return [...Array(parseInt(numberPools.toString())).keys()].map((pid) => [String(account), String(pid)])
  }, [numberPools, account])

  const args3 = useMemo(() => {
    if (!account || !numberPools || !harvestPeriods) {
      return
    }
    let result = []
    for (let i = 0; i < numberPools.length; i++) {
      const pid = numberPools[i]
      for (let j = 0; j < harvestPeriods.length; j++) {
        const hid = harvestPeriods[j]
        result.push(String(account), String(pid), String(hid))
      }
    }
    return result
  }, [account, numberPools, harvestPeriods])

  const userAllocationPools = useSingleCallResult(args ? contract : null, 'viewUserAllocationPools', args)
  const userInfo = useSingleContractMultipleData(args2 ? contract : null, 'userInfo', args2)

  const claimed = useSingleContractMultipleData(args2 ? contract : null, 'hasHarvested', args3)

  return useMemo(
    () => ({
      eligible,
      multiplier,
      allocationPools: userAllocationPools.result || [],
      pools: zip(userInfo).map((data, i) => ({
        id: args2[i][1],
        amount: data[0].result?.[`amount`] || 0,
        allocPoints: data[0].result?.[`allocPoints`] || 0,
        claimed: [],
        isRefunded: data[0].result?.[`isRefunded`] || false,
      })),
    }),
    [eligible, multiplier, userAllocationPools, userInfo, args2]
  )
}

export function useEclipseInfo(contractAddress?: string) {
  const contract = useEclipseContract(contractAddress)

  const startBlock = useSingleCallResult(contract ? contract : null, 'startBlock')?.result?.[0]

  const endBlock = useSingleCallResult(contract ? contract : null, 'endBlock')?.result?.[0]

  const eligibilityThreshold = useSingleCallResult(contract ? contract : null, 'eligibilityThreshold')?.result?.[0]

  const claimEnabled = useSingleCallResult(contract ? contract : null, 'claimEnabled')?.result?.[0]

  const harvestPeriods = useSingleCallResult(contract ? contract : null, 'HARVEST_PERIODS')?.result?.[0]

  const args = useMemo(() => {
    if (!harvestPeriods) {
      return
    }
    return [...Array(parseInt(harvestPeriods.toString())).keys()].map((period) => [String(period)])
  }, [harvestPeriods])

  const harvestReleaseBlocks = useSingleContractMultipleData(args ? contract : null, 'harvestReleaseBlocks', args)
  const harvestReleasePercent = useSingleContractMultipleData(args ? contract : null, 'harvestReleasePercent', args)

  return useMemo(
    () => ({
      harvestReleaseBlocks: zip(harvestReleaseBlocks).map((data, i) => data[0].result?.[0]),
      harvestReleasePercent: zip(harvestReleasePercent).map((data, i) => data[0].result?.[0]),
      startBlock,
      endBlock,
      eligibilityThreshold,
      claimEnabled,
    }),
    [harvestReleaseBlocks, harvestReleasePercent, startBlock, endBlock, eligibilityThreshold, claimEnabled]
  )
}

export function useEclipsePools(contractAddress?: string) {
  const contract = useEclipseContract(contractAddress)

  const numberPools = useSingleCallResult(contract ? contract : null, 'numberPools', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const args = useMemo(() => {
    if (!numberPools) {
      return
    }
    return [...Array(parseInt(numberPools.toString())).keys()].map((pid) => [String(pid)])
  }, [numberPools])

  const poolInfo = useSingleContractMultipleData(args ? contract : null, 'poolInfo', args)

  return useMemo(() => {
    if (!poolInfo) {
      return []
    }
    return zip(poolInfo).map((data, i) => ({
      id: args[i][0],
      raisingAmount: data[0].result?.['raisingAmount'] || 0,
      offeringAmount: data[0].result?.['offeringAmount'] || 0,
      baseLimitInLP: data[0].result?.['baseLimitInLP'] || 0,
      hasTax: data[0].result?.['hasTax'] || false,
      totalAmountPool: data[0].result?.['totalAmountPool'] || 0,
      sumTaxesOverflow: data[0].result?.['sumTaxesOverflow'] || 0,
      totalAllocPoints: data[0].result?.['totalAllocPoints'] || 0,
    }))
  }, [args, poolInfo])
}

export function useEclipse(contractAddress?: string) {
  const contract = useEclipseContract(contractAddress)
  const { chainId, account, library } = useActiveWeb3React()

  // Deposit
  const deposit = useCallback(
    async (amount: BigNumber, pid: number) => {
      try {
        return await contract?.depositPool(amount.toString(), pid)
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract]
  )

  // Withdraw
  const withdraw = useCallback(
    async (amount: BigNumber, pid: number) => {
      try {
        return await contract?.withdrawPool(amount.toString(), pid)
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract]
  )

  const harvest = useCallback(
    async (pid: number, period: number) => {
      try {
        return await contract?.harvestPool(pid, period)
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract]
  )

  return { deposit, withdraw, harvest }
}

// const fn = contract?.interface?.getFunction('depositPool')
// const data = contract.interface.encodeFunctionData(fn, [amount.toString(), pid])

// const tx = await library.getSigner().sendTransaction({
//   value: 0x0,
//   from: account,
//   to: contractAddress,
//   data,
//   gasLimit: 1500000,
//   gasPrice: 1000000000,
// })
// console.log(tx)
