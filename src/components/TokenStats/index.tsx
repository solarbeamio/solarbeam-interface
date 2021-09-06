import React, { useContext } from 'react'
import Image from 'next/image'
import { formatNumberScale } from '../../functions/format'
import { useTokenStatsModalToggle } from '../../state/application/hooks'
import { useWeb3React } from '@web3-react/core'
import TokenStatsModal from '../../modals/TokenStatsModal'
import { ChainId } from '../../sdk'
import PriceContext from '../../contexts/priceContext'

const supportedTokens = {
  MOVR: {
    name: 'Moonriver',
    symbol: 'MOVR',
    icon: '/images/tokens/movr.png',
  },
  SOLAR: {
    name: 'Solarbeam Token',
    symbol: 'SOLAR',
    icon: '/images/tokens/solar.png',
    address: {
      [ChainId.MOONRIVER]: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B'
    }
  },
}

interface TokenStatsProps {
  token: string
}

function TokenStatusInner({ token }) {
  const { account } = useWeb3React()

  const toggleModal = useTokenStatsModalToggle()

  const priceData = useContext(PriceContext)

  return (
    <div className="flex pl-2" onClick={toggleModal}>
      {token.icon && (
        <Image
          src={token['icon']}
          alt={token['symbol']}
          width="24px"
          height="24px"
          objectFit="contain"
          className="rounded-md"
        />
      )}
      <div className="px-3 py-2 text-primary text-bold">
        {formatNumberScale(priceData?.data?.[token.symbol.toLowerCase()], true, 2)}
      </div>
    </div>
  )
}

export default function TokenStats({ token, ...rest }: TokenStatsProps) {
  const selectedToken = supportedTokens[token]

  return (
    <>
      <TokenStatusInner token={selectedToken} />
      {token == 'SOLAR' && <TokenStatsModal token={selectedToken} />}
    </>
  )
}
