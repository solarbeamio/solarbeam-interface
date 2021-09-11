import { Currency, Token } from '../../sdk'
import React, { useCallback } from 'react'

import CurrencyModalView from './CurrencyModalView'
import { TokenList } from './TokenList'
import Modal from '../../components/Modal'

interface SelectTokenModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  currencyList?: string[]
  includeNativeCurrency?: boolean
  allowManageTokenList?: boolean
}

function SelectTokenModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  currencyList,
  showCommonBases = false,
  includeNativeCurrency = true,
  allowManageTokenList = true,
}: SelectTokenModalProps) {
  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={80} padding={1}>
      <TokenList
        isOpen={isOpen}
        onDismiss={onDismiss}
        onCurrencySelect={handleCurrencySelect}
        selectedCurrency={selectedCurrency}
        otherSelectedCurrency={otherSelectedCurrency}
        showCommonBases={showCommonBases}
        showImportView={null}
        setImportToken={null}
        showManageView={null}
        currencyList={currencyList}
        includeNativeCurrency={includeNativeCurrency}
        allowManageTokenList={allowManageTokenList}
      />
    </Modal>
  )
}

SelectTokenModal.whyDidYouRender = true

export default SelectTokenModal
