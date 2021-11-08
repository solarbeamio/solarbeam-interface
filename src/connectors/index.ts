import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '../sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from './NetworkConnector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

export const RPC = {
  [ChainId.MAINNET]: 'https://mainnet.infura.io/v3/249b95cec9c541bf94a4333cc77e9b71',
  [ChainId.BSC]: 'https://bsc-dataseed.binance.org/',
  [ChainId.MOONRIVER]: 'https://moonriver.api.onfinality.io/public',
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
  supportedChainIds: [
    1285,
  ],
})


export const bridgeInjected = new InjectedConnector({
  supportedChainIds: [
    1, // mainnet
    56, // binance smart chain
    1285, // moonriver
  ],
})


// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { [ChainId.MOONRIVER]: RPC[ChainId.MOONRIVER] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000,
})

