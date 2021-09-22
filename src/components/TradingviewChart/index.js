import React, { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { formattedNum } from '../../utils'
import styled from 'styled-components'
import { usePrevious } from 'react-use'
import { Play } from 'react-feather'
import { IconWrapper } from '../analyticsCSS'

dayjs.extend(utc)

export const CHART_TYPES = {
  BAR: 'BAR',
  AREA: 'AREA'
}

const Wrapper = styled.div`
  position: relative;
`

// constant height for charts
const HEIGHT = 300


const TradingViewChart = ({
    type = CHART_TYPES.BAR,
    data,
    base,
    baseChange,
    field,
    title,
    width,
    useWeekly = false
  }) => {

  const { createChart } = require('lightweight-charts')
  // reference for DOM element to create with chart
  const ref = useRef()

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState(false)
  const dataPrev = usePrevious(data)

  useEffect(() => {
    if (data !== dataPrev && chartCreated && type === CHART_TYPES.BAR) {
      // remove the tooltip element
      let tooltip = document.getElementById('tooltip-id' + type)
      let node = document.getElementById('test-id' + type)
      node.removeChild(tooltip)
      chartCreated.resize(0, 0)
      setChartCreated(chartCreated)
    }
  }, [chartCreated, data, dataPrev, type])

  // parese the data and format for tardingview consumption
  const formattedData = data?.map((entry) => {
    return {
      time: dayjs.unix(entry.date).utc().format('YYYY-MM-DD'),
      value: parseFloat(entry[field])
    }
  })

  // adjust the scale based on the type of chart
  const topScale = type === CHART_TYPES.AREA ? 0.32 : 0.2

  // const [darkMode] = false
  const textColor = 'white'
  // const previousTheme = usePrevious(darkMode)

  // reset the chart if them switches
  useEffect(() => {
    if (chartCreated) {
      // remove the tooltip element
      let tooltip = document.getElementById('tooltip-id' + type)
      let node = document.getElementById('test-id' + type)
      node.removeChild(tooltip)
      chartCreated.resize(0, 0)
      setChartCreated(chartCreated)
    }
  }, [chartCreated, type])

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && formattedData) {
      var chart = createChart(ref.current, {
        width: width,
        height: HEIGHT,
        layout: {
          backgroundColor: '#000',
          textColor: 'rgba(255, 255, 255, 1)',
          color: '#000'
        },
        rightPriceScale: {
          borderColor: 'rgb(86,64,54)',
          scaleMargins: {
            top: topScale,
            bottom: 0
          },
          borderVisible: false
        },
        timeScale: {
          borderVisible: false,
          borderColor: 'rgb(86,64,54)',
          color: '#253248'
        },
        grid: {
          horzLines: {
            color: 'rgb(204,210,91, 0.1)',
            visible: false
          },
          vertLines: {
            color: 'rgb(204,210,91, 0.1)',
            visible: false
          }
        },
        crosshair: {
          // mode: CrosshairMode.Normal,
          horzLine: {
            visible: false,
            labelVisible: false
          },
          vertLine: {
            visible: true,
            style: 0,
            width: 2,
            color: 'rgba(32, 38, 46, 0.1)',
            labelVisible: false
          }
        },
        localization: {
          priceFormatter: (val) => formattedNum(val, true)
        }
      })

      var series =
        type === CHART_TYPES.BAR
          ? chart.addHistogramSeries({
            color: 'rgba(255, 192, 0, 1)',
            priceFormat: {
              type: 'volume'
            },
            scaleMargins: {
              top: 0.32,
              bottom: 0
            },
            lineColor: 'rgba(255, 192, 0, 1)',
            lineWidth: 3
          })
          : chart.addAreaSeries({
            topColor: 'rgba(255, 192, 0, 0.56)',
            bottomColor: '#301934',
            lineColor: 'rgba(255, 192, 0, 1)',
            lineWidth: 2
          })
      console.log(type)
      series.setData(formattedData)
      console.log(type+' sicsdf ')
      var toolTip = document.createElement('div')
      toolTip.setAttribute('id', 'tooltip-id' + type)
      toolTip.className = 'three-line-legend-dark' //: 'three-line-legend'
      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.fontWeight = '500'
      toolTip.style.left = -4 + 'px'
      toolTip.style.top = '-' + 8 + 'px'
      toolTip.style.backgroundColor = 'transparent'

      // format numbers
      let percentChange = baseChange?.toFixed(2)
      let formattedPercentChange = (percentChange > 0 ? '+' : '') + percentChange + '%'
      let color = percentChange >= 0 ? 'green' : 'red'

      // get the title of the chart
      function setLastBarText() {
        toolTip.innerHTML =
          `<div style='font-size: 16px; margin: 4px 0px; color: ${textColor};'>${title} ${
            type === CHART_TYPES.BAR && !useWeekly ? '(24hr)' : ''
          }</div>` +
          `<div style='font-size: 22px; margin: 4px 0px; color:${textColor}' >` +
          formattedNum(base ?? 0, true) +
          `<span style='margin-left: 10px; font-size: 16px; color: ${color};'>${formattedPercentChange}</span>` +
          '</div>'
      }

      setLastBarText()

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function(param) {
        if (
          param === undefined ||
          param.time === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > HEIGHT
        ) {
          setLastBarText()
        } else {
          let dateStr = useWeekly
            ? dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
              .startOf('week')
              .format('MMMM D, YYYY') +
            '-' +
            dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
              .endOf('week')
              .format('MMMM D, YYYY')
            : dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day).format('MMMM D, YYYY')
          var price = param.seriesPrices.get(series)

          toolTip.innerHTML =
            `<div style='font-size: 16px; margin: 4px 0px; color: ${textColor};'>${title}</div>` +
            `<div style='font-size: 22px; margin: 4px 0px; color: ${textColor}'>` +
            formattedNum(price, true) +
            '</div>' +
            '<div>' +
            dateStr +
            '</div>'
        }
      })

      chart.timeScale().fitContent()

      setChartCreated(chart)
    }
  }, [
    base,
    baseChange,
    chartCreated,
    data,
    formattedData,
    textColor,
    title,
    topScale,
    type,
    useWeekly,
    width
  ])

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, HEIGHT)
      chartCreated && chartCreated.timeScale().scrollToPosition(0)
    }
  }, [chartCreated, width])

  return (
    <Wrapper>
      <div ref={ref} id={'test-id' + type} />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent()
          }}
        />
      </IconWrapper>
    </Wrapper>
  )
}

export default TradingViewChart
