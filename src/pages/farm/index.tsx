/* eslint-disable @next/next/link-passhref */
import React from 'react'
import { useRouter } from 'next/router'
import { useLingui } from '@lingui/react'
import Head from 'next/head'
import { useActiveWeb3React, useFuse } from '../../hooks'
import FarmList from '../../features/farm/FarmList'
import Menu from '../../features/farm/FarmMenu'
import { usePositions, useFarms, usePairPrices, useFarmsV2, usePositionsV2 } from '../../features/farm/hooks'
import DoubleGlowShadow from '../../components/DoubleGlowShadow'
import { POOLS, POOLS_V2 } from '../../constants/farms'
import { useVaults } from '../../features/vault/hooks'
import Search from '../../components/Search'
import { Sidebar } from '../../features/farm/FarmSidebar'
import useFeesAprPerYear from '../../hooks/useFeeAPR'

export default function Farm(): JSX.Element {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const router = useRouter()

  const type = (router.query.filter as string) || ''

  const vaults = useVaults()

  const farms = useFarms()
  const farmsV2 = useFarmsV2()

  const pairPrices = usePairPrices(POOLS)
  const pairPricesV2 = usePairPrices(POOLS_V2)

  const positions = usePositions()
  const positionsV2 = usePositionsV2()

  const feesAprPerYear = useFeesAprPerYear(POOLS)
  const feesAprPerYearV2 = useFeesAprPerYear(POOLS_V2)

  const map = (pool, poolVersion, positions, pairPrices, feesAprPerYear, version) => {
    const pair = poolVersion[chainId][pool.lpToken]
    const position = positions.find((position) => position.id === pool.id)
    const pairPrice = pairPrices.find((item) => item.token == pool.lpToken)
    const feeAprPerYear = feesAprPerYear.find((item) => item.id === pool.lpToken?.toLowerCase())?.apr / 100
    const tvl = (pool?.totalLp / 10 ** pair?.decimals) * pairPrice?.price
    const rewardsTotal = pool?.rewards?.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.rewardPerDay * currentValue.rewardPrice
    }, 0)
    const rewardAprPerYear =
      (pool?.rewards?.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.rewardPerDay * currentValue.rewardPrice
      }, 0) /
        tvl) *
      365
    const roiPerYear = feeAprPerYear ? feeAprPerYear + rewardAprPerYear : rewardAprPerYear

    return {
      ...pool,
      ...position,
      tvl,
      price: pairPrice?.price,
      feeAprPerYear,
      rewardAprPerYear,
      roiPerYear,
      rewardsTotal,
      pair: {
        ...pair,
        decimals: 18,
      },
      version,
    }
  }
  const FILTER = {
    '': (farm) => farm?.rewardsTotal > 0,
    my: (farm) => farm?.amount && !farm.amount.isZero(),
    inactive: (farm) => farm?.rewardsTotal == 0,
  }

  const itemsV1 = farms.map((item) => map(item, POOLS, positions, pairPrices, feesAprPerYear, 1))
  const itemsV2 = farmsV2.map((item) => map(item, POOLS_V2, positionsV2, pairPricesV2, feesAprPerYearV2, 2))

  const items = itemsV1.concat(itemsV2)

  const data = items.filter((farm) => {
    return type in FILTER ? FILTER[type](farm) : true
  })

  const hasPositions = items.find((farm) => {
    return farm?.amount && !farm.amount.isZero()
  })

  const { result, term, search } = useFuse({
    data,
    options: {
      keys: ['pair.id', 'pair.token0.symbol', 'pair.token1.symbol', 'pair.token0.name', 'pair.token1.name'],
      threshold: 0.4,
    },
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
            <Sidebar positions={positions} farms={items} vaults={vaults} />
          </div>
          <div className={`col-span-12 md:col-span-9 py-4 md:px-6 md:py-6 shadow bg-dark-900 rounded-xxl`}>
            <div className={`flex flex-col md:flex-row space-y-4 md:space-x-5 md:space-y-0 mb-8`}>
              <Menu hasPosition={hasPositions} />
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
