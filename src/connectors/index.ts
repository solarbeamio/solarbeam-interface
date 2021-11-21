import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '../sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from './NetworkConnector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

export const RPC = {
  [ChainId.MAINNET]: 'https://mainnet.infura.io/v3/249b95cec9c541bf94a4333cc77e9b71',
  [ChainId.BSC]: 'https://bsc-dataseed.binance.org/',
  [ChainId.MOONRIVER]: 'https://moonriver.api.onfinality.io/public',
  [ChainId.AVALANCHE]: 'https://api.avax.network/ext/bc/C/rpc',
  [ChainId.FANTOM]: 'https://rpcapi.fantom.network',
  [ChainId.MATIC]: 'https://rpc-mainnet.maticvigil.com/',
}

export const network = new NetworkConnector({
  defaultChainId: 1285,
  urls: RPC,
})

let networkLibrary: Web3Provider | undefined

export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
  supportedChainIds: [ChainId.MOONRIVER],
})

export const bridgeInjected = new InjectedConnector({
  supportedChainIds: [
    ChainId.MAINNET,
    ChainId.BSC,
    ChainId.MOONRIVER,
    ChainId.HECO,
    ChainId.ARBITRUM,
    ChainId.AVALANCHE,
    ChainId.FANTOM,
    ChainId.MATIC,
  ],
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { [ChainId.MOONRIVER]: RPC[ChainId.MOONRIVER] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
})
