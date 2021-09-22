import { Currency, TradeType, Trade as V2Trade } from '../../sdk'
import React, { ReactNode, useMemo } from 'react'

import { ButtonError } from '../../components/Button'
import { SwapCallbackError } from './styleds'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { warningSeverity } from '../../functions'
import { useExpertModeManager } from '../../state/user/hooks'

export default function SwapModalFooter({
  trade,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade: V2Trade<Currency, Currency, TradeType>
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
}) {
  const { i18n } = useLingui()
  const [isExpertMode] = useExpertModeManager()
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact
    return warningSeverity(executionPriceImpact)
  }, [trade])

  return (
    <div className="p-6 mt-0 -m-5 rounded bg-dark-800">
      {/* <div className="grid gap-1 pb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">{i18n._(t`Price`)}</div>
          <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
            {formatExecutionPrice(trade, showInverted, chainId)}
            <StyledBalanceMaxMini
              onClick={() => setShowInverted(!showInverted)}
            >
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">
            {trade.tradeType === TradeType.EXACT_INPUT
              ? i18n._(t`Minimum received`)
              : i18n._(t`Maximum sold`)}
            <QuestionHelper
              text={i18n._(
                t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
              )}
            />
          </div>
          <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
            {trade.tradeType === TradeType.EXACT_INPUT
              ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? "-"
              : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? "-"}
            <span className="ml-1">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">
            <div className="text-sm">
              {i18n._(t`Price Impact`)}
              <QuestionHelper
                text={i18n._(
                  t`The difference between the market price and your price due to trade size.`
                )}
              />
            </div>
          </div>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">
            <div className="text-sm">{i18n._(t`Liquidity Provider Fee`)}</div>
          </div>
          <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
            {realizedLPFee
              ? realizedLPFee?.toSignificant(6) +
                " " +
                trade.inputAmount.currency.symbol
              : "-"}
          </div>
        </div>
        {archerETHTip && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">
              <div className="text-sm">{i18n._(t`Miner Tip`)}</div>
            </div>
            <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
              {Ether.fromRawAmount(archerETHTip).toFixed(4)} ETH
            </div>
          </div>
        )}
      </div> */}

      <ButtonError
        className="text-lg font-medium"
        onClick={onConfirm}
        style={{
          width: '100%',
        }}
        id="confirm-swap-or-send"
        disabled={disabledConfirm || (priceImpactSeverity > 3 && !isExpertMode)}
        error={priceImpactSeverity > 2}
      >
        {priceImpactSeverity > 3 && !isExpertMode
          ? i18n._(t`Price Impact Too High`)
          : priceImpactSeverity > 2
          ? i18n._(t`Swap Anyway`)
          : i18n._(t`Confirm Swap`)}
      </ButtonError>

      {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </div>
  )
}
