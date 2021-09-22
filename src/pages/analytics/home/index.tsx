/* eslint-disable @next/next/link-passhref */

import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { AutoRow } from '../../../components/Row'
import Head from 'next/head'
import Link from 'next/link'
import SolarbeamLogo from '../../../components/SolarbeamLogo'
import TopTokenList from '../../../components/TokenList'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import Card from '../../../components/Card'
import AnalyticsItem from '../../../components/AnalyticsItem'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useActiveWeb3React } from '../../../hooks'
import { useRouter } from 'next/router'
import axios from 'axios'

const apiUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL

const ListOptions = styled(AutoRow)`
  height: 400px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

export default function AnalyticsHome(): JSX.Element {
  // const { i18n } = useLingui()
  // scrolling refs
  useEffect(() => {
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  // for tracked data on pairs
  const [useTracked, setUseTracked] = useState(true)

  const [savedOpen, setSavedOpen] = useState(false)

  const { createChart, isBusinessDay, CrosshairMode, ColorType } = require('lightweight-charts')
  const { i18n } = useLingui()
  const router = useRouter()
  const { chainId } = useActiveWeb3React()

  const lineChartContainerRef = useRef()
  const lineChart = useRef()
  const lineChartResizeObserver = useRef()

  const volumesChartContainerRef = useRef()
  const volumesChart = useRef()
  const volumesChartResizeObserver = useRef()

  const ref = useRef()
  const isClient = typeof window === 'object'
  // @ts-ignore
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth)
  const [topTokens, setTopTokens] = useState()
  // @ts-ignore
  useEffect(() => {
    if (!isClient) {
      return false
    }

    function handleResize() {
      // @ts-ignore
      setWidth(ref?.current?.container?.clientWidth ?? width)
    }

    // window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient, width])
  const HEIGHT = 300

  useEffect(() => {
    lineChart.current = createChart(lineChartContainerRef.current, {
      width: width,
      height: HEIGHT,
      layout: {
        backgroundColor: '#000',
        textColor: 'rgba(255, 255, 255, 1)',
        color: '#000',
      },
      grid: {
        vertLines: {
          color: 'rgb(204,210,91, 0.1)',
          visible: false,
        },
        horzLines: {
          color: 'rgb(204,210,91, 0.1)',
          visible: false,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          visible: true,
          style: 0,
          width: 2,
          color: 'rgba(32, 38, 46, 0.1)',
          labelVisible: false,
        },
      },
      priceScale: {
        borderColor: 'rgb(86,64,54)',
      },
      timeScale: {
        borderColor: 'rgb(86,64,54)',
        color: '#253248',
        fixLeftEdge: true,
        fixRightEdge: true,
      },
    })

    // @ts-ignore
    const areaSeries = lineChart.current.addAreaSeries({
      topColor: '#741388',
      priceFormat: {
        type: 'volume',
      },
      bottomColor: '#12021b',
      lineColor: '#E32DEF',
      lineWidth: 2,
    })

    try {
      axios.get(apiUrl + '/api/analytics/liquidity').then((liquidityResponse) => {
        if (liquidityResponse.data) {
          const liquidityDataFormated = liquidityResponse.data.map((lq) => {
            return { time: lq.date, value: lq.liquidity }
          })
          areaSeries.setData(liquidityDataFormated)
          // @ts-ignore
          lineChart.current.applyOptions({
            timeScale: {
              fixLeftEdge: true,
              fixRightEdge: true,
            },
          })
        }
      })
    } catch (err) {
      console.log(err)
    }

    volumesChart.current = createChart(volumesChartContainerRef.current, {
      width: width,
      height: HEIGHT,
      layout: {
        backgroundColor: '#000',
        textColor: 'rgba(255, 255, 255, 1)',
        color: '#000',
      },
      grid: {
        vertLines: {
          color: 'rgb(204,210,91, 0.1)',
          visible: false,
        },
        horzLines: {
          color: 'rgb(204,210,91, 0.1)',
          visible: false,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          visible: true,
          style: 0,
          width: 2,
          color: 'rgba(32, 38, 46, 0.1)',
          labelVisible: false,
        },
      },
      priceScale: {
        borderColor: 'rgb(86,64,54)',
      },
      timeScale: {
        borderColor: 'rgb(86,64,54)',
        color: '#253248',
      },
    })

    // @ts-ignore
    const volumeSeries = volumesChart.current.addHistogramSeries({
      color: '#be8f0f', //'rgba(255, 192, 0, 1)',// 'rgba(89, 55, 9, 1)',
      lineWidth: 0.001,
      priceFormat: {
        type: 'volume',
      },
      scaleMargins: {
        top: 0.32,
        bottom: 0,
      },
    })

    try {
      axios.get(apiUrl + '/api/analytics/volume').then((volumeResponse) => {
        if (volumeResponse.data) {
          const volumeDataFormated = volumeResponse.data.map((lq) => {
            return { time: lq.date, value: lq.volume }
          })
          volumeSeries.setData(volumeDataFormated)
          // @ts-ignore
          volumesChart.current.applyOptions({
            timeScale: {
              fixLeftEdge: true,
              fixRightEdge: true,
            },
          })
        }
      })
    } catch (err) {
      console.log(err)
    }
  }, [])

  useEffect(() => {
    // @ts-ignore
    lineChartResizeObserver.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      // @ts-ignore
      lineChart.current.applyOptions({ width, height })
      setTimeout(() => {
        // @ts-ignore
        lineChart.current.timeScale().fitContent()
      }, 0)
    })

    // @ts-ignore
    lineChartResizeObserver.current.observe(lineChartContainerRef.current)

    // @ts-ignore
    volumesChartResizeObserver.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      // @ts-ignore
      volumesChart.current.applyOptions({ width, height })
      setTimeout(() => {
        // @ts-ignore
        volumesChart.current.timeScale().fitContent()
      }, 0)
    })

    // @ts-ignore
    volumesChartResizeObserver.current.observe(volumesChartContainerRef.current)

    return () => {
      // @ts-ignore
      volumesChartResizeObserver.current.disconnect()
      // @ts-ignore
      lineChartResizeObserver.current.disconnect()
    }
  }, [])

  useEffect(() => {
    try {
      axios.get(apiUrl + '/api/analytics/toptokens').then((topTokensResponse) => {
        if (topTokensResponse.data) {
          setTopTokens(topTokensResponse.data)
        }
      })
    } catch (err) {
      console.log(err)
    }
  }, [])

  return (
    <>
      <Head>
        <title>Analytics | Solarbeam</title>
        <meta key="description" name="description" content="Analytics" />
      </Head>

      <div className="container px-0 mx-auto pb-6">
        <div className={`mb-2 pb-4 grid grid-cols-12 gap-4`}>
          <div className="flex justify-center items-center col-span-12 lg:justify">
            <Link href="/farm">
              <SolarbeamLogo />
            </Link>
          </div>
        </div>

        <DoubleGlowShadow maxWidth={false} opacity={'0.4'}>
          <div className={`grid grid-cols-12 gap-2 min-h-1/2`}>
            <div className={`col-span-12`}>
              <Card className="bg-dark-900 z-4">
                {/*<LayoutWrapperAnalytics savedOpen={savedOpen} setSavedOpen={setSavedOpen}>*/}
                {/*@ts-ignore*/}
                {/*<AnalyticsItem>*/}
                {/*  <GridRow>*/}
                {/*    <Panel className="space-y-2" style={{ height: '100%'}}>*/}
                {/*      <div className='hover:text-high-emphesis text-base font-bold text-primary'>*/}
                {/*        Liquidity*/}
                {/*      </div>*/}
                {/*      /!*       @ts-ignore *!/*/}
                {/*      <GlobalChart display='liquidity' />*/}
                {/*    </Panel>*/}
                {/*    <Panel className="space-y-2" style={{ height: '100%'}}>*/}
                {/*      <div className='hover:text-high-emphesis text-base font-bold text-primary'>*/}
                {/*        Volume*/}
                {/*      </div>*/}
                {/*      /!*       @ts-ignore *!/*/}
                {/*      <GlobalChart display='volume' />*/}
                {/*    </Panel>*/}
                {/*  </GridRow>*/}
                {/*</AnalyticsItem>*/}
                {/*/!*@ts-ignore*!/*/}
                {/*<AnalyticsItem title={`${i18n._(t`Top Tokens`)}`}>*/}
                {/*  /!*<Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>  *!/*/}
                {/*  <TopTokenList tokens={[]} />*/}
                {/*  /!*</Panel>*!/*/}
                {/*</AnalyticsItem>*/}

                {/*<AnalyticsItem*/}
                {/*  title={`Top Pairs`}*/}
                {/*  //@ts-ignore*/}
                {/*  subTitle={*/}
                {/*    <>*/}
                {/*      <Checkbox2*/}
                {/*        setChecked={() => setUseTracked(!useTracked)}*/}
                {/*        checked={useTracked}*/}
                {/*        text={'Hide untracked pairs'}*/}
                {/*      />*/}
                {/*      <QuestionHelper*/}
                {/*        text='USD amounts may be inaccurate in low liquiidty pairs or pairs without ETH or stablecoins.' />*/}
                {/*    </>*/}
                {/*  }*/}
                {/*>*/}

                {/*  /!*<CustomLink to={'/analytics/pairs'}>See All</CustomLink>*!/*/}

                {/*  /!*<Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>*!/*/}
                {/*    /!*@ts-ignore*!/*/}
                {/*    <PairList pairs={allPairs} useTracked={useTracked} />*/}
                {/*  /!*</Panel>*!/*/}
                {/*</AnalyticsItem>*/}
                {/*/!*@ts-ignore*!/*/}
                {/*<AnalyticsItem title={`${i18n._(t`Transactions`)}`}>*/}

                {/*  /!*<Panel style={{ margin: '1rem 0' }}>*!/*/}
                {/*    /!*@ts-ignore*!/*/}
                {/*    <TxnList transactions={transactions} />*/}
                {/*  /!*</Panel>*!/*/}

                {/*</AnalyticsItem>*/}
                {/*@ts-ignore*/}
                {/*<AnalyticsItem>*/}
                <GridRow>
                  <div className="hover:text-high-emphesis text-base font-bold text-primary">Liquidity</div>
                  <div className="hover:text-high-emphesis text-base font-bold text-primary">Volume</div>
                  <div className="p-2 rounded bg-dark-700" id="lineChart">
                    <div ref={lineChartContainerRef} />
                  </div>
                  <div className="p-2 rounded bg-dark-700" id="volumeChart">
                    <div ref={volumesChartContainerRef} />
                  </div>
                </GridRow>
                {/*@ts-ignore*/}
                <AnalyticsItem title={`${i18n._(t`Top Tokens`)}`}>
                  {/*<Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>  */}
                  <TopTokenList tokens={topTokens} />
                  {/*</Panel>*/}
                </AnalyticsItem>
                {/*</AnalyticsItem>*/}
                {/*</LayoutWrapperAnalytics>*/}
              </Card>
            </div>
          </div>
        </DoubleGlowShadow>
      </div>
    </>
  )
}
