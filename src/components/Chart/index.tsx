import dynamic from 'next/dynamic'
import { ChainId, Currency, FACTORY_ADDRESS, Token, WNATIVE } from '../../sdk'
import useDexCandles from '../../hooks/useDexCandles'
import { CandlePeriod, NumericalCandlestickDatum } from '../../types/Candle'
import { MOONRIVER, WETH9, WETH9_EXTENDED } from '../../constants'
import React, { useEffect, useState } from 'react'
import { RowFixed } from '../Row'
import CurrencyLogo from '../CurrencyLogo'
import NavLink from '../NavLink'
import { classNames } from '../../functions'
import Lottie from 'lottie-react'
import solarbeamLoading from '../../animation/solarbeam-loading.json'
import { computePairAddress } from '../../functions/computePairAddress'
const KChart = dynamic(() => import('kaktana-react-lightweight-charts'), { ssr: false })

interface PeriodChooserProps {
  period: CandlePeriod | undefined
  onChoose: any
}

const PeriodChooser = ({ period, onChoose }: PeriodChooserProps) => {
  const availablePeriods = {
    [CandlePeriod.FiveMinutes]: '5m',
    [CandlePeriod.FifteenMinutes]: '15m',
    [CandlePeriod.OneHour]: '1H',
    [CandlePeriod.FourHours]: '4H',
    [CandlePeriod.OneDay]: '1D',
  }

  return (
    <div className={`flex flex-row md:space-x-1`}>
      {Object.values(availablePeriods).map((item, index) => {
        const isActive = availablePeriods[period] == item
        const classes = [
          'flex items-center justify-between px-3 py-1 text-base font-bold border hover:text-high-emphesis border-transparent rounded cursor-pointer',
        ]
        const activeClass =
          'font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900'
        if (isActive) {
          classes.push(activeClass)
        }
        return (
          <div
            key={index}
            className={classNames(...classes)}
            onClick={() => onChoose(parseInt(Object.keys(availablePeriods)[index]))}
          >
            {item}
          </div>
        )
      })}
    </div>
  )
}
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
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D'.toLowerCase(), // USDC
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

  let { isLoading, candleData } = useDexCandles(token0LCase, token1LCase, candlePeriod)

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
    let formattedCandleData: NumericalCandlestickDatum[] = fillCandlestickGaps(candleData, candlePeriod)

    if (formattedCandleData && formattedCandleData.length) {
      let differentBases = inputCurrency?.decimals != outputCurrency?.decimals
      if (differentBases) {
        let decimals = Math.abs(inputCurrency?.decimals - outputCurrency?.decimals)
        formattedCandleData = formattedCandleData.map((r) => {
          return {
            close: r.close * (10 ** decimals),
            high: r.high * (10 ** decimals),
            low: r.low * (10 ** decimals),
            open: r.open * (10 ** decimals),
            time: r.time,
          }
        })
      }
    }

    setCandlestickSeries([{ data: formattedCandleData }])
  }, [candlePeriod, candleData])

  const hasData = candlestickSeries[0].data.length > 0
  const lastClose = hasData ? candlestickSeries[0].data[candlestickSeries[0].data.length - 1].close : undefined
  // const fmtLastClose = lastClose ? formattedNum(lastClose) : 'N/A'

  const weth = WNATIVE[ChainId.MOONRIVER]
  const isWrapped = (inputCurrency?.isNative && weth.equals(outputCurrency)) || (outputCurrency?.isNative && weth.equals(inputCurrency))

  const pairAddress =
    inputCurrency &&
    outputCurrency &&
    !isWrapped &&
    computePairAddress({
      factoryAddress: FACTORY_ADDRESS[ChainId.MOONRIVER],
      tokenA: inputCurrency?.isToken ? inputCurrency : inputCurrency?.wrapped,
      tokenB: outputCurrency?.isToken ? outputCurrency : outputCurrency?.wrapped,
    })

  return (
    <>
      <a
        href={`https://analytics.solarbeam.io/pairs/${pairAddress}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center space-x-4 lg:mt-0 hover:text-gray-200 cursor-pointer rounded p-2 -ml-2 lg:w-min"
      >
        <div className="flex items-center space-x-2">
          <CurrencyLogo currency={inputCurrency} size={'30px'} className={'shadow'} />
          <div className="text-xl font-medium">{inputCurrency?.symbol}</div>
        </div>
        <div className="text-lg font-medium text-h">/</div>
        <div className="flex items-center space-x-2">
          <CurrencyLogo currency={outputCurrency} size={'30px'} className={'shadow'} />
          <div className="text-xl font-medium">{outputCurrency?.symbol}</div>
        </div>
      </a>
      <div className="flex items-center justify-between flex-col lg:flex-row space-x-4 min-h-[40px] lg:mt-4 mb-4">
        <div className="text-4xl font-black text-gray-200">{(lastClose || 0).toFixed(2)}</div>
        <PeriodChooser period={candlePeriod} onChoose={(period) => setCandlePeriod(period)} />
      </div>
      <div className={'flex flex-1 h-[300px]'}>
        {isLoading ? (
          <div className="w-24 h-[300px] pb-4 flex m-auto flex-col items-center justify-center">
            <Lottie animationData={solarbeamLoading} autoplay loop />
            <div className="text-xl font-black text-gray-200">Loading...</div>
          </div>
        ) : hasData ? (
          <KChart options={options} autoWidth height={300} candlestickSeries={candlestickSeries} />
        ) : (
          <div className="h-[300px] pb-4 flex m-auto flex-col items-center justify-center">
            <div className="text-sm font-black text-gray-200">
              {`Unfortunately, this pair doesn't have enough data.`}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
