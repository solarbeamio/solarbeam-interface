import React, { useContext, useState } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { formatNumber, formatNumberScale } from '../../functions'
import { usePositions } from './hooks'
import { PriceContext } from '../../contexts/priceContext'
import { getAddress } from 'ethers/lib/utils'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { POOLS } from '../../constants/farms'
import Button from '../../components/Button'
import useMasterChef from './useMasterChef'
import Typography from '../../components/Typography'

export const Sidebar = ({ positions, farms, vaults }) => {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const { harvest } = useMasterChef()

  const [pendingTx, setPendingTx] = useState(false)
  const addTransaction = useTransactionAdder()

  const priceData = useContext(PriceContext)

  const solarPrice = priceData?.solar

  console.log(farms)

  let summTvl = farms?.reduce((previousValue, currentValue) => {
    return previousValue + (isNaN(currentValue?.tvl) ? 0 : currentValue?.tvl)
  }, 0)

  let summTvlVaults = vaults.reduce((previousValue, currentValue) => {
    return previousValue + (currentValue.totalLp / 1e18) * solarPrice
  }, 0)

  const farmingPools = Object.keys(POOLS[chainId]).map((key) => {
    return { ...POOLS[chainId][key], lpToken: key }
  })

  const allStaked = positions.reduce((previousValue, currentValue) => {
    return previousValue + (currentValue.pendingSolar / 1e18) * solarPrice
  }, 0)

  const valueStaked = positions.reduce((previousValue, currentValue) => {
    const pool = farmingPools.find((r) => parseInt(r.id.toString()) == parseInt(currentValue.id))
    const poolTvl = farms.find((r) => getAddress(r.lpToken) == getAddress(pool?.lpToken))
    return previousValue + (currentValue.amount / 1e18) * poolTvl?.price
  }, 0)

  return (
    <div className={`flex flex-col px-6 py-6 space-y-6 shadow bg-dark-700 sm:bg-light-glass rounded-xxl`}>
      <div>
        <Typography variant="h3" className={'text-high-emphesis'}>
          Farms
        </Typography>
        <Typography variant="base" className={'text-emphasis'}>
          Stake liquidity pool tokens to earn rewards in SOLAR.{' '}
          <a
            className="text-purple cursor-pointer"
            href="https://docs.solarbeam.io/getting-started/pools"
            rel="noreferrer"
            target="_blank"
          >
            See how it works.
          </a>
        </Typography>
      </div>
      <div>
        <Typography variant="base" className={'text-emphasis'}>
          Total Value Locked
        </Typography>
        <Typography variant="h3" className={'text-high-emphesis'}>
          {formatNumber(summTvl + summTvlVaults, true)}
        </Typography>
      </div>
      <div>
        <Typography variant="base" className={'text-emphasis'}>
          Farms TVL
        </Typography>
        <Typography variant="h3" className={'text-high-emphesis'}>
          {formatNumber(summTvl, true)}
        </Typography>
      </div>
      <div>
        <Typography variant="base" className={'text-emphasis'}>
          My Holdings
        </Typography>
        <Typography variant="h3" className={'text-high-emphesis'}>
          {formatNumber(valueStaked, true)}
        </Typography>
      </div>

      {positions.length > 0 && (
        <div>
          <Typography variant="base" className={'text-emphasis'}>
            Pending Rewards
          </Typography>
          <div className="flex justify-between space-x-6">
            <Typography variant="h3" className={'text-high-emphesis'}>
              {formatNumber(allStaked, true)}{' '}
            </Typography>
            <div className="py-1">
              <Button
                color="gradient"
                className="text-emphasis items-center py-1"
                variant={'flexed'}
                size={'xs'}
                disabled={pendingTx}
                onClick={async () => {
                  setPendingTx(true)
                  for (const pos of positions) {
                    try {
                      const tx = await harvest(parseInt(pos.id))
                      addTransaction(tx, {
                        summary: `${i18n._(t`Harvest`)} SOLAR`,
                      })
                    } catch (error) {
                      console.error(error)
                    }
                  }
                  setPendingTx(false)
                }}
              >
                Harvest All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
