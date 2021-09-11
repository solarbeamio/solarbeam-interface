import { Currency, CurrencyAmount, Token } from '../../sdk'
import React, { ReactNode, useCallback, useState } from 'react'
import { classNames, formatNumberScale } from '../../functions'
import Button from '../Button'
import { ChevronDownIcon } from '@heroicons/react/outline'
import CurrencyLogo from '../CurrencyLogo'
import CurrencySearchModal from '../../modals/SearchModal/CurrencySearchModal'
import { FiatValue } from './FiatValue'
import Lottie from 'lottie-react'
import { Input as NumericalInput } from '../NumericalInput'
import selectCoinAnimation from '../../animation/select-coin.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useLingui } from '@lingui/react'
import { Chain, DEFAULT_CHAIN_FROM, DEFAULT_CHAIN_TO } from '../../sdk/entities/Chain'
import SelectTokenModal from '../../modals/SelectTokenModal/SelectTokenModal'

interface CurrencyInputPanelProps {
  value?: string
  onUserInput?: (value: string) => void
  onMax?: () => void
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  fiatValue?: CurrencyAmount<Token> | null
  chainFrom?: Chain | null
  chainTo?: Chain | null
}

export default function DualChainCurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  label = 'Input',
  onCurrencySelect,
  currency,
  fiatValue,
  chainFrom,
  chainTo,
}: CurrencyInputPanelProps) {
  const { i18n } = useLingui()
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      <div className={classNames('p-5 rounded rounded-b-none bg-dark-800')}>
        <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
          <div className={classNames('w-full sm:w-72')}>
            <button
              type="button"
              className={classNames(
                !!currency ? 'text-primary' : 'text-high-emphesis',
                'open-currency-select-button h-full outline-none select-none cursor-pointer border-none text-xl font-medium items-center'
              )}
              onClick={() => {
                if (onCurrencySelect) {
                  setModalOpen(true)
                }
              }}
            >
              <div className="flex">
                {currency ? (
                  <div className="flex items-center">
                    <CurrencyLogo currency={currency} size={'54px'} />
                  </div>
                ) : (
                  <div className="rounded bg-dark-700" style={{ maxWidth: 54, maxHeight: 54 }}>
                    <div style={{ width: 54, height: 54 }}>
                      <Lottie animationData={selectCoinAnimation} autoplay loop />
                    </div>
                  </div>
                )}
                <div className="flex flex-1 flex-col items-start justify-center mx-3.5">
                  {label && <div className="text-xs font-medium text-secondary whitespace-nowrap">{label}</div>}
                  <div className="flex items-center">
                    <div className="text-lg font-bold token-symbol-container md:text-2xl">
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
                    {currency && <ChevronDownIcon width={16} height={16} className="ml-2 stroke-current" />}
                  </div>
                </div>
              </div>
            </button>
          </div>
          <div className={classNames('flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3')}>
            <>
              {selectedCurrencyBalance && (
                <Button
                  onClick={onMax}
                  size="xs"
                  className="text-xxs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap"
                >
                  {i18n._(t`Max`)}
                </Button>
              )}
              <NumericalInput
                id="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
              {currency && selectedCurrencyBalance ? (
                <div className="flex flex-col">
                  <div onClick={onMax} className="text-xxs font-medium text-right cursor-pointer text-low-emphesis">
                    <>
                      {i18n._(t`Balance:`)} {formatNumberScale(selectedCurrencyBalance.toSignificant(4))}{' '}
                      {currency.symbol}
                    </>
                  </div>
                  <FiatValue fiatValue={fiatValue} />
                </div>
              ) : null}
            </>
          </div>
        </div>
      </div>
      <div
        className={classNames(
          'flex items-center w-full rounded rounded-t-none border border-dark-800 bg-dark-900 px-0 py-2 !mt-0'
        )}
      >
        <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
          <div className={classNames('w-full sm:w-96 text-right px-3')}>
            <div className="text-xs font-medium text-secondary whitespace-nowrap">Balance on {chainTo?.name}:</div>
          </div>
          <div className={classNames('flex items-center w-full px-0')}>
            <div className="text-xs font-medium text-secondary whitespace-nowrap">0</div>
          </div>
        </div>
      </div>
      {onCurrencySelect && (
        <SelectTokenModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          showCommonBases={false}
        />
      )}
    </>
  )
}
