import React, { useContext } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useLingui } from '@lingui/react'
import { formatNumber } from '../../functions'
import { usePositions } from './hooks'
import { PriceContext } from '../../contexts/priceContext'
import Typography from '../../components/Typography'

export const Sidebar = ({ farms, vaults }) => {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const positions = usePositions()

  const priceData = useContext(PriceContext)

  const solarPrice = priceData?.solar

  let summTvl = farms.reduce((previousValue, currentValue) => {
    return previousValue + currentValue.tvl
  }, 0)

  let summTvlVaults = vaults.reduce((previousValue, currentValue) => {
    return previousValue + (currentValue.totalLp / 1e18) * solarPrice
  }, 0)

  const valueStaked = positions.reduce((previousValue, currentValue) => {
    return previousValue + (currentValue.amount / 1e18) * solarPrice
  }, 0)

  return (
    <div className={`flex flex-col px-6 py-6 space-y-6 shadow bg-dark-700 sm:bg-light-glass rounded-xxl`}>
      <div>
        <Typography variant="h3" className={'text-high-emphesis'}>
          Vaults
        </Typography>
        <Typography variant="base" className={'text-emphasis'}>
          Long term supporters can choose to lock SOLAR for a determined period for higher rewards and increased
          multipliers for Eclipse.{' '}
          <a
            className="text-purple cursor-pointer"
            href="https://docs.solarbeam.io/getting-started/vaults"
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
          Vaults TVL
        </Typography>
        <Typography variant="h3" className={'text-high-emphesis'}>
          {formatNumber(summTvlVaults, true)}
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
    </div>
  )
}
