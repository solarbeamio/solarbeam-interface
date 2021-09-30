import { Currency, CurrencyAmount, Pair, Percent, Token } from '../../sdk'
import React, { ReactNode, useCallback, useState } from 'react'
import { classNames, formatCurrencyAmount, formatNumber, formatNumberScale } from '../../functions'

import Button from '../Button'
import { ChevronDownIcon } from '@heroicons/react/outline'
import CurrencyLogo from '../CurrencyLogo'
import CurrencySearchModal from '../../modals/SearchModal/CurrencySearchModal'
import DoubleCurrencyLogo from '../DoubleLogo'
import { FiatValue } from './FiatValue'
import Lottie from 'lottie-react'
import { Input as NumericalInput } from '../NumericalInput'
import selectCoinAnimation from '../../animation/select-coin.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useLingui } from '@lingui/react'

interface CurrencyInputPanelProps {
  value?: string
  onUserInput?: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue?: CurrencyAmount<Token> | null
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  customBalanceText?: string
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  otherCurrency,
  id,
  showCommonBases,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  customBalanceText,
}: CurrencyInputPanelProps) {
  const { i18n } = useLingui()
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  //   <div className="flex flex-col">

  //   <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
  // </div>

  return (
    <div id={id} className={classNames(hideInput ? 'py-4' : 'py-5', 'rounded')}>
      <div className={'flex justify-between mb-1'}>
        {label && <div className="text-xs font-medium text-secondary whitespace-nowrap ">{label}</div>}
        {!hideBalance && currency && selectedCurrencyBalance ? (
          <div onClick={onMax} className="text-xxs font-medium text-right cursor-pointer text-low-emphesis">
            {renderBalance ? (
              renderBalance(selectedCurrencyBalance)
            ) : (
              <>
                {i18n._(t`Balance:`)} {formatNumberScale(selectedCurrencyBalance.toSignificant(4))} {currency.symbol}
              </>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row  rounded bg-dark-800">
        {!hideInput && (
          <div
            className={classNames(
              'flex items-center w-full space-x-3 rounded bg-dark-800 focus:bg-dark-700 p-3 divide-solid border-r-1'
              // showMaxButton && selectedCurrencyBalance && 'px-3'
            )}
          >
            <>
              <NumericalInput
                id="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
              {showMaxButton && selectedCurrencyBalance && (
                <Button
                  onClick={onMax}
                  size="xs"
                  className="text-xxs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap"
                >
                  {i18n._(t`Max`)}
                </Button>
              )}
            </>
          </div>
        )}
        <div>
          <button
            type="button"
            className={classNames(
              !!currency ? 'text-primary' : 'text-high-emphesis',
              'w-[150px] m-auto open-currency-select-button h-full outline-none select-none cursor-pointer border-none text-xl font-medium items-center'
            )}
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <div className="flex border-l-2 space-between items-center border-dark-900 px-3">
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
              ) : currency ? (
                <div className="flex items-center">
                  <CurrencyLogo currency={currency} size={'24px'} />
                </div>
              ) : (
                <div className="rounded bg-dark-700" style={{ maxWidth: 24, maxHeight: 24 }}>
                  <div style={{ width: 24, height: 24 }}>
                    <Lottie animationData={selectCoinAnimation} autoplay loop />
                  </div>
                </div>
              )}
              {pair ? (
                <span
                  className={classNames(
                    'pair-name-container',
                    Boolean(currency && currency.symbol) ? 'text-md' : 'text-xs'
                  )}
                >
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </span>
              ) : (
                <div className="flex flex-1 flex-col items-start justify-center mx-3.5">
                  <div className="flex flex-1 items-center">
                    <div className="text-sm font-bold token-symbol-container md:text-md">
                      {(currency && currency.symbol && currency.symbol.length > 20
                        ? currency.symbol.slice(0, 4) +
                          '...' +
                          currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                        : currency?.symbol) || (
                        <div className="px-2 py-1 mt-1 text-xs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap ">
                          {i18n._(t`Select a token`)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!disableCurrencySelect && currency && (
                <ChevronDownIcon width={16} height={16} className="ml-2 stroke-current" />
              )}
            </div>
          </button>
        </div>
      </div>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </div>
  )
}
