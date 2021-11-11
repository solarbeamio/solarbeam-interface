import Button, { ButtonProps } from '../Button'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'

import { Activity } from 'react-feather'
import React from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useRouter } from 'next/router'
import { classNames } from '../../functions'

const NetworkIcon = styled(Activity)`
  width: 16px;
  height: 16px;
`

export default function Web3Connect({ color = 'gray', size = 'sm', className = '', ...rest }: ButtonProps) {
  const { i18n } = useLingui()
  const toggleWalletModal = useWalletModalToggle()
  const { error } = useWeb3React()
  const { route } = useRouter()

  const SIZE = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-4 py-1.5',
    default: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-base',
    none: 'p-0 text-base',
    nobase: 'px-4 py-3',
  }

  return error ? (
    <div
      className={classNames(
        SIZE[size] +
          ' flex items-center w-full cursor-pointer justify-center font-normal text-white border rounded bg-opacity-80 border-dark-purple bg-dark-purple hover:bg-opacity-100',
        className
      )}
      onClick={toggleWalletModal}
    >
      <div className="mr-1">
        <NetworkIcon />
      </div>
      {error instanceof UnsupportedChainIdError ? i18n._(t`You are on the wrong network`) : i18n._(t`Error`)}
    </div>
  ) : (
    <Button
      id="connect-wallet"
      onClick={toggleWalletModal}
      variant="outlined"
      color={color}
      className={className}
      size={size}
      {...rest}
    >
      {i18n._(t`Connect to a wallet`)}
    </Button>
  )
}
