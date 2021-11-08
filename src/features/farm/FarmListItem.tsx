import { classNames, formatNumber, formatNumberScale, formatPercent } from '../../functions'
import { Disclosure } from '@headlessui/react'
import DoubleLogo from '../../components/DoubleLogo'
import FarmListItemDetails from './FarmListItemDetails'
import Image from '../../components/Image'
import React, { useState } from 'react'
import { useCurrency } from '../../hooks/Tokens'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import CurrencyLogo from '../../components/CurrencyLogo'
import { isMobile } from 'react-device-detect'
import YieldDetails from '../../components/YieldDetails'
import IconWrapper from '../../components/IconWrapper'
import { Info } from 'react-feather'
import Link from 'next/link'

const FarmListItem = ({ farm, ...rest }) => {
  const { i18n } = useLingui()

  const [selectedFarm, setSelectedFarm] = useState<string>(null)

  let token0 = useCurrency(farm.pair.token0?.id)
  let token1 = useCurrency(farm.pair.token1?.id)

  return (
    <React.Fragment>
      <Disclosure {...rest}>
        {({ open }) => (
          <div className="mb-4">
            <Disclosure.Button
              className={classNames(
                open && 'rounded-b-none',
                'w-full px-4 py-6 text-left rounded-xxl cursor-pointer select-none bg-dark-700  text-primary text-sm md:text-lg'
              )}
            >
              <div className="grid grid-cols-4 ">
                <div className="flex col-span-2 space-x-4 md:col-span-1">
                  {token1 ? (
                    <DoubleLogo currency0={token0} currency1={token1} size={isMobile ? 24 : 40} />
                  ) : (
                    <div className="flex items-center">
                      <CurrencyLogo currency={token0} size={isMobile ? 32 : 50} />
                    </div>
                  )}

                  <div className={`flex flex-col justify-center ${token1 ? 'md:flex-row' : ''}`}>
                    <div>
                      <span className="flex font-bold">{farm?.pair?.token0?.symbol}</span>
                      {token1 && <span className="flex font-bold">{farm?.pair?.token1?.symbol}</span>}
                      {!token1 && token0?.symbol == 'SOLAR' && (
                        <div className="flex flex-col">
                          <Link passHref href="/vaults">
                            <span className="text-emphasis underline hover:text-yellow">Use Vaults</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center font-bold">{formatNumberScale(farm.tvl, true, 2)}</div>
                <div className="flex-row items-center hidden space-x-4 md:flex">
                  <div className="flex items-center space-x-2">
                    {farm?.rewards?.map((reward, i) => (
                      <div key={i} className="flex items-center">
                        <Image
                          src={reward?.icon}
                          width={farm?.rewards?.length > 1 ? 40 : 50}
                          height={farm?.rewards?.length > 1 ? 40 : 50}
                          className="rounded-md"
                          layout="fixed"
                          alt={reward?.token}
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
                    {farm.royPerYear > 1000000 ? '100000000%+' : formatPercent(farm.roiPerYear * 100)}
                  </div>
                  <div className="text-xs text-right md:text-base text-secondary">{i18n._(t`annualized`)}</div>
                </div>
              </div>
            </Disclosure.Button>
            {open && <FarmListItemDetails farm={farm} />}
          </div>
        )}
      </Disclosure>
      {!!selectedFarm && (
        <YieldDetails
          key={farm.id}
          isOpen={selectedFarm == farm.id}
          onDismiss={() => setSelectedFarm(null)}
          token0={token0}
          token1={token1}
          roiPerYear={farm.roiPerYear}
        />
      )}
    </React.Fragment>
  )
}

export default FarmListItem
