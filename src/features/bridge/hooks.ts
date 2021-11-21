import { getAddress } from '@ethersproject/address'
import { useMemo } from 'react'
import { Binance, ChainId, Currency, Ether, Moonriver, Token, WNATIVE } from '../../sdk'
import { AvailableChainsInfo, TokensMap } from './interface'
import { useAnyswapTokens } from './providers/anyswap'
import { useRelayTokens } from './providers/relayChain'

export const useTokenList = (chainFrom?: number, chainTo?: number) => {
  const { data: anyswapInfo } = useAnyswapTokens()
  const { data: relayInfo } = useRelayTokens()

  return useMemo(() => {
    const result: TokensMap = {}

    if (!chainFrom || !chainTo) {
      return [result, []]
    }

    const mergeTokenMap = (
      list: {
        [x: string]: { [contract: string]: AvailableChainsInfo }
        [x: number]: { [contract: string]: AvailableChainsInfo }
      },
      key: string
    ) => {
      const existing = result[key]
      if (existing) {
        result[key] = {
          ...existing,
          ...list[key],
        }
      } else {
        result[key] = list[key]
      }
    }
    Object.keys(anyswapInfo || {}).map((key) => {
      mergeTokenMap(anyswapInfo, key)
    })

    Object.keys(relayInfo || {}).map((key) => {
      mergeTokenMap(relayInfo, key)
    })

    const tokens: Currency[] = Object.keys((result && result[chainFrom]) || {})
      .filter((chainId) => result[chainFrom][chainId].destChainID == chainTo)
      .map((chainId) => {
        const info: AvailableChainsInfo = result[chainFrom][chainId]
        if (info.poweredBy == 'Anyswap') {
          if (chainId.toLowerCase() == WNATIVE[chainFrom].address.toLowerCase()) {
            if (chainFrom == ChainId.MOONRIVER) {
              return Moonriver.onChain(chainFrom)
            }
            if (chainFrom == ChainId.BSC) {
              return Binance.onChain(chainFrom)
            }
            if (chainFrom == ChainId.MAINNET) {
              return Ether.onChain(chainFrom)
            }
          }
        }
        return new Token(chainFrom, getAddress(chainId), info.token.Decimals, info.token.Symbol, info.name)
      })

    return [result, tokens]
  }, [anyswapInfo, chainFrom, chainTo, relayInfo])
}
