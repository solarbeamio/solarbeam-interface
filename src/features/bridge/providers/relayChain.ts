import { useMemo } from 'react'
import useSWR from 'swr'
import { TokensMap } from '../interface'
import SupportedTokenList from '../../../constants/bridge/tokenlist.json'

export const RelayChainMap = {
  1: 1,
  2: 43114,
  3: 56,
  4: 128,
  5: 137,
  6: 1285,
  7: 250,
  10: 1666600000,
}

export const useRelayTokens = () => {
  const RelayTokens = SupportedTokenList?.tokens
    ?.filter((r) => r.provider == 'RelayChain')
    .map((r) => r.address.toLowerCase())

  return useSWR('https://relay-api-33e56.ondigitalocean.app/api/crosschain-config', (url) =>
    fetch(url)
      .then((result) => result.json())
      .then((data) => {
        let result: TokensMap = {}

        const poweredBy = 'RelayChain'

        for (const chainInfo of data) {
          const bridgeAddress = chainInfo.bridgeAddress
          const relayChainId = chainInfo.chainId
          const chainId = RelayChainMap[relayChainId]

          if (chainId) {
            for (const token of chainInfo?.tokens) {
              let sourceContractAddress = token?.address.toLowerCase()

              if (RelayTokens.find((r) => r == sourceContractAddress)) {
                for (const relayDestChain of token.allowedChainsToTransfer) {
                  const destChainId = RelayChainMap[relayDestChain]

                  if (destChainId) {
                    let existingSource = result[chainId]
                    if (!existingSource) {
                      result[chainId] = {
                        [sourceContractAddress]: {
                          destChainID: destChainId,
                          bridgeAddress: bridgeAddress,
                          id: token?.resourceId,
                          logoUrl: token?.symbol,
                          name: token?.assetBase,
                          symbol: token?.assetBase,
                          bridgeTokenAddress: chainInfo?.erc20HandlerAddress,
                          token: {
                            ContractAddress: token.address,
                            Decimals: token.decimals,
                            Symbol: token.symbol,
                          },
                          other: {
                            ContractAddress: token.address,
                            Decimals: token.decimals,
                            MinimumSwap: 0,
                            MaximumSwap: 10 ** 6,
                            ResourceId: token.resourceId,
                          },
                          poweredBy,
                        },
                      }
                    } else {
                      result[chainId][sourceContractAddress] = {
                        destChainID: destChainId,
                        bridgeAddress: bridgeAddress,
                        id: token?.resourceId,
                        logoUrl: token?.symbol,
                        name: token?.assetBase,
                        symbol: token?.assetBase,
                        bridgeTokenAddress: chainInfo?.erc20HandlerAddress,
                        token: {
                          ContractAddress: token.address,
                          Decimals: token.decimals,
                          Symbol: token.symbol,
                        },
                        other: {
                          ContractAddress: token.address,
                          Decimals: token.decimals,
                          MinimumSwap: 0,
                          MaximumSwap: 10 ** 6,
                          ResourceId: token.resourceId,
                        },
                        poweredBy,
                      }
                    }

                    let existingDestination = result[destChainId]
                    if (!existingDestination) {
                      result[destChainId] = {
                        [sourceContractAddress]: {
                          destChainID: chainId,
                          bridgeAddress: bridgeAddress,
                          id: token?.resourceId,
                          logoUrl: token?.symbol,
                          name: token?.assetBase,
                          symbol: token?.assetBase,
                          token: {
                            ContractAddress: token.address,
                            Decimals: token.decimals,
                            Symbol: token.symbol,
                          },
                          other: {
                            ContractAddress: token.address,
                            Decimals: token.decimals,
                            MinimumSwap: 0,
                            MaximumSwap: 10 ** 6,
                            ResourceId: token.resourceId,
                          },
                          poweredBy,
                        },
                      }
                    } else {
                      result[destChainId][sourceContractAddress] = {
                        destChainID: chainId,
                        bridgeAddress: bridgeAddress,
                        id: token?.resourceId,
                        logoUrl: token?.symbol,
                        name: token?.assetBase,
                        symbol: token?.assetBase,
                        token: {
                          ContractAddress: token.address,
                          Decimals: token.decimals,
                          Symbol: token.symbol,
                        },
                        other: {
                          ContractAddress: token.address,
                          Decimals: token.decimals,
                          MinimumSwap: 0,
                          MaximumSwap: 10 ** 6,
                          ResourceId: token.resourceId,
                        },
                        poweredBy,
                      }
                    }
                  }
                }
              }
            }
          }
        }

        return result
      })
  )
}
