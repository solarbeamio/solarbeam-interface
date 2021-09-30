import { useCallback, useEffect, useState } from 'react'
import { dexCandlesGraph } from './apollo/client'
import { dexCandlesQuery } from './apollo/queries'
import { useActiveWeb3React } from './index'
import { CandlePeriod, NumericalCandlestickDatum, RawCandlestickDatum } from '../types/Candle'

const useDexCandles = (token0LCase: string, token1LCase: string, period: CandlePeriod) => {
  const { chainId } = useActiveWeb3React()
  const dexCandles = dexCandlesGraph(chainId)

  // We sort the tokens because subgraph query must take a pair of tokens in sorted order.
  const sortedToken0 = token0LCase < token1LCase ? token0LCase : token1LCase
  const sortedToken1 = token0LCase < token1LCase ? token1LCase : token0LCase

  let resultArray: RawCandlestickDatum[] = []

  const [candleData, setCandleData] = useState([])

  const fetchDexCandles = useCallback(async () => {
    if (token0LCase == '' || token1LCase == '') {
      return
    }
    try {
      let skip = 0
      let results = await dexCandles.query({
        query: dexCandlesQuery,
        variables: { token0: sortedToken0, token1: sortedToken1, period, skip },
      })

      while (results.data.candles.length === 1000) {
        skip += 1000
        resultArray = resultArray.concat(results.data.candles)
        results = await dexCandles.query({
          query: dexCandlesQuery,
          variables: { token0: sortedToken0, token1: sortedToken1, period, skip },
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      resultArray = resultArray.concat(results.data.candles)
      let parsedData = resultArray.map(({ time, open, high, low, close }: RawCandlestickDatum) => {
        return {
          time: Number(time),
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
        }
      })
      // Query takes the tokens in sorted lexicographical order.
      // But if sortedToken0 is actually the output currency and vice versa,
      // then we must invert the prices
      if (sortedToken0 === token0LCase && sortedToken1 === token1LCase) {
        parsedData = parsedData.map(({ time, open, high, low, close }: NumericalCandlestickDatum) => {
          return {
            time: time,
            open: 1 / open,
            high: 1 / high,
            low: 1 / low,
            close: 1 / close,
          }
        })
      }
      // There is a race condition when you set input and output currencies, goto a different page and come back to
      // swap page again. We force a small pause to ensure the correct input and ouput currencies are showing on the
      // chart
      setTimeout(() => {}, 1000)
      // @ts-ignore
      setCandleData(parsedData)
    } catch (e) {
      console.error('[useDexCandles] erorr: ' + e)
      setCandleData([])
    }
  }, [sortedToken0, sortedToken1, period, token0LCase, token1LCase])

  useEffect(() => {
    fetchDexCandles()
  }, [fetchDexCandles, token0LCase, token1LCase, period])

  return candleData
}

export default useDexCandles
