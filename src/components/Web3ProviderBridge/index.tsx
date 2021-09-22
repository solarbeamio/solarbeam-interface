import { BridgeContextName } from '../../constants'
import { createWeb3ReactRoot } from '@web3-react/core'

const Web3ReactRoot = createWeb3ReactRoot(BridgeContextName)

function Web3ProviderBridge({ children, getLibrary }) {
  return <Web3ReactRoot getLibrary={getLibrary}>{children}</Web3ReactRoot>
}

export default Web3ProviderBridge
