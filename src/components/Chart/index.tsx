import dynamic from 'next/dynamic'
import { Currency, Token } from '../../sdk'
import useDexCandles from '../../hooks/useDexCandles'
import { CandlePeriod, NumericalCandlestickDatum } from '../../types/Candle'
import { MOONRIVER, WETH9, WETH9_EXTENDED } from '../../constants'
import { useEffect, useState } from 'react'
const KChart = dynamic(() => import('kaktana-react-lightweight-charts'), { ssr: false })

const fillCandlestickGaps = (candleData: NumericalCandlestickDatum[], candlePeriod: CandlePeriod) => {
  const formattedCandleData: NumericalCandlestickDatum[] = candleData.length > 0 ? [candleData[0]] : []
  if (formattedCandleData.length == 0) return formattedCandleData
  for (let i = 1; i < candleData.length; i++) {
    const cur = candleData[i]
    const prev = candleData[i - 1]
    const timeGap = cur.time - prev.time
    if (timeGap === candlePeriod) {
      formattedCandleData.push(cur)
      continue
    }
    for (let j = 1; j < timeGap / candlePeriod; j++) {
      const emptyCandle = {
        time: prev.time + j * candlePeriod,
        open: prev.close,
        high: prev.close,
        low: prev.close,
        close: prev.close,
      }
      formattedCandleData.push(emptyCandle)
    }
    formattedCandleData.push(cur)
  }

  // We fill remaining gaps until the current time
  const timestampNow = Math.floor(Number(new Date()) / 1000)
  const timestampOfNextCandle = timestampNow - (timestampNow % candlePeriod) + candlePeriod
  const prev = formattedCandleData[formattedCandleData.length - 1]
  const timeGap = timestampOfNextCandle - prev.time
  for (let j = 1; j <= timeGap / candlePeriod; j++) {
    const emptyCandle = {
      time: prev.time + j * candlePeriod,
      open: prev.close,
      high: prev.close,
      low: prev.close,
      close: prev.close,
    }
    formattedCandleData.push(emptyCandle)
  }
  return formattedCandleData
}

interface ChartProps {
  inputCurrency: Currency | Token | undefined
  outputCurrency: Currency | Token | undefined
}

