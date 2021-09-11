/* eslint-disable @next/next/link-passhref */

import Head from 'next/head'
import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { formatNumberScale } from '../../functions'
import Button, { ButtonError } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import DoubleGlowShadow from '../../components/DoubleGlowShadow'
import SolarbeamLogo from '../../components/SolarbeamLogo'
import Container from '../../components/Container'
import Typography from '../../components/Typography'
import { i18n } from '@lingui/core'
import Image from '../../components/Image'
import { useActiveWeb3React } from '../../hooks'
import Web3Connect from '../../components/Web3Connect'
import { Loader } from 'react-feather'

export default function Faucet(): JSX.Element {
  const { chainId, account, library } = useActiveWeb3React()
  return (
    <>
      <Head>
        <title>Faucet | Solarbeam</title>
        <meta key="description" name="description" content="Moonriver Faucet" />
      </Head>

      <SolarbeamLogo />
      <Container maxWidth="2xl" className="space-y-6">
        <DoubleGlowShadow>
          <div className="p-4 space-y-4 rounded bg-dark-900" style={{ zIndex: 1 }}>
            <div className="p-4 mb-3 space-y-3 text-center">
              <Typography component="h1" variant="h2">
                {i18n._(t`Moonriver Faucet`)}
              </Typography>
              <Typography component="h1" variant="base">
                A Faucet is a tool that provides a small amount of MOVR to start using Solarbeam.io without having to
                buy MOVR somewhere else.
              </Typography>
            </div>
            <div className="flex flex-1 justify-center text-center items-center mt-8 mb-12">
              <Image src="/images/faucet/moonriver-faucet.png" alt="Solarbeam" width={150} height={150} />
            </div>
            <div className="p-4 mb-3 space-y-3 text-center">
              <Typography component="h1" variant="base">
                Faucet balance: 0.1 MOVR
              </Typography>
            </div>
            <AutoColumn gap={'md'}>
              <div className={'flex items-center w-full'}>
                {!account ? (
                  <Web3Connect size="lg" color="gradient" className="w-full" />
                ) : (
                  <ButtonError
                    className="font-bold text-light"
                    onClick={() => {}}
                    style={{
                      width: '100%',
                    }}
                    disabled={false}
                  >
                    {false ? (
                      <div className={'p-2'}>
                        <AutoRow gap="6px" justify="center">
                          Locking <Loader stroke="white" />
                        </AutoRow>
                      </div>
                    ) : (
                      i18n._(t`Send me some MOVR`)
                    )}
                  </ButtonError>
                )}
              </div>
            </AutoColumn>
          </div>
        </DoubleGlowShadow>
      </Container>
    </>
  )
}
