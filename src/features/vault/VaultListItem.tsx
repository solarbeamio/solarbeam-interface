import { classNames, formatNumber, formatNumberScale, formatPercent } from '../../functions'

import { Disclosure } from '@headlessui/react'
import DoubleLogo from '../../components/DoubleLogo'
import VaultListItemDetails from './VaultListItemDetails'
import Image from '../../components/Image'
import React, { useContext, useState } from 'react'
import { useCurrency } from '../../hooks/Tokens'
import { useV2PairsWithPrice } from '../../hooks/useV2Pairs'
import { SOLAR_ADDRESS } from '../../constants/tokens'
import { useActiveWeb3React } from '../../hooks'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import CurrencyLogo from '../../components/CurrencyLogo'
import { isMobile } from 'react-device-detect'
import YieldDetails from '../../components/YieldDetails'
import IconWrapper from '../../components/IconWrapper'
import { WNATIVE } from '../../constants'
import { PriceContext } from '../../contexts/priceContext'
import { Info } from 'react-feather'
import moment from 'moment'

const VaultListItem = ({ farm, ...rest }) => {
  const { chainId } = useActiveWeb3React()

  let token0 = useCurrency(farm.pair.token0?.id)
  let token1 = useCurrency(farm.pair.token1?.id)

  const priceData = useContext(PriceContext)

  const solarPrice = priceData?.['solar']
  const movrPrice = priceData?.['movr']
  const ribPrice = priceData?.['rib']

  const [selectedFarm, setSelectedFarm] = useState<string>(null)

  let [data] = useV2PairsWithPrice([[token0, token1]])
  let [state, pair, pairPrice] = data

  function getTvl() {
    let lpPrice = 0
    let decimals = 18
    if (farm.lpToken.toLowerCase() == SOLAR_ADDRESS[chainId].toLowerCase()) {
      lpPrice = solarPrice
      decimals = farm.pair.token0?.decimals
    } else if (farm.lpToken.toLowerCase() == WNATIVE[chainId].toLowerCase()) {
      lpPrice = movrPrice
    } else if (farm.lpToken.toLowerCase() == '0xbD90A6125a84E5C512129D622a75CDDE176aDE5E'.toLowerCase()) {
      lpPrice = ribPrice
    } else {
      lpPrice = pairPrice
    }

    farm.lpPrice = lpPrice
    farm.solarPrice = solarPrice

    return Number(farm.totalLp / 10 ** decimals) * lpPrice
  }

  const tvl = getTvl()

  const roiPerBlock =
    farm?.rewards?.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice
    }, 0) / tvl

  const roiPerHour = roiPerBlock * farm.blocksPerHour
  const roiPerDay = roiPerHour * 24
  const roiPerMonth = roiPerDay * 30
  const roiPerYear = roiPerDay * 365

  const { i18n } = useLingui()

  return (
    <React.Fragment>
      <Disclosure {...rest}>
        {({ open }) => (
          <div className="mb-4">
            <Disclosure.Button
              className={classNames(
                open && 'rounded-b-none',
                'w-full px-4 py-6 text-left rounded cursor-pointer select-none bg-dark-700  text-primary text-sm md:text-lg'
              )}
            >
              <div className="grid grid-cols-5 ">
                <div className="flex col-span-2 space-x-4 lg:col-span-1">
                  {token1 ? (
                    <DoubleLogo currency0={token0} currency1={token1} size={isMobile ? 32 : 40} />
                  ) : (
                    <div className="flex items-center">
                      <CurrencyLogo currency={token0} size={isMobile ? 40 : 50} />
                    </div>
                  )}
                  <div className={`flex flex-col justify-center ${token1 ? 'md:flex-row' : ''}`}>
                    <div>
                      <span className="flex font-bold">{farm?.pair?.token0?.symbol}</span>
                      {token1 && <span className="flex font-bold">{farm?.pair?.token1?.symbol}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center font-bold">
                  {farm?.lockupDuration == 0 ? 'No lockup' : `${farm?.lockupDuration / 86400} days`}
                </div>
                <div className="flex flex-col justify-center font-bold">{formatNumberScale(tvl, true, 2)}</div>
                <div className="flex-row items-center hidden space-x-4 lg:flex">
                  <div className="flex items-center space-x-2">
                    {farm?.rewards?.map((reward, i) => (
                      <div key={i} className="flex items-center">
                        <Image
                          src={`https://app.solarbeam.io/images/tokens/solar.png`}
                          width="50px"
                          height="50px"
                          className="rounded-md"
                          layout="fixed"
                          alt={reward.token}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-1">
                    {farm?.rewards?.map((reward, i) => (
                      <div key={i} className="text-xs md:text-sm whitespace-nowrap">
                        {formatNumber(reward.rewardPerDay)} {reward.token} {i18n._(t`/ DAY`)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <div
                    className="font-bold flex justify items-center text-righttext-high-emphesis"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFarm(farm.id)
                    }}
                  >
                    <IconWrapper size="16px" marginRight={'10px'}>
                      <Info />
                    </IconWrapper>
                    {roiPerYear > 1000000 ? '100000000%+' : formatPercent(roiPerYear * 100)}
                  </div>
                  <div className="text-xs text-right md:text-base text-secondary">{i18n._(t`annualized`)}</div>
                </div>
              </div>
            </Disclosure.Button>
            {open && <VaultListItemDetails farm={farm} />}
          </div>
        )}
      </Disclosure>
      {!!selectedFarm && (
        <YieldDetails
          key={farm.id}
          isOpen={selectedFarm == farm.id}
          onDismiss={() => setSelectedFarm(null)}
          roiPerDay={roiPerDay}
          roiPerMonth={roiPerMonth}
          roiPerYear={roiPerYear}
          token0={token0}
          token1={token1}
          lpPrice={farm.lpPrice}
          solarPrice={solarPrice}
        />
      )}
    </React.Fragment>
  )
}

export default VaultListItem
