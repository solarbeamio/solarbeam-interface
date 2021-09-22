import React, { useCallback, useMemo } from 'react'

import { Currency, Price, Trade as V2Trade, TradeType } from '../../sdk'
import Typography from '../../components/Typography'
import { classNames, computeRealizedLPFeePercent, formatNumberScale } from '../../functions'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import QuestionHelper from '../../components/QuestionHelper'
import FormattedPriceImpact from './FormattedPriceImpact'

interface TradePriceProps {
  price: Price<Currency, Currency>
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
  className?: string
  trade?: V2Trade<Currency, Currency, TradeType>
}

export default function TradePrice({ price, showInverted, setShowInverted, className, trade }: TradePriceProps) {
  const { i18n } = useLingui()

  let formattedPrice: string

  try {
    formattedPrice = showInverted
      ? formatNumberScale(price.toSignificant(4))
      : formatNumberScale(price.invert()?.toSignificant(4))
  } catch (error) {
    formattedPrice = '0'
  }

  const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `

  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`

  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`

  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined }

    const realizedLpFeePercent = computeRealizedLPFeePercent(trade)
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent)

    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent)

    return { priceImpact, realizedLPFee }
  }, [trade])

  return (
    <div>
      <div
        onClick={flipPrice}
        title={text}
        className={classNames(
          'flex justify-between cursor-pointer w-full px-5 py-2 cursor-pointer text-secondary hover:text-primary',
          className
        )}
      >
        <Typography variant="sm" className="select-none">
          {i18n._(t`Exchange Rate`)}
        </Typography>
        <div className="flex items-center space-x-4">
          <Typography variant="sm" className="select-none">
            {text}
          </Typography>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
      </div>

      <div className={classNames('flex justify-between w-full px-5 py-2 rounded-b-md text-secondary', className)}>
        <Typography variant="sm" className="select-none">
          {i18n._(t`Price Impact`)}
          <QuestionHelper
            text={i18n._(t`The difference between the market price and estimated price due to trade size.`)}
          />
        </Typography>
        <Typography variant="sm" className="select-none">
          <FormattedPriceImpact priceImpact={priceImpact} />
        </Typography>
      </div>
    </div>
  )
}
