import { ChainId, CurrencyAmount, JSBI } from '../../sdk'
import { Chef } from './enum'
import { SOLAR, SOLAR_ADDRESS, AVERAGE_BLOCK_TIME } from '../../constants'
import {
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../../state/multicall/hooks'
import { useContext, useMemo } from 'react'
import {
  useSolarDistributorContract,
  useSolarMovrContract,
  useMovrUsdcContract,
  useRibMovrContract,
  useSolarDistributorV2Contract,
} from '../../hooks'

import IUniswapV2PairABI from '@sushiswap/core/abi/IUniswapV2Pair.json'
import { Contract } from '@ethersproject/contracts'
import { Zero } from '@ethersproject/constants'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import zip from 'lodash/zip'
import { useToken } from '../../hooks/Tokens'
import { useVaults } from '../vault/hooks'
import { AddressMap, POOLS, TokenInfo } from '../../constants/farms'
import { PriceContext } from '../../contexts/priceContext'
import { concat } from 'lodash'
import { getTokenLogoURL } from '../../components/CurrencyLogo'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

export interface PairPrices {
  token: string
  price: number
}

export function useChefContract(chef: Chef) {
  const solarDistributorContract = useSolarDistributorContract()
  const contracts = useMemo(
    () => ({
      [Chef.MASTERCHEF]: solarDistributorContract,
      [Chef.MASTERCHEF_V2]: solarDistributorContract,
      [Chef.MINICHEF]: solarDistributorContract,
    }),
    [solarDistributorContract]
  )
  return useMemo(() => {
    return contracts[chef]
  }, [contracts, chef])
}

export function useUserInfo(farm, token) {
  const { account } = useActiveWeb3React()

  const contract = useChefContract(0)

  const args = useMemo(() => {
    if (!account) {
      return
    }
    return [String(farm.id), String(account)]
  }, [farm, account])

  const result = useSingleCallResult(args ? contract : null, 'userInfo', args)?.result

  const value = result?.[0]
  const harvestValue = result?.[3]

  const amount = value ? JSBI.BigInt(value.toString()) : undefined
  const nextHarvestUntil = harvestValue ? JSBI.BigInt(harvestValue.toString()) : undefined

  return {
    amount: amount ? CurrencyAmount.fromRawAmount(token, amount) : undefined,
    nextHarvestUntil: nextHarvestUntil ? JSBI.toNumber(nextHarvestUntil) * 1000 : undefined,
  }
}

export function usePendingSolar(farm) {
  const { account, chainId } = useActiveWeb3React()

  const contract = useChefContract(0)

  const args = useMemo(() => {
    if (!account) {
      return
    }
    return [String(farm.id), String(account)]
  }, [farm, account])

  const result = useSingleCallResult(args ? contract : null, 'pendingSolar', args)?.result

  const value = result?.[0]

  const amount = value ? JSBI.BigInt(value.toString()) : undefined

  return amount ? CurrencyAmount.fromRawAmount(SOLAR[chainId], amount) : undefined
}

export function usePendingToken(farm, contract) {
  const { account } = useActiveWeb3React()

  const args = useMemo(() => {
    if (!account || !farm) {
      return
    }
    return [String(farm.pid), String(account)]
  }, [farm, account])

  const pendingTokens = useSingleContractMultipleData(
    args ? contract : null,
    'pendingTokens',
    args.map((arg) => [...arg, '0'])
  )

  return useMemo(() => pendingTokens, [pendingTokens])
}

export function useSolarPositions(contract?: Contract | null) {
  const { account, chainId } = useActiveWeb3React()

  const numberOfPools = useSingleCallResult(contract ? contract : null, 'poolLength', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const args = useMemo(() => {
    if (!account || !numberOfPools) {
      return
    }
    return [...Array(numberOfPools.toNumber()).keys()].map((pid) => [String(pid), String(account)])
  }, [numberOfPools, account])

  const pendingSolar = useSingleContractMultipleData(args ? contract : null, 'pendingSolar', args)

  const userInfo = useSingleContractMultipleData(args ? contract : null, 'userInfo', args)

  return useMemo(() => {
    if (!pendingSolar || !userInfo) {
      return []
    }
    return zip(pendingSolar, userInfo)
      .map((data, i) => ({
        id: args[i][0],
        pendingRewards: [
          {
            token: SOLAR_ADDRESS[chainId],
            symbol: 'SOLAR',
            amount: data[0].result?.[0] || Zero,
            decimals: 18,
          },
        ],
        amount: data?.[1].result?.amount || Zero,
        nextHarvestUntil: data?.[1].result?.nextHarvestUntil || Zero,
      }))
      .filter(({ pendingRewards, amount }) => {
        return (
          (pendingRewards && !pendingRewards?.find((item) => !item.amount.isZero())) || (amount && !amount.isZero())
        )
      })
  }, [args, chainId, pendingSolar, userInfo])
}

export function usePositions() {
  return useSolarPositions(useSolarDistributorContract())
}

export function useSolarPositionsV2(contract?: Contract | null) {
  const { account } = useActiveWeb3React()

  const numberOfPools = useSingleCallResult(contract ? contract : null, 'poolLength', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const args = useMemo(() => {
    if (!account || !numberOfPools) {
      return
    }
    return [...Array(numberOfPools.toNumber()).keys()].map((pid) => [String(pid), String(account)])
  }, [numberOfPools, account])

  const pendingTokens = useSingleContractMultipleData(args ? contract : null, 'pendingTokens', args)

  const userInfo = useSingleContractMultipleData(args ? contract : null, 'userInfo', args)

  return useMemo(() => {
    if (!pendingTokens || !userInfo) {
      return []
    }
    return zip(pendingTokens, userInfo)
      .map((data, i) => ({
        id: args[i][0],
        pendingRewards: data?.[0].result?.addresses?.map((item, j) => {
          let symbol = data?.[0].result?.symbols?.[j]
          let amount = data?.[0].result?.amounts?.[j]
          const decimals = data?.[0].result?.decimals?.[j]

          if (symbol == 'MOCK') {
            symbol = 'SOLAR'
          }
          if (symbol == 'WMOVR') {
            symbol = 'MOVR'
          }

          return {
            token: item,
            symbol,
            amount,
            decimals,
          }
        }),
        amount: data?.[1].result?.amount || Zero,
        nextHarvestUntil: data?.[1].result?.nextHarvestUntil || Zero,
      }))
      .filter(({ pendingRewards, amount }) => {
        return (
          (pendingRewards && !pendingRewards?.find((item) => !item.amount.isZero())) || (amount && !amount.isZero())
        )
      })
  }, [args, pendingTokens, userInfo])
}

export function usePositionsV2() {
  return useSolarPositionsV2(useSolarDistributorV2Contract())
}

export function useSolarFarms(contract?: Contract | null) {
  const { account, chainId } = useActiveWeb3React()
  const priceData = useContext(PriceContext)

  const blocksPerDay = 86400 / Number(AVERAGE_BLOCK_TIME[chainId])

  const solarPerBlock = useSingleCallResult(contract ? contract : null, 'solarPerBlock', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const totalAllocPoint = useSingleCallResult(contract ? contract : null, 'totalAllocPoint', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const numberOfPools = useSingleCallResult(contract ? contract : null, 'poolLength', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const args = useMemo(() => {
    if (!numberOfPools) {
      return
    }
    return [...Array(numberOfPools.toNumber()).keys()].map((pid) => [String(pid)])
  }, [numberOfPools])

  const poolInfo = useSingleContractMultipleData(args ? contract : null, 'poolInfo', args)

  return useMemo(() => {
    if (!poolInfo) {
      return []
    }
    return zip(poolInfo).map((data, i) => {
      const pool = data[0].result
      return {
        id: args[i][0],
        lpToken: pool?.lpToken,
        allocPoint: pool?.allocPoint,
        lastRewardBlock: pool?.lastRewardBlock,
        accSolarPerShare: pool?.accSolarPerShare,
        depositFeeBP: pool?.depositFeeBP,
        harvestInterval: pool?.harvestInterval,
        totalLp: pool?.totalLp,
        rewards: [
          {
            token: 'SOLAR',
            icon: '/images/tokens/solar.png',
            rewardPerDay: (((pool?.allocPoint / totalAllocPoint) * solarPerBlock) / 1e18) * blocksPerDay,
            rewardPrice: priceData?.solar,
          },
        ],
      }
    })
  }, [args, blocksPerDay, poolInfo, priceData?.solar, solarPerBlock, totalAllocPoint])
}

export function useSolarFarmsV2(contract?: Contract | null) {
  const priceData = useContext(PriceContext)

  const numberOfPools = useSingleCallResult(contract ? contract : null, 'poolLength', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const args = useMemo(() => {
    if (!numberOfPools) {
      return
    }
    return [...Array(numberOfPools.toNumber()).keys()].map((pid) => [String(pid)])
  }, [numberOfPools])

  const poolInfo = useSingleContractMultipleData(args ? contract : null, 'poolInfo', args)

  const poolRewardsPerSec = useSingleContractMultipleData(args ? contract : null, 'poolRewardsPerSec', args)

  const secondsPerDay = 60 * 60 * 24
  const teamInvestorTreasuryPercent = 30 //30%

  return useMemo(() => {
    if (!poolInfo) {
      return []
    }
    return zip(poolInfo).map((data, i) => {
      const pool = data[0].result
      return {
        id: args[i][0],
        lpToken: pool?.lpToken,
        allocPoint: pool?.allocPoint,
        lastRewardTimestamp: pool?.lastRewardTimestamp,
        accSolarPerShare: pool?.accSolarPerShare,
        depositFeeBP: pool?.depositFeeBP,
        harvestInterval: pool?.harvestInterval,
        totalLp: pool?.totalLp,
        rewards: poolRewardsPerSec?.[i].result?.[0].map((item, j) => {
          const decimals = poolRewardsPerSec?.[i].result?.decimals?.[j]
          const rewardsPerSec = poolRewardsPerSec?.[i].result?.rewardsPerSec?.[j]
          let symbol = poolRewardsPerSec?.[i].result?.symbols?.[j]
          if (symbol == 'WMOVR') {
            symbol = 'MOVR'
          }
          const rewardPrice = priceData?.[symbol?.toLowerCase()] || 0
          return {
            token: symbol,
            icon: `/images/tokens/${symbol?.toLowerCase()}.png`,
            rewardPerDay:
              (rewardsPerSec / 10 ** decimals?.toString()) *
              secondsPerDay *
              ((100 - teamInvestorTreasuryPercent) / 100),
            rewardPrice,
          }
        }),
      }
    })
  }, [args, poolInfo, poolRewardsPerSec, priceData, secondsPerDay])
}

export function usePrice(pairContract?: Contract | null, pairDecimals?: number | null, invert: boolean = false) {
  const { account, chainId } = useActiveWeb3React()

  const result = useSingleCallResult(pairContract ? pairContract : null, 'getReserves', undefined, NEVER_RELOAD)?.result

  const _reserve1 = invert ? result?.['reserve0'] : result?.['reserve1']
  const _reserve0 = invert ? result?.['reserve1'] : result?.['reserve0']

  const price = _reserve1 ? (Number(_reserve1) / Number(_reserve0)) * (pairDecimals ? 10 ** pairDecimals : 1) : 0

  return price
}

export function useTokenInfo(tokenContract?: Contract | null) {
  const { account, chainId } = useActiveWeb3React()
  const vaults = useVaults()

  const _totalSupply = useSingleCallResult(tokenContract ? tokenContract : null, 'totalSupply', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const _burnt = useSingleCallResult(
    tokenContract ? tokenContract : null,
    'balanceOf',
    ['0x000000000000000000000000000000000000dEaD'],
    NEVER_RELOAD
  )?.result?.[0]

  let lockedInVaults = JSBI.BigInt(0)

  vaults
    .filter((r) => r.lockupDuration > 0)
    .forEach((r) => {
      lockedInVaults = JSBI.add(lockedInVaults, JSBI.BigInt(r.totalLp.toString()))
    })

  const totalSupply = _totalSupply ? JSBI.BigInt(_totalSupply.toString()) : JSBI.BigInt(0)
  const burnt = _burnt ? JSBI.BigInt(_burnt.toString()) : JSBI.BigInt(0)

  const circulatingSupply = JSBI.subtract(JSBI.subtract(totalSupply, burnt), lockedInVaults)

  const token = useToken(tokenContract.address)

  return useMemo(() => {
    if (!token) {
      return {
        totalSupply: '0',
        burnt: '0',
        circulatingSupply: '0',
        lockedInVaults: '0',
      }
    }

    return {
      totalSupply: CurrencyAmount.fromRawAmount(token, totalSupply).toFixed(0),
      burnt: CurrencyAmount.fromRawAmount(token, burnt).toFixed(0),
      vaults: CurrencyAmount.fromRawAmount(token, lockedInVaults).toFixed(0),
      circulatingSupply: CurrencyAmount.fromRawAmount(token, circulatingSupply).toFixed(0),
    }
  }, [totalSupply, burnt, circulatingSupply, token, lockedInVaults])
}

export function useFarms() {
  return useSolarFarms(useSolarDistributorContract())
}

export function useFarmsV2() {
  return useSolarFarmsV2(useSolarDistributorV2Contract())
}

export function usePricesApi() {
  const movrPrice = useMovrPrice()
  const solarPrice = useSolarPrice()
  const ribPrice = useRibPrice()

  return useMemo(() => {
    return {
      movr: movrPrice,
      wmovr: movrPrice,
      solar: solarPrice * movrPrice,
      rib: ribPrice * movrPrice,
      mock: 1,
      usdc: 1,
    }
  }, [movrPrice, ribPrice, solarPrice])
}

export function useMovrPrice() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return usePrice(useMovrUsdcContract(), 12)
}

export function useSolarPrice() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return usePrice(useSolarMovrContract())
}

export function useRibPrice() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return usePrice(useRibMovrContract(), 0, true)
}

export function usePairPrices(poolVersion: AddressMap): PairPrices[] {
  const { chainId } = useActiveWeb3React()
  const priceData = useContext(PriceContext)

  const solarPrice = priceData?.solar
  const movrPrice = priceData?.movr
  const ribPrice = priceData?.rib

  const farmingPools = Object.keys(poolVersion[ChainId.MOONRIVER]).map((key) => {
    return { ...poolVersion[ChainId.MOONRIVER][key], lpToken: key }
  })

  const singlePools = farmingPools.filter((r) => !r.token1)
  const lpPools = farmingPools.filter((r) => !!r.token1)
  const pairAddresses = lpPools.map((r) => r.lpToken)

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')
  const totalSupply = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'totalSupply')

  return useMemo(() => {
    function isKnownToken(token: TokenInfo) {
      return (
        token.id.toLowerCase() == SOLAR_ADDRESS[chainId].toLowerCase() ||
        token.symbol == 'WMOVR' ||
        token.symbol == 'MOVR' ||
        token.symbol == 'RIB' ||
        token.symbol == 'USDC' ||
        token.symbol == 'BUSD'
      )
    }

    function getPrice(token: TokenInfo) {
      if (token.id.toLowerCase() == SOLAR_ADDRESS[chainId].toLowerCase()) {
        return solarPrice
      }
      if (token.symbol == 'WMOVR' || token.symbol == 'MOVR') {
        return movrPrice
      }
      if (token.symbol == 'RIB' || token.symbol == 'RIB') {
        return ribPrice
      }
      if (token.symbol == 'USDC' || token.symbol == 'BUSD') {
        return 1
      }
      return 0
    }

    const lpTVL = results.map((result, i) => {
      const { result: reserves, loading } = result

      let { token0, token1, lpToken } = lpPools[i]

      token0 = token0.id.toLowerCase() < token1.id.toLowerCase() ? token0 : token1
      token1 = token0.id.toLowerCase() < token1.id.toLowerCase() ? token1 : token0

      if (loading) return { token: lpToken, price: 0 }
      if (!reserves) return { token: lpToken, price: 0 }

      const { reserve0, reserve1 } = reserves

      const lpTotalSupply = totalSupply[i]?.result?.[0]

      const token0price = getPrice(token0)
      const token1price = getPrice(token1)

      const token0total = Number(Number(token0price * (Number(reserve0) / 10 ** token0?.decimals)).toString())
      const token1total = Number(Number(token1price * (Number(reserve1) / 10 ** token1?.decimals)).toString())

      let lpTotalPrice = Number(token0total + token1total)

      if (isKnownToken(token0)) {
        lpTotalPrice = token0total * 2
      } else if (isKnownToken(token1)) {
        lpTotalPrice = token1total * 2
      }
      let price = lpTotalPrice / (lpTotalSupply / 10 ** 18)

      if (isNaN(price)) {
        price = 0
      }

      return {
        token: lpToken,
        price,
      }
    })

    const singleTVL = singlePools.map((result, i) => {
      const { token0, lpToken } = singlePools[i]

      if (!result) return { token: lpToken, price: 0 }

      const token0price = getPrice(token0)
      const price = token0price

      return {
        token: lpToken,
        price,
      }
    })

    return concat(singleTVL, lpTVL)
  }, [results, chainId, solarPrice, movrPrice, ribPrice, totalSupply, lpPools, singlePools])
}
