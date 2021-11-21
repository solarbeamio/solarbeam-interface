import { WNATIVE } from '@sushiswap/sdk'
import useSWR from 'swr'
import { TokensMap, ResultPairInfo } from '../interface'
import SupportedTokenList from '../../../constants/bridge/tokenlist.json'

export const useAnyswapTokens = () => {
  const AnyswapTokens = SupportedTokenList?.tokens
    ?.filter((r) => r.provider == 'Anyswap')
    .map((r) => r.address.toLowerCase())

  return useSWR('https://bridgeapi.anyswap.exchange/v2/serverInfo/1285', (url) =>
    fetch(url)
      .then((result) => result.json())
      .then((data) => {
        let result: TokensMap = {}

        const poweredBy = 'Anyswap'

        Object.keys(data || {}).map((key) => {
          const info: ResultPairInfo = data[key]

          info.srcChainID = parseInt(info.srcChainID.toString())
          info.destChainID = parseInt(info.destChainID.toString())
          let sourceContractAddress = info.SrcToken.ContractAddress
          if (!sourceContractAddress) {
            sourceContractAddress = WNATIVE[info.srcChainID].address
          }

          sourceContractAddress = sourceContractAddress.toLowerCase()

          let destContractAddress = info.DestToken.ContractAddress
          if (!destContractAddress) {
            destContractAddress = WNATIVE[info.destChainID].address
          }

          destContractAddress = destContractAddress.toLowerCase()

          if (
            AnyswapTokens.find((r) => r == destContractAddress) ||
            AnyswapTokens.find((r) => r == sourceContractAddress)
          ) {
            let existingSource = result[info.srcChainID]
            if (!existingSource) {
              result[info.srcChainID] = {
                [sourceContractAddress]: {
                  destChainID: info.destChainID,
                  id: info.PairID,
                  logoUrl: info.logoUrl,
                  name: info.name,
                  symbol: info.symbol,
                  token: info.DestToken,
                  other: info.SrcToken,
                  poweredBy,
                },
              }
            } else {
              result[info.srcChainID][sourceContractAddress] = {
                destChainID: info.destChainID,
                id: info.PairID,
                logoUrl: info.logoUrl,
                name: info.name,
                symbol: info.symbol,
                token: info.DestToken,
                other: info.SrcToken,
                poweredBy,
              }
            }

            let existingDestination = result[info.destChainID]
            if (!existingDestination) {
              result[info.destChainID] = {
                [destContractAddress]: {
                  destChainID: info.srcChainID,
                  id: info.PairID,
                  logoUrl: info.logoUrl,
                  name: info.name,
                  symbol: info.symbol,
                  token: info.SrcToken,
                  other: info.DestToken,
                  poweredBy,
                },
              }
            } else {
              result[info.destChainID][destContractAddress] = {
                destChainID: info.srcChainID,
                id: info.PairID,
                logoUrl: info.logoUrl,
                name: info.name,
                symbol: info.symbol,
                token: info.SrcToken,
                other: info.DestToken,
                poweredBy,
              }
            }
          }
        })

        return result
      })
  )
}
