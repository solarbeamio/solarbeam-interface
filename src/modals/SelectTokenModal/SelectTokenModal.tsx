import { AbstractCurrency, Currency, Token } from '../../sdk'
import React, { useCallback } from 'react'

import CurrencyModalView from './CurrencyModalView'
import { TokenList } from './TokenList'
import Modal from '../../components/Modal'

interface SelectTokenModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  tokenList?: Currency[]
}

function SelectTokenModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  tokenList
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
        onDismiss={onDismiss}
        onCurrencySelect={handleCurrencySelect}
        selectedCurrency={selectedCurrency}
        tokenList={tokenList}
      />
    </Modal>
  )
}

SelectTokenModal.whyDidYouRender = true

export default SelectTokenModal
