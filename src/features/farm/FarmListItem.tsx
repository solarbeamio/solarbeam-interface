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
import QuestionHelper from '../../components/QuestionHelper'
import { Info } from 'react-feather'
import Link from 'next/link'

const FarmListItem = ({ farm, ...rest }) => {
  const { i18n } = useLingui()

  const [selectedFarm, setSelectedFarm] = useState<string>(null)

  const token0 = useCurrency(farm.pair.token0?.id)
  const token1 = useCurrency(farm.pair.token1?.id)

  const rewardsWithAmount = farm?.rewards?.filter((r) => r.rewardPerDay > 0)

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
                    {rewardsWithAmount?.map((reward, i) => (
                      <div key={i} className="flex items-center">
                        <Image
                          src={reward?.icon}
                          width={rewardsWithAmount?.length > 1 ? 40 : 50}
                          height={rewardsWithAmount?.length > 1 ? 40 : 50}
                          className="rounded-md"
                          layout="fixed"
                          alt={reward?.token}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-1">
                    {rewardsWithAmount?.map((reward, i) => (
                      <div key={i} className="text-xs md:text-sm whitespace-nowrap">
                        {formatNumber(reward.rewardPerDay)} {reward.token} {i18n._(t`/ DAY`)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <div className="font-bold flex justify items-center text-righttext-high-emphesis">
                    {!!farm?.feeAprPerYear && (
                      <IconWrapper size="16px" marginRight={'0.5rem'}>
                        <QuestionHelper
                          text={
                            <div className="flex flex-col right-align justify-end items-end">
                              <div className="flex right-align">
                                Rewards APR:{' '}
                                {farm?.tvl !== 0
                                  ? farm?.rewardAprPerYear > 10000
                                    ? '>10,000%'
                                    : formatPercent(farm?.rewardAprPerYear * 100)
                                  : 'Infinite'}
                              </div>
                              <div className="flex right-align">
                                Fees APR:{' '}
                                {farm?.feeAprPerYear < 10000 ? formatPercent(farm?.feeAprPerYear * 100) : '>10,000%'}
                              </div>
                            </div>
                          }
                        />
                      </IconWrapper>
                    )}
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
      {/* {!!selectedFarm && (
        <YieldDetails
          key={farm.id}
          isOpen={selectedFarm == farm.id}
          onDismiss={() => setSelectedFarm(null)}
          token0={token0}
          token1={token1}
          roiPerYear={farm.roiPerYear}
        />
      )} */}
    </React.Fragment>
  )
}

export default FarmListItem
