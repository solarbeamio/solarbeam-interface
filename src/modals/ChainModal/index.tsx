import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { bridgeInjected } from '../../connectors'

import { BridgeContextName } from '../../constants'
import { Chain } from '../../sdk/entities/Chain'
import { ChainId } from '../../sdk'
import Image from 'next/image'
import Modal from '../../components/Modal'
import ModalHeader from '../../components/ModalHeader'
import React from 'react'
import cookie from 'cookie-cutter'
import { useWeb3React } from '@web3-react/core'

export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.com'],
  },
  [ChainId.BSC]: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  [ChainId.MOONRIVER]: {
    chainId: '0x505',
    chainName: 'Moonriver',
    nativeCurrency: {
      name: 'Moonriver',
      symbol: 'MOVR',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.moonriver.moonbeam.network', 'https://moonriver.api.onfinality.io/public'],
    blockExplorerUrls: ['https://moonriver.moonscan.io/'],
  },
  [ChainId.AVALANCHE]: {
    chainId: '0xa86a',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io/'],
  },
  [ChainId.FANTOM]: {
    chainId: '0xFA',
    chainName: 'Fantom',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'Fantom',
      decimals: 18,
    },
    rpcUrls: ['https://rpcapi.fantom.network'],
    blockExplorerUrls: ['https://ftmscan.com/'],
  },
  [ChainId.MATIC]: {
    chainId: '0x89',
    chainName: 'Matic',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
}

interface ChainModalProps {
  availableChains: number[]
  title?: string
  chain?: Chain
  isOpen: boolean
  onDismiss: () => void
  onSelect: (chain: Chain) => void
  switchOnSelect: boolean
}

export default function ChainModal({
  availableChains,
  title,
  chain,
  isOpen,
  onDismiss,
  onSelect,
  switchOnSelect,
}: ChainModalProps): JSX.Element | null {
  const { chainId, library, account, activate } = useWeb3React(BridgeContextName)

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxWidth={400}>
      <ModalHeader onClose={onDismiss} title={title} />
      <div className="grid grid-flow-row-dense grid-cols-1 gap-3 overflow-y-auto mt-4">
        {availableChains.map((key: ChainId, i: number) => {
          if (chain.id === key) {
            return (
              <button key={i} className="w-full col-span-1 p-px rounded bg-gradient-to-r from-yellow to-yellow">
                <div className="flex items-center w-full h-full p-3 space-x-3 rounded bg-dark-1000">
                  <Image
                    src={NETWORK_ICON[key]}
                    alt={`Select ${NETWORK_LABEL[key]} Network`}
                    className="rounded-md"
                    width="32px"
                    height="32px"
                  />
                  <div className="font-bold text-primary">{NETWORK_LABEL[key]}</div>
                </div>
              </button>
            )
          }
          return (
            <button
              key={i}
              onClick={() => {
                onSelect({ id: key, icon: NETWORK_ICON[key], name: NETWORK_LABEL[key] })
                onDismiss()
                if (switchOnSelect) {
                  activate(bridgeInjected)
                  const params = SUPPORTED_NETWORKS[key]
                  cookie.set('chainId', key)
                  if (key === ChainId.MAINNET) {
                    library?.send('wallet_switchEthereumChain', [{ chainId: '0x1' }, account])
                  } else {
                    library?.send('wallet_addEthereumChain', [params, account])
                  }
                }
              }}
              className="flex items-center w-full col-span-1 p-3 space-x-3 rounded cursor-pointer bg-dark-800 hover:bg-dark-900"
            >
              <Image src={NETWORK_ICON[key]} alt="Switch Network" className="rounded-md" width="32px" height="32px" />
              <div className="font-bold text-primary">{NETWORK_LABEL[key]}</div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
