import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency } from '../../sdk'
import React, { useContext } from 'react'
import { formatNumberScale, formatPercent } from '../../functions'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen } from '../../state/application/hooks'
import CurrencyLogo from '../CurrencyLogo'
import DoubleLogo from '../DoubleLogo'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import Typography from '../Typography'
import { PriceContext } from '../../contexts/priceContext'

interface YieldDetailsProps {
  isOpen: boolean
  onDismiss: () => void
  token0: Currency
  token1?: Currency
  roiPerYear: number
}

const YieldDetails: React.FC<YieldDetailsProps> = ({ isOpen, onDismiss, token0, token1, roiPerYear }) => {
  const priceData = useContext(PriceContext)

  const { i18n } = useLingui()

  const roiPerDay: number = roiPerYear / 365
  const roiPerWeek: number = roiPerDay * 7
  const roiPerMonth: number = roiPerYear / 12

  const perDay: number = Number((1000 * roiPerDay) / priceData?.solar)
  const perWeek: number = Number((1000 * roiPerWeek) / priceData?.solar)
  const perMonth: number = Number((1000 * roiPerMonth) / priceData?.solar)
  const perYear: number = Number((1000 * roiPerYear) / priceData?.solar)

  const getRoiEntry = (period: string, percent: number, value: Number) => {
    return (
      <div className="flex flex-row flex-nowrap gap-1 bg-dark-800 rounded py-2">
        <div className="flex flex-row px-2 w-full">
          <div className="flex items-center justify-between">{period}</div>
        </div>

        <div className="flex flex-row px-2 w-full">
          <div className="flex items-center justify-between">{formatPercent(percent * 100)}</div>
        </div>

        <div className="flex flex-row px-2 w-full">
          <div className="flex items-center justify-between">{formatNumberScale(value, false, 2)}</div>
        </div>
      </div>
    )
  }

  const getModalContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <ModalHeader title={i18n._(t`Pool Details`)} onClose={onDismiss} />
        <div className="grid grid-cols-2">
          <div className="flex flex-row w-full py-4 gap-2">
            <div className="flex col-span-1 space-x-4">
              {token1 ? (
                <DoubleLogo currency0={token0} currency1={token1} size={50} />
              ) : (
                <div className="flex items-center">
                  <CurrencyLogo currency={token0} size={50} />
                </div>
              )}
            </div>

            <div className="flex flex-col col-span-1 justify-center space-x-2">
              <div>
                <span className="font-bold text-2xl">{token0.symbol}</span>
                {token1 && <span className="font-bold text-2xl">{`/${token1.symbol}`}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 flex flex-col">
        <div className="flex flex-row flex-nowrap gap-1 font-bold">
          <div className="flex flex-row py-1 px-2 w-full">
            <div className="flex items-center justify-between uppercase">{i18n._(t`Timeframe`)}</div>
          </div>

          <div className="flex flex-row py-1 px-2 w-full">
            <div className="flex items-center justify-between uppercase">{i18n._(t`ROI`)}</div>
          </div>

          <div className="flex flex-row py-1 px-2 w-full">
            <div className="flex items-center justify-between uppercase">{i18n._(t`SOLAR per $1000`)}</div>
          </div>
        </div>
        {getRoiEntry('1d', roiPerDay, perDay)}
        {getRoiEntry('7d', roiPerWeek, perWeek)}
        {getRoiEntry('30d', roiPerMonth, perMonth)}
        {getRoiEntry('365d', roiPerYear, perYear)}
      </div>
      <div className="space-y-2">
        <div className="text-s">
          {i18n._(t`Calculated based on current rates. Rates are estimates provided for your convenience
          only, and by no means represent guaranteed returns.`)}
        </div>
      </div>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} minHeight={false}>
      {getModalContent()}
    </Modal>
  )
}

export default React.memo(YieldDetails)