export default function Chart({ inputCurrency, outputCurrency }: ChartProps) {
  const [candlePeriod, setCandlePeriod] = useState(CandlePeriod.OneHour)
  const [candlestickSeries, setCandlestickSeries] = useState<{ data: NumericalCandlestickDatum[] }[]>([{ data: [] }])

  const MAJOR_HIERARCHY = [
    '0x98878B06940aE243284CA214f92Bb71a2b032B8A'.toLowerCase(), // WMOVR
    '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C'.toLowerCase(), // WETH
    '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8'.toLowerCase(), // WBTC
    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844'.toLowerCase(), // DAI
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D'.toLowerCase(), // USDC
    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C'.toLowerCase(), // USDT
    '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818'.toLowerCase(), // BUSD
  ]

  const inputAddress = inputCurrency?.isToken
    ? inputCurrency.address
    : inputCurrency?.isNative
    ? MAJOR_HIERARCHY[0]
    : ''

  const outputAddress = outputCurrency?.isToken
    ? outputCurrency.address
    : outputCurrency?.isNative
    ? MAJOR_HIERARCHY[0]
    : ''

  const token0Index = MAJOR_HIERARCHY.indexOf(inputAddress.toLowerCase())
  const token1Index = MAJOR_HIERARCHY.indexOf(outputAddress.toLowerCase())

  const altCurrency = token0Index < token1Index ? inputCurrency : outputCurrency
  const majorCurrency = token0Index < token1Index ? outputCurrency : inputCurrency

  // A greater index denotes a greater major. -1 denotes altcoin.
  const token0LCase = token0Index < token1Index ? inputAddress.toLowerCase() : outputAddress.toLowerCase()
  const token1LCase = token0Index < token1Index ? outputAddress.toLowerCase() : inputAddress.toLowerCase()

  let candleData: NumericalCandlestickDatum[] = useDexCandles(token0LCase, token1LCase, candlePeriod)
  if (candleData && candleData.length) {
    let differentBases = inputCurrency?.decimals != outputCurrency?.decimals
    if (differentBases) {
      let decimals = (inputCurrency?.decimals + outputCurrency?.decimals) / 2
      candleData = candleData.map((r) => {
        return {
          close: r.close * 10 ** decimals,
          high: r.high * 10 ** decimals,
          low: r.low * 10 ** decimals,
          open: r.open * 10 ** decimals,
          time: r.time,
        }
      })
    }
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

  enum TickMarkType {
    Year = 0,
    Month = 1,
    DayOfMonth = 2,
    Time = 3,
    TimeWithSeconds = 4,
  }

  const options = {
    alignLabels: true,
    layout: {
      backgroundColor: `transparent`,
      lineColor: '#000000',
      textColor: `#909090`,
    },
    priceFormat: {
      type: 'custom',
      minMove: 1 / Math.pow(10, 10),
      formatter: (price: any) => {
        if (price < 0) return 0
        else if (price < 0.001) return parseFloat(price).toFixed(10)
        else if (price >= 0.001 && price < 1) return parseFloat(price).toFixed(6)
        else return parseFloat(price).toFixed(3)
      },
    },
    priceScale: {
      position: 'left',
      autoScale: true,
      borderColor: `#909090`,
    },
    crosshair: {
      vertLine: {
        width: 1.5,
        color: `#ffc000`,
        style: 2,
      },
      horzLine: {
        width: 1.5,
        color: `#ffc000`,
        style: 2,
      },
      mode: 0, // 0 = normal mode, 1 = magnet mode
    },
    grid: {
      vertLines: {
        visible: false,
      },
      horzLines: {
        visible: false,
      },
    },
    handleScale: {
      mouseWheel: true,
      pinch: true,
    },
    timeScale: {
      visible: true,
      timeVisible: true,
      borderColor: `#909090`,
      tickMarkFormatter: (time: any, tickMarkType: TickMarkType) => {
        const date = new Date(time * 1000)
        const year = date.getFullYear()
        const month = monthNames[date.getMonth()]
        const day = date.getDate()
        const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours().toString()
        const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString()
        const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds().toString()
        if (tickMarkType === TickMarkType.Year) {
          return year
        } else if (tickMarkType === TickMarkType.Month) {
          return month
        } else if (tickMarkType === TickMarkType.DayOfMonth) {
          return day
        } else if (tickMarkType === TickMarkType.Time) {
          return `${hour}:${minute}`
        } else {
          return `${hour}:${minute}:${second}`
        }
      },
    },
    localization: {
      timeFormatter: (time: any) => {
        const date = new Date(time * 1000)
        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours().toString()
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString()
        return hours + ':' + minutes
      },
      priceFormatter: (price: any) => {
        if (price < 0) return 0
        else if (price < 0.001) return parseFloat(price).toFixed(10)
        else if (price >= 0.001 && price < 0.01) return parseFloat(price).toFixed(8)
        else if (price >= 0.01 && price < 1) return parseFloat(price).toFixed(6)
        else return parseFloat(price).toFixed(3)
      },
    },
    upColor: `#7cff6b`,
    borderUpColor: `#7cff6b`,
    wickUpColor: `#7cff6b`,
    downColor: `#ff3838`,
    borderDownColor: `#ff3838`,
    wickDOwnColor: `#ff3838`,
  }

  useEffect(() => {
    const formattedCandleData: NumericalCandlestickDatum[] = fillCandlestickGaps(candleData, CandlePeriod.OneHour)
    setCandlestickSeries([{ data: formattedCandleData }])
  }, [candlePeriod, candleData])

  const hasData = candlestickSeries[0].data.length > 0
  const lastClose = hasData ? candlestickSeries[0].data[candlestickSeries[0].data.length - 1].close : undefined
  // const fmtLastClose = lastClose ? formattedNum(lastClose) : 'N/A'

  return <KChart options={options} width={500} height={400} candlestickSeries={candlestickSeries} />
}
