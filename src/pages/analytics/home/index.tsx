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
import { formatNumberScale } from '../../../functions'
import moment from 'moment'
import Typography from '../../../components/Typography'
import Panel from '../../../components/Panel'

const useHover = () => {
  const ref = useRef()
  const [ts, setTs] = useState(null)
  const leave = () => {
    setTs(new Date().getTime())
  }

  useEffect(() => {
    const el = ref.current // cache external ref value for cleanup use
    if (el) {
      // @ts-ignore
      el.addEventListener('mouseleave', leave)

      return () => {
        if (el) {
          // @ts-ignore
          el.removeEventListener('mouseleave', leave)
        }
      }
    }
  }, [])

  return {
    ref,
    ts,
  }
}

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
  const [lastLiquidityRow, setLastLiquidityRow] = useState(null)
  const [liquidityValue, setLiquidityValue] = useState(0)
  const [liquidityDate, setLiquidityDate] = useState({})

  const [lastVolumeRow, setLastVolumeRow] = useState(null)
  const [volumeValue, setVolumeValue] = useState(0)
  const [volumeDate, setVolumeDate] = useState({})

  const [useTracked, setUseTracked] = useState(true)

  const [savedOpen, setSavedOpen] = useState(false)

  const { createChart, isBusinessDay, CrosshairMode, ColorType } = require('lightweight-charts')
  const { i18n } = useLingui()
  const router = useRouter()
  const { chainId } = useActiveWeb3React()

  const { ref: lineChartParent, ts: leaveTimes } = useHover()
  const { ref: volumeChartParent, ts: volLeaveTimes } = useHover()

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

  useEffect(() => {
    if (lastLiquidityRow) {
      setLiquidityValue(lastLiquidityRow.liquidity)
      setLiquidityDate(lastLiquidityRow.date)
    }
  }, [leaveTimes])

  useEffect(() => {
    if (lastVolumeRow) {
      setVolumeValue(lastVolumeRow.volume)
      setVolumeDate(lastVolumeRow.date)
    }
  }, [volLeaveTimes])

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
        backgroundColor: 'rgb(8, 8, 8)',
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
        vertLine: {
          labelVisible: false,
        },
      },
      priceScale: {
        borderColor: 'rgb(86,64,54)',
      },
      timeScale: {
        borderColor: 'rgb(86,64,54)',
        color: '#253248',
        fixRightEdge: true,
      },
    })

    // @ts-ignore
    const areaSeries = lineChart.current.addAreaSeries({
      topColor: '#ffc000',
      priceFormat: {
        type: 'volume',
      },
      bottomColor: '#8800ec',
      lineColor: '#0F182A',
      lineWidth: 1,
    })

    if (lineChart.current) {
      // @ts-ignore
      lineChart.current.subscribeCrosshairMove(function (param) {
        if (param.point === undefined || !param.time) {
          if (lastLiquidityRow) {
            setLiquidityValue(lastLiquidityRow.liquidity)
            setLiquidityDate(lastLiquidityRow.date)
          }
        } else {
          var price = param.seriesPrices.get(areaSeries)
          setLiquidityValue(price)
          setLiquidityDate({ ...param.time, month: param.time.month - 1 })
        }
      })
    }

    try {
      axios.get(apiUrl + '/api/analytics/liquidity').then((liquidityResponse) => {
        if (liquidityResponse.data) {
          if (liquidityResponse.data[liquidityResponse.data.length - 1]) {
            const row = liquidityResponse.data[liquidityResponse.data.length - 1]
            setLastLiquidityRow(row)
            setLiquidityValue(row.liquidity)
            setLiquidityDate(row.date)
          }
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
        backgroundColor: 'rgb(8, 8, 8)',
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
        vertLine: {
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
      color: '#8901ec',
      base: 0,
      priceFormat: {
        type: 'volume',
      },
    })

    if (volumesChart.current) {
      // @ts-ignore
      volumesChart.current.subscribeCrosshairMove(function (param) {
        if (param.point === undefined || !param.time) {
        } else {
          var price = param.seriesPrices.get(volumeSeries)
          setVolumeValue(price)
          setVolumeDate({ ...param.time, month: param.time.month - 1 })
        }
      })
    }

    try {
      axios.get(apiUrl + '/api/analytics/volume').then((volumeResponse) => {
        if (volumeResponse.data) {
          if (volumeResponse.data[volumeResponse.data.length - 1]) {
            const row = volumeResponse.data[volumeResponse.data.length - 1]
            setLastVolumeRow(row)
            setVolumeValue(row.volume)
            setVolumeDate(row.date)
          }

          const volumeDataFormated = volumeResponse.data.map((lq) => {
            return { time: lq.date, value: lq.volume }
          })
          volumeSeries.setData(volumeDataFormated)
          // @ts-ignore
          volumesChart.current.applyOptions({
            base: 10,
            timeScale: {
              // fixLeftEdge: true,
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
                  <div className="text-base text-primary">
                    <Typography component="h1" variant="h2">
                      Liquidity
                    </Typography>
                    <h4>{formatNumberScale(liquidityValue, true, 2)}</h4>
                    <h4>{moment(liquidityDate).format('MMM DD, YYYY')}</h4>
                  </div>
                  <div className="text-base text-primary">
                    <Typography component="h1" variant="h2">
                      Volume
                    </Typography>
                    <h4>{formatNumberScale(volumeValue, true, 2)}</h4>
                    <h4>{moment(volumeDate).format('MMM DD, YYYY')}</h4>
                  </div>
                  <div className="mt-1" id="lineChart">
                    <div ref={lineChartParent}>
                      <div ref={lineChartContainerRef} />
                    </div>
                  </div>
                  <div className="mt-1" id="volumeChart">
                    <div ref={volumeChartParent}>
                      <div ref={volumesChartContainerRef} />
                    </div>
                  </div>
                </GridRow>
                <Panel>
                  <div className="text-base text-primary mt-10">
                    <Typography component="h1" variant="h2">
                      Top Tokens
                    </Typography>
                  </div>
                  <TopTokenList tokens={topTokens} itemMax={5} />
                </Panel>
                {/*@ts-ignore*/}
                {/* <AnalyticsItem title={`${i18n._(t`Top Tokens`)}`}> */}
                {/*<Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>  */}
                {/* <TopTokenList tokens={topTokens} /> */}
                {/*</Panel>*/}
                {/* </AnalyticsItem> */}
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
