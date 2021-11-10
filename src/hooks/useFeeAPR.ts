import { useCallback, useEffect, useState } from 'react'
import { blocklyticsGraph, pairsGraph } from './apollo/client'
import { useActiveWeb3React } from './index'
import { AddressMap } from '../constants/farms'
import { ChainId } from '../sdk'
import { pairsQuery2, pairsTimeTravelQuery } from '../services/graph/queries'
import { getOneDayBlock } from '../services/graph'

const useFeeAPR = (poolVersion: AddressMap) => {
  const { chainId } = useActiveWeb3React()
  const pairsClient = pairsGraph(chainId)
  const blocklyticsClient = blocklyticsGraph(chainId)
  const farmingPools = Object.keys(poolVersion[ChainId.MOONRIVER]).map((key) => {
    return key.toLowerCase()
  })

  const [feeAPRData, setFeeAPRData] = useState([])

  const getPairs = async () => {
    try {
      const {
        data: { pairs },
      } = await pairsClient.query({
        query: pairsQuery2,
        variables: {
          ids: farmingPools,
        },
      })

      const oneDayBlock = await getOneDayBlock(blocklyticsClient)

      const {
        data: { pairs: oneDayPairs },
      } = await pairsClient.query({
        query: pairsTimeTravelQuery,
        variables: {
          block: oneDayBlock,
          pairAddresses: farmingPools,
        },
        fetchPolicy: 'no-cache',
      })

      await pairsClient.cache.writeQuery({
        query: pairsQuery2,
        variables: {
          ids: farmingPools,
        },
        data: {
          pairs: pairs.map((pair) => {
            const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id)
            return {
              ...pair,
              oneDay: {
                untrackedVolumeUSD: String(oneDayPair?.untrackedVolumeUSD),
                volumeUSD: String(oneDayPair?.volumeUSD),
                reserveUSD: String(oneDayPair?.reserveUSD),
                txCount: String(oneDayPair?.txCount),
              },
            }
          }),
        },
      })

      return await pairsClient.cache.readQuery({
        query: pairsQuery2,
        variables: {
          ids: farmingPools,
        },
      })
    } catch (e) {
      console.error('[useFeeAPR] erorr: ' + e)
      setFeeAPRData([])
    }
  }

  const fetchFeeAPR = useCallback(async () => {
    let results = await getPairs()
    // @ts-ignore
    let parsedData = results.pairs?.map((pair) => {
      const volumeUSD = pair?.volumeUSD === '0' ? pair?.untrackedVolumeUSD : pair?.volumeUSD

      const oneDayVolumeUSD =
        pair?.oneDay?.volumeUSD === '0' ? pair?.oneDay?.untrackedVolumeUSD : pair?.oneDay?.volumeUSD
      const oneDayVolume = volumeUSD - oneDayVolumeUSD
      const oneYearFees = (oneDayVolume * 0.002 * 365 * 100) / pair.reserveUSD

      return {
        id: pair.id,
        apr: oneYearFees,
      }
    })
    setFeeAPRData(parsedData)
  }, [])

  useEffect(() => {
    fetchFeeAPR()
  }, [fetchFeeAPR])

  return feeAPRData
}

export default useFeeAPR
