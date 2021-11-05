import { ChainId, CurrencyAmount, JSBI, MASTERCHEF_ADDRESS } from '../../sdk'
import { Chef } from './enum'
import {
  SOLAR,
  MASTERCHEF_V2_ADDRESS,
  MINICHEF_ADDRESS,
  SOLAR_ADDRESS,
  SOLAR_DISTRIBUTOR_ADDRESS,
  AVERAGE_BLOCK_TIME,
} from '../../constants'
import {
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../../state/multicall/hooks'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  useSolarDistributorContract,
  useBNBPairContract,
  useSolarMovrContract,
  useSolarVaultContract,
  useMovrUsdcContract,
  useRibMovrContract,
} from '../../hooks'

import IUniswapV2PairABI from '@sushiswap/core/abi/IUniswapV2Pair.json'
import { Contract } from '@ethersproject/contracts'
import { Zero } from '@ethersproject/constants'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import zip from 'lodash/zip'
import { useToken } from '../../hooks/Tokens'
import { useVaultInfo, useVaults } from '../vault/hooks'
import { POOLS, TokenInfo } from '../../constants/farms'
import { PriceContext } from '../../contexts/priceContext'
import { concat } from 'lodash'
const { default: axios } = require('axios')

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

export function useChefContracts(chefs: Chef[]) {
  const solarDistributorContract = useSolarDistributorContract()
  const contracts = useMemo(
    () => ({
      [Chef.MASTERCHEF]: solarDistributorContract,
      [Chef.MASTERCHEF_V2]: solarDistributorContract,
      [Chef.MINICHEF]: solarDistributorContract,
    }),
    [solarDistributorContract]
  )
  return chefs.map((chef) => contracts[chef])
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
  const { account } = useActiveWeb3React()

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
        pendingSolar: data[0].result?.[0] || Zero,
        amount: data[1].result?.[0] || Zero,
      }))
      .filter(({ pendingSolar, amount }) => {
        return (pendingSolar && !pendingSolar.isZero()) || (amount && !amount.isZero())
      })
  }, [args, pendingSolar, userInfo])
}

export function usePositions() {
  return useSolarPositions(useSolarDistributorContract())
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
            icon: '/images/token/solar.png',
            rewardPerDay: (((pool?.allocPoint / totalAllocPoint) * solarPerBlock) / 1e18) * blocksPerDay,
            rewardPrice: priceData?.solar,
          },
        ],
      }
    })
  }, [args, blocksPerDay, poolInfo, priceData?.solar, solarPerBlock, totalAllocPoint])
}

const useAsync = (asyncFunction, immediate = true) => {
  const [value, setValue] = useState(null)

  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    return asyncFunction().then((response) => {
      let [prices] = response
      setValue({ data: { ...prices?.data } })
    })
  }, [asyncFunction])
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    const intervalId = setInterval(() => {
      execute()
    }, 60000)

    if (immediate) {
      execute()
    }

    return () => {
      clearInterval(intervalId) //This is important
    }
  }, [execute, immediate])

  return useMemo(() => {
    return value
  }, [value])
}

export function usePriceApi() {
  return Promise.all([axios.get('/api/prices')])
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

export function usePricesApi() {
  const movrPrice = useMovrPrice()
  const solarPrice = useSolarPrice()
  const ribPrice = useRibPrice()

  return useMemo(() => {
    return {
      movr: movrPrice,
      solar: solarPrice * movrPrice,
      rib: ribPrice * movrPrice,
      usdc: 1,
    }
  }, [movrPrice, ribPrice, solarPrice])
}

export function useFarmsApi() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAsync(usePriceApi, true)
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

export function useBNBPrice() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return usePrice(useBNBPairContract())
}

export function useSolarDistributorInfo(contract) {
  const solarPerBlock = useSingleCallResult(contract ? contract : null, 'solarPerBlock', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const totalAllocPoint = useSingleCallResult(contract ? contract : null, 'totalAllocPoint', undefined, NEVER_RELOAD)
    ?.result?.[0]

  return useMemo(() => ({ solarPerBlock, totalAllocPoint }), [solarPerBlock, totalAllocPoint])
}

export function useDistributorInfo() {
  return useSolarDistributorInfo(useSolarDistributorContract())
}

export function usePairPrices(): PairPrices[] {
  const { chainId } = useActiveWeb3React()
  const priceData = useContext(PriceContext)

  const solarPrice = priceData?.solar
  const movrPrice = priceData?.movr
  const ribPrice = priceData?.rib

  const farmingPools = Object.keys(POOLS[ChainId.MOONRIVER]).map((key) => {
    return { ...POOLS[ChainId.MOONRIVER][key], lpToken: key }
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
