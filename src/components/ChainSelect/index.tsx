import { Currency, CurrencyAmount, Token } from '../../sdk'
import React, { ReactNode, useCallback, useState } from 'react'
import { classNames, formatNumberScale } from '../../functions'
import Button from '../Button'
import { ChevronDownIcon } from '@heroicons/react/outline'
import CurrencyLogo from '../CurrencyLogo'
import CurrencySearchModal from '../../modals/SearchModal/CurrencySearchModal'
import Lottie from 'lottie-react'
import { Input as NumericalInput } from '../NumericalInput'
import selectCoinAnimation from '../../animation/select-coin.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useLingui } from '@lingui/react'
import Card from '../Card'
import Logo from '../Logo'
import { Chain } from '../../sdk/entities/Chain'
import { useChainModalToggle } from '../../state/application/hooks'
import ChainModal from '../../modals/ChainModal'

interface ChainSelectProps {
  label: string
  onChainSelect?: (chain: Chain) => void
  chain?: Chain | null
  otherChain?: Chain | null
}

export default function ChainSelect({ label, onChainSelect, chain, otherChain }: ChainSelectProps) {
  const { i18n } = useLingui()
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <button
      className={'flex-1'}
      onClick={() => {
        setModalOpen(true)
      }}
    >
      <Card
        className={
          'hover:bg-dark-800 cursor-pointer h-full outline-none select-none cursor-pointer border-none text-xl font-medium items-center'
        }
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center">
            <Logo srcs={[chain?.icon]} width={'54px'} height={'54px'} alt={chain?.name} />
          </div>
          <div className="flex flex-1 flex-row items-start justify-center mt-4">
            <div className="text-sm">{i18n._(t`${label}`)}</div>
          </div>
          <div className="flex flex-1 flex-row items-start justify-center mx-3.5 mt-2">
            <div className="flex items-center">
              <div className="text-lg font-bold token-symbol-container md:text-2xl">{chain?.name}</div>
              <ChevronDownIcon width={16} height={16} className="ml-2 stroke-current" />
            </div>
          </div>
        </div>
      </Card>
      <ChainModal
        onSelect={onChainSelect}
        title={`Bridge ${label}`}
        chain={chain}
        isOpen={modalOpen}
        onDismiss={handleDismissSearch}
      />
      {/* {onChainSelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={null}
          selectedCurrency={null}
          showCommonBases={false}
        />
      )} */}
    </button>
  )
}
