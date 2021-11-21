import React, { useCallback, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import Card from '../Card'
import Logo from '../Logo'
import { Chain } from '../../sdk/entities/Chain'
import ChainModal from '../../modals/ChainModal'

interface ChainSelectProps {
  availableChains: number[]
  label: string
  onChainSelect?: (chain: Chain) => void
  chain?: Chain | null
  otherChain?: Chain | null
  switchOnSelect?: boolean
}

export default function ChainSelect({
  availableChains,
  label,
  onChainSelect,
  chain,
  switchOnSelect,
}: ChainSelectProps) {
  const { i18n } = useLingui()
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <button
      className={'flex-1 justify-center'}
      onClick={() => {
        setModalOpen(true)
      }}
    >
      <Card
        className={
          'hover:bg-dark-700 cursor-pointer h-full outline-none select-none cursor-pointer border-none text-xl font-medium items-center'
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
        switchOnSelect={switchOnSelect}
        availableChains={availableChains}
        onSelect={onChainSelect}
        title={`Bridge ${label}`}
        chain={chain}
        isOpen={modalOpen}
        onDismiss={handleDismissSearch}
      />
    </button>
  )
}
