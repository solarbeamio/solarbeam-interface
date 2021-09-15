/* eslint-disable @next/next/link-passhref */
import { useActiveWeb3React, useFuse } from '../../hooks'
import Head from 'next/head'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Card from '../../components/Card'
import { useLingui } from '@lingui/react'
import DoubleGlowShadow from '../../components/DoubleGlowShadow'
import SolarbeamLogo from '../../components/SolarbeamLogo'
import Container from '../../components/Container'
import { priceData } from './priceData'
import { areaData } from './areaData'
import { volumeData } from './volumeData'
import Dashboard from '../index'
// import { createChart, isBusinessDay  } from 'lightweight-charts'

export default function Analytics(): JSX.Element {
  const { createChart, isBusinessDay, CrosshairMode, ColorType } = require('lightweight-charts')
  const { i18n } = useLingui()
  const router = useRouter()
  const { chainId } = useActiveWeb3React()

  const chartContainerRef = useRef()
  const chart = useRef()
  const resizeObserver = useRef()

  useEffect(() => {
    chart.current = createChart(chartContainerRef.current, {
      width: 500,
      height: 300,
      layout: {
        // backgroundColor: `radial-gradient(100% 100% at 100% 100%, #474125 50%, #fff 50%)`,
        backgroundColor: '#000',
        textColor: 'rgba(255, 255, 255, 1)',
        color: '#000'
        // background: {
        //   type: ColorType.VerticalGradient,
        //   topColor: '#FFFFFF',
        //   bottomColor: '#AAFFAA',
        // }
      },
      grid: {
        vertLines: {
          color: 'rgb(204,210,91, 0.1)'
        },
        horzLines: {
          color: 'rgb(204,210,91, 0.1)'
        }
      },
      crosshair: {
        mode: CrosshairMode.Normal
      },
      priceScale: {
        borderColor: 'rgb(86,64,54)'
      },
      timeScale: {
        borderColor: 'rgb(86,64,54)',
        color: '#253248'
      }
    })
    // @ts-ignore
    const areaSeries = chart.current.addAreaSeries({
      topColor: 'rgba(255, 192, 0, 0.56)',
      bottomColor: 'rgba(255, 192, 0, 0.04)',
      lineColor: 'rgba(255, 192, 0, 1)',
      lineWidth: 2
    })
    areaSeries.setData(areaData)

    // @ts-ignore
    // const candleSeries = chart.current.addCandlestickSeries({
    //   upColor: '#4bffb5',
    //   downColor: '#ff4976',
    //   borderDownColor: '#ff4976',
    //   borderUpColor: '#4bffb5',
    //   wickDownColor: '#838ca1',
    //   wickUpColor: '#838ca1'
    // })
    // candleSeries.setData(priceData)

    // @ts-ignore
    const volumeSeries = chart.current.addHistogramSeries({
      color: 'rgba(89, 55, 9, 1)',
      lineWidth: 0.001,
      priceFormat: {
        type: 'volume'
      },
      overlay: true,
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    })
    volumeSeries.setData(volumeData)
  }, [])

  useEffect(() => {
    // @ts-ignore
    resizeObserver.current = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      // @ts-ignore
      chart.current.applyOptions({ width, height })
      setTimeout(() => {
        // @ts-ignore
        chart.current.timeScale().fitContent()
      }, 0)
    })

    // @ts-ignore
    resizeObserver.current.observe(chartContainerRef.current)

    // @ts-ignore
    return () => resizeObserver.current.disconnect()
  }, [])


  // const chart = createChart(document.getElementById("chart"), { width: 400, height: 300 });
  // chart.applyOptions({
  //   timeScale: {
  //     rightOffset: 12,
  //     barSpacing: 3,
  //     fixLeftEdge: true,
  //     lockVisibleTimeRangeOnResize: true,
  //     rightBarStaysOnScroll: true,
  //     borderVisible: false,
  //     borderColor: '#fff000',
  //     visible: true,
  //     timeVisible: true,
  //     secondsVisible: false,
  //     tickMarkFormatter: (time, tickMarkType, locale) => {
  //       console.log(time, tickMarkType, locale)
  //       const year = isBusinessDay(time) ? time.year : new Date(time * 1000).getUTCFullYear()
  //       return String(year)
  //     }
  //   }
  // })
  //
  // const lineSeries = chart.addLineSeries()
  // lineSeries.setData(priceData)
  // const candleSeries = chart.addCandlestickSeries({
  //       upColor: '#4bffb5',
  //       downColor: '#ff4976',
  //       borderDownColor: '#ff4976',
  //       borderUpColor: '#4bffb5',
  //       wickDownColor: '#838ca1',
  //       wickUpColor: '#838ca1'
  //     })

  // candleSeries.setData(priceData)
  // @ts-ignore
  // const volumeSeries = chart.addHistogramSeries({
  //   color: '#182233',
  //   lineWidth: 2,
  //   priceFormat: {
  //     type: 'volume'
  //   },
  //   overlay: true,
  //   scaleMargins: {
  //     top: 0.8,
  //     bottom: 0
  //   }
  // })

  // volumeSeries.setData(volumeData)

  return (
    <>
      <Head>
        <title>Analytics | Solarbeam</title>
        <meta key='description' name='description' content='Farm SOLAR' />
      </Head>

      <Container maxWidth='2xl' className='space-y-6'>
        <DoubleGlowShadow>
          <div className='p-4 space-y-4 rounded bg-dark-900' style={{ zIndex: 1 }}>
            <div className='p-4 mb-3 space-y-3 text-center' id='chart'>
              {/*<div ref={chartContainerRef} />*/}
              <Dashboard />
            </div>
          </div>
        </DoubleGlowShadow>
      </Container>
    </>
  )
}
