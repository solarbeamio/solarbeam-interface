/* eslint-disable @next/next/link-passhref */
import { useActiveWeb3React, useFuse } from '../../hooks'

import Head from 'next/head'
import React, { useContext, useState } from 'react'
import { formatNumberScale } from '../../functions'
import { usePositions, useSolarVaultInfo, useVaults } from '../../features/vault/hooks'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Card from '../../components/Card'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import DoubleGlowShadow from '../../components/DoubleGlowShadow'
import { SOLAR_ADDRESS, AVERAGE_BLOCK_TIME, WNATIVE } from '../../constants'
import { VAULTS } from '../../constants/vaults'
import SolarbeamLogo from '../../components/SolarbeamLogo'
import { PriceContext } from '../../contexts/priceContext'
import useMasterChef from '../../features/farm/useMasterChef'
import { useTVL } from '../../hooks/useV2Pairs'
import { getAddress } from '@ethersproject/address'
import VaultList from '../../features/vault/VaultList'
import { Sidebar } from '../../features/vault/VaultSidebar'
import Menu from '../../features/vault/VaultMenu'
import { useFarms, useFarmsV2, usePairPrices } from '../../features/farm/hooks'
import { POOLS, POOLS_V2 } from '../../constants/farms'

export default function Vault(): JSX.Element {
  const { i18n } = useLingui()
  const router = useRouter()
  const { chainId } = useActiveWeb3React()

  const type = router.query.filter as string

  const vaults = useVaults()

  const farms = useFarms()
  const farmsV2 = useFarmsV2()

  const pairPrices = usePairPrices(POOLS)
  const pairPricesV2 = usePairPrices(POOLS_V2)

  const positions = usePositions()

  const mapFarms = (pool, poolMap, pairPrices) => {
    const pair = poolMap[chainId][pool.lpToken]
    const pairPrice = pairPrices.find((item) => item.token == pool.lpToken)
    const tvl = (pool?.totalLp / 10 ** pair?.decimals) * pairPrice?.price
    return {
      tvl,
    }
  }

  const v1 = farms.map((item) => mapFarms(item, POOLS, pairPrices))
  const v2 = farmsV2.map((item) => mapFarms(item, POOLS_V2, pairPricesV2))
  const allFarms = v1.concat(v2)

  const distributorInfo = useSolarVaultInfo()

  const priceData = useContext(PriceContext)

  const solarPrice = priceData?.['solar']
  const movrPrice = priceData?.['movr']

  const blocksPerDay = 86400 / Number(AVERAGE_BLOCK_TIME[chainId])

  const map = (pool, index) => {
    pool.owner = 'Solarbeam'
    pool.balance = 0

    const pair = VAULTS[chainId][pool.id]

    const blocksPerHour = 3600 / AVERAGE_BLOCK_TIME[chainId]

    const correctAllocpoints = [10, 20, 100]
    pool.allocPoint = correctAllocpoints[index]

    function getRewards() {
      const rewardPerBlock =
        ((correctAllocpoints[index] / distributorInfo.totalAllocPoint) * distributorInfo.solarPerBlock) / 1e18

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

  const data = vaults.map(map).filter((farm) => {
    return type in FILTER ? FILTER[type](farm) : true
  })

  return (
    <>
      <Head>
        <title>Vaults | Solarbeam</title>
        <meta key="description" name="description" content="Solar Vaults" />
      </Head>

      <DoubleGlowShadow opacity="0.6" maxWidth={false} className={'container px-0 mx-auto '}>
        <div className={`z-4 grid grid-cols-12 md:space-x-4 space-y-4 md:space-y-0 pb-12 sm:pt-12 sm:mt-16 mt-4 m-2 `}>
          <div className={`col-span-12 md:col-span-3 space-y-4`}>
            <Sidebar farms={allFarms} vaults={vaults} />
          </div>
          <div className={`col-span-12 md:col-span-9 py-4 md:px-6 md:py-6 shadow bg-dark-900 rounded-xxl`}>
            <div className={`flex flex-col md:flex-row space-y-4 md:space-x-5 md:space-y-0 mb-8`}>
              <Menu positionsLength={positions.length} />
              <div className={'py-4 flex flex-1 text-right text-gray-500 justify-end items-center'}>
                Everytime you stake or claim rewards your lock time renews
              </div>
            </div>
            <VaultList farms={data} />
          </div>
        </div>
      </DoubleGlowShadow>
    </>
  )
}
