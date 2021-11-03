/* eslint-disable @next/next/link-passhref */
import React, { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { getAddress } from '@ethersproject/address'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Head from 'next/head'

import { useActiveWeb3React, useFuse } from '../../hooks'
import FarmList from '../../features/farm/FarmList'
import Menu from '../../features/farm/FarmMenu'
import { formatNumberScale } from '../../functions'
import { usePositions, useFarms, useDistributorInfo } from '../../features/farm/hooks'
import Card from '../../components/Card'
import Button from '../../components/Button'
import DoubleGlowShadow from '../../components/DoubleGlowShadow'
import { SOLAR_ADDRESS, AVERAGE_BLOCK_TIME, WNATIVE } from '../../constants'
import { POOLS } from '../../constants/farms'
import { PriceContext } from '../../contexts/priceContext'
import useMasterChef from '../../features/farm/useMasterChef'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useTVL } from '../../hooks/useV2Pairs'
import { useVaults } from '../../features/vault/hooks'
import Search from '../../components/Search'
import { Sidebar } from '../../features/farm/FarmSidebar'

export default function Farm(): JSX.Element {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const router = useRouter()

  const type = router.query.filter as string

  const positions = usePositions()

  const farms = useFarms()
  const vaults = useVaults()

  const distributorInfo = useDistributorInfo()

  const priceData = useContext(PriceContext)

  const solarPrice = priceData?.solar
  const movrPrice = priceData?.movr

  const tvlInfo = useTVL()

  const blocksPerDay = 86400 / Number(AVERAGE_BLOCK_TIME[chainId])

  const map = (pool) => {
    pool.owner = 'Solarbeam'
    pool.balance = 0

    const pair = POOLS[chainId][pool.lpToken]

    const blocksPerHour = 3600 / AVERAGE_BLOCK_TIME[chainId]

    function getRewards() {
      const rewardPerBlock =
        ((pool.allocPoint / distributorInfo.totalAllocPoint) * distributorInfo.solarPerBlock) / 1e18

      const defaultReward = {
        token: 'SOLAR',
        icon: '/images/token/solar.png',
        rewardPerBlock,
        rewardPerDay: rewardPerBlock * blocksPerDay,
        rewardPrice: solarPrice,
      }

      const defaultRewards = [defaultReward]

      return defaultRewards
    }

    //Fix this asap later
    function getTvl(pool) {
      let lpPrice = 0
      let decimals = 18
      if (pool.lpToken == SOLAR_ADDRESS[chainId]) {
        lpPrice = solarPrice
        decimals = pair.token0?.decimals
      } else if (pool.lpToken.toLowerCase() == WNATIVE[chainId].toLowerCase()) {
        lpPrice = movrPrice
      } else {
        lpPrice = 0
      }

      return Number(pool.totalLp / 10 ** decimals) * lpPrice
    }

    const rewards = getRewards()

    const tvl = getTvl(pool)

    const roiPerBlock =
      rewards.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice
      }, 0) / tvl

    const roiPerHour = roiPerBlock * blocksPerHour
    const roiPerDay = roiPerHour * 24
    const roiPerMonth = roiPerDay * 30
    const roiPerYear = roiPerDay * 365

    const position = positions.find((position) => position.id === pool.id)

    return {
      ...pool,
      ...position,
      pair: {
        ...pair,
        decimals: 18,
      },
      roiPerBlock,
      roiPerHour,
      roiPerDay,
      roiPerMonth,
      roiPerYear,
      rewards,
      tvl,
      blocksPerHour,
    }
  }

  const FILTER = {
    my: (farm) => farm?.amount && !farm.amount.isZero(),
  }

  const data = farms.map(map).filter((farm) => {
    return type in FILTER ? FILTER[type](farm) : true
  })

  const options = {
    keys: ['pair.id', 'pair.token0.symbol', 'pair.token1.symbol', 'pair.token0.name', 'pair.token1.name'],
    threshold: 0.4,
  }

  const { result, term, search } = useFuse({
    data,
    options,
  })

  return (
    <>
      <Head>
        <title>Farm | Solarbeam</title>
        <meta key="description" name="description" content="Farm SOLAR" />
      </Head>

      <DoubleGlowShadow opacity="0.6" maxWidth={false} className={'container px-0 mx-auto '}>
        <div className={`z-4 grid grid-cols-12 md:space-x-4 space-y-4 md:space-y-0 pb-12 sm:pt-12 sm:mt-16 mt-4 m-2 `}>
          <div className={`col-span-12 md:col-span-3 space-y-4`}>
            <Sidebar tvl={tvlInfo} vaults={vaults} />
          </div>
          <div className={`col-span-12 md:col-span-9 py-4 md:px-6 md:py-6 shadow bg-dark-900 rounded-xxl`}>
            <div className={`flex flex-col md:flex-row space-y-4 md:space-x-5 md:space-y-0 mb-8`}>
              <Menu positionsLength={positions.length} />
              <Search
                className={'flex flex-col flex-1 md:flex-row px-1 py-1 bg-dark-700 rounded-xxl'}
                placeholder={'Search by name, symbol or address'}
                term={term}
                search={(value: string): void => {
                  search(value)
                }}
              />
            </div>
            <FarmList farms={result} term={term} />
          </div>
        </div>
      </DoubleGlowShadow>
    </>
  )
}
