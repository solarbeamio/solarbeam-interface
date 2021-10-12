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

export default function Vault(): JSX.Element {
  const { i18n } = useLingui()
  const router = useRouter()
  const { chainId } = useActiveWeb3React()

  const positions = usePositions()

  const vaults = useVaults()

  const distributorInfo = useSolarVaultInfo()

  const priceData = useContext(PriceContext)

  const solarPrice = priceData?.['solar']
  const movrPrice = priceData?.['movr']

  const tvlInfo = useTVL()

  const summTvl = tvlInfo.reduce((previousValue, currentValue) => {
    return previousValue + currentValue.tvl
  }, 0)

  const summTvlVaults = vaults.reduce((previousValue, currentValue) => {
    return previousValue + (currentValue.totalLp / 1e18) * solarPrice
  }, 0)

  const blocksPerDay = 86400 / Number(AVERAGE_BLOCK_TIME[chainId])

  const map = (pool) => {
    pool.owner = 'Solarbeam'
    pool.balance = 0

    const pair = VAULTS[chainId][pool.id]

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
  const data = vaults.map(map)

  const valueStaked = positions.reduce((previousValue, currentValue) => {
    return previousValue + (currentValue.amount / 1e18) * solarPrice
  }, 0)

  return (
    <>
      <Head>
        <title>Vaults | Solarbeam</title>
        <meta key="description" name="description" content="Solar Vaults" />
      </Head>

      <div className="container px-0 mx-auto sm:pb-16 sm:pt-16">
        <DoubleGlowShadow maxWidth={false} opacity={'0.4'}>
          <div className={`grid grid-cols-12 gap-2 min-h-1/2`}>
            <div className={`col-span-12`}>
              <Card className="bg-dark-900 z-4">
                <div className={`grid grid-cols-12 md:space-x-4 space-y-4 md:space-y-0 `}>
                  <div className={`col-span-12 md:col-span-3 space-y-4`}>
                    <div className={`hidden md:block`}>
                      <div className={`col-span-12 md:col-span-4 bg-dark-800 px-6 py-4 rounded`}>
                        <div className="mb-2 text-2xl text-emphesis">{i18n._(t`Solar Vault`)}</div>
                        <div className="mb-4 text-base text-secondary">
                          <p>
                            {i18n._(
                              t`Solar Vault is a set of high incentivized pools. Long term supporters can choose to lock SOLAR for a determined period for higher rewards.`
                            )}
                          </p>
                          <p className="mt-2">
                            {i18n._(
                              t`The participants receive various benefits such as higher rewards according to lock duration, higher allocations in Solar Launchpad and more.`
                            )}
                          </p>
                        </div>
                        <div className="mb-2 text-2xl text-emphesis">{i18n._(t`Considerations`)}</div>{' '}
                        <div className="mb-4 text-base text-secondary">
                          <p>{i18n._(t`Everytime you stake or claim rewards your lock time renews.`)}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`flex flex-col items-center justify-between px-6 py-6 `}>
                      <div className="flex items-center justify-between py-2 text-emphasis">
                        Total Value Locked: {formatNumberScale(summTvl + summTvlVaults, true, 2)}
                      </div>
                      <div className="flex items-center justify-between py-2 text-emphasis">
                        Vaults TVL: {formatNumberScale(summTvlVaults, true, 2)}
                      </div>
                      {positions.length > 0 && (
                        <div className="flex items-center justify-between py-2 text-emphasis">
                          My Holdings: {formatNumberScale(valueStaked, true, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`col-span-12 md:col-span-9 bg-dark-800  py-4 md:px-6 md:py-4 rounded`}>
                    <VaultList farms={data} />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </DoubleGlowShadow>
      </div>
    </>
  )
}
