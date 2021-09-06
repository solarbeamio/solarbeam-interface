import { classNames, formatNumber, formatPercent } from '../../functions'

import { Disclosure } from '@headlessui/react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import DoubleLogo from '../../components/DoubleLogo'
import FarmListItemDetails from './FarmListItemDetails'
import Image from '../../components/Image'
import { PairType } from './enum'
import React from 'react'
import { useCurrency } from '../../hooks/Tokens'
import Button from '../../components/Button'

const FarmListItem = ({ farm, ...rest }) => {
  const token0 = useCurrency(farm.pair.token0.id)
  const token1 = useCurrency(farm.pair.token1.id)
  const { i18n } = useLingui()

  return (
    <Disclosure {...rest}>
      {({ open }) => (
        <>
          <Disclosure.Panel
            className={classNames(
              open && 'rounded-b-none',
              'px-6 py-6 flex flex-col w-full text-left rounded bg-dark-900 text-primary text-sm md:text-lg'
            )}
            static
          >
            <div className="grid grid-cols-1 space-y-3">
              <div className="flex items-center justify-between	space-x-4">
                <DoubleLogo currency0={token0} currency1={token1} size={50} />
                <div className="flex text-right flex-col justify-end">
                  <div>
                    <span className="font-bold">{farm?.pair?.token0?.symbol}</span>/
                    <span className={farm?.pair?.type === PairType.KASHI ? 'font-thin' : 'font-bold'}>
                      {farm?.pair?.token1?.symbol}
                    </span>
                  </div>
                  {farm?.pair?.type === PairType.SWAP && (
                    <div className="text-xs md:text-base text-secondary">Solarbeam LP</div>
                  )}
                  {farm?.pair?.type === PairType.KASHI && (
                    <div className="text-xs md:text-base text-secondary">Kashi Farm</div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between	col-span-2 space-x-4 ">
                  <div className="text-xs text-right md:text-base text-secondary">Earn</div>
                  <div className="flex flex-col justify-center">
                    <div className="font-bold text-righttext-high-emphesis">SOLAR</div>
                  </div>
                </div>
                <div className="flex items-center justify-between	col-span-2 space-x-4">
                  <div className="text-xs text-right md:text-base text-secondary">APY</div>
                  <div className="flex flex-col justify-center">
                    <div className="font-bold text-righttext-high-emphesis">
                      {formatPercent(farm?.roiPerYear * 100)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between	col-span-2 space-x-4">
                  <div className="text-xs text-right md:text-base text-secondary">TVL</div>
                  <div className="flex flex-col justify-center">
                    <div className="font-bold text-righttext-high-emphesis">{formatNumber(farm.tvl, true)}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs md:text-base text-transparent bg-clip-text bg-gradient-to-r from-yellow to-yellow">
                  SOLAR earned
                </div>
                <div className="flex items-center justify-between	 col-span-2 space-x-4">
                  <div className="flex flex-col justify-center">
                    <div className="font-bold text-righttext-high-emphesis">0.0</div>
                  </div>
                  <div className="flex text-right flex-col justify-end">
                    <Button
                      size="sm"
                      variant="outlined"
                      color="gradient"
                      disabled
                      onClick={async () => {
                        // setPendingTx(true)
                        // try {
                        //   const tx = await harvest(farm.id)
                        //   addTransaction(tx, {
                        //     summary: `Harvest ${farm.pair.name}`,
                        //   })
                        // } catch (error) {
                        //   console.error(error)
                        // }
                        // setPendingTx(false)
                      }}
                    >
                      {i18n._(t`Harvest`)}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs md:text-base text-transparent bg-clip-text bg-gradient-to-r from-yellow to-yellow">
                  {farm?.pair?.token0?.symbol}/{farm?.pair?.token1?.symbol} LP Staked
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    className="w-full"
                    variant="filled"
                    color="gray"
                    disabled
                    onClick={async () => {
                      // setPendingTx(true)
                      // try {
                      //   const tx = await harvest(farm.id)
                      //   addTransaction(tx, {
                      //     summary: `Harvest ${farm.pair.name}`,
                      //   })
                      // } catch (error) {
                      //   console.error(error)
                      // }
                      // setPendingTx(false)
                    }}
                  >
                    {i18n._(t`Connect Wallet`)}
                  </Button>
                </div>
              </div>

              {/* <div className="flex-row items-center hidden space-x-4 md:flex">
                <div className="flex items-center space-x-2">
                  {farm?.rewards?.map((reward, i) => (
                    <div key={i} className="flex items-center">
                      <Image
                        src={reward.icon}
                        width="30px"
                        height="30px"
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
                      {formatNumber(reward.rewardPerDay)} {reward.token} / DAY
                    </div>
                  ))}
                </div>
              </div> */}

              {/* <div className="flex flex-col items-center font-bold">{`TVL ${formatNumber(farm.tvl, true)}`}</div> */}
            </div>
          </Disclosure.Panel>

          {open && <FarmListItemDetails farm={farm} />}
        </>
      )}
    </Disclosure>
  )
}

export default FarmListItem
