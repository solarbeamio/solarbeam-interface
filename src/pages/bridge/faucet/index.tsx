/* eslint-disable @next/next/link-passhref */

import Head from 'next/head'
import React, { useCallback, useState } from 'react'
import { t } from '@lingui/macro'
import { formatNumberScale } from '../../../functions'
import { ButtonError } from '../../../components/Button'
import { AutoColumn } from '../../../components/Column'
import { AutoRow } from '../../../components/Row'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import SolarbeamLogo from '../../../components/SolarbeamLogo'
import Container from '../../../components/Container'
import Typography from '../../../components/Typography'
import { i18n } from '@lingui/core'
import Image from '../../../components/Image'
import { useActiveWeb3React } from '../../../hooks'
import Web3Connect from '../../../components/Web3Connect'
import { Loader } from 'react-feather'
import { useETHBalances } from '../../../state/wallet/hooks'
import axios from 'axios'
import ReCAPTCHA from 'react-google-recaptcha'
import { FAUCET_ADDRESS } from '../../../constants'
import NavLink from '../../../components/NavLink'

export default function Faucet(): JSX.Element {
  const { chainId, account, library } = useActiveWeb3React()
  const [token, setToken] = useState('')
  const tokenBalance = useETHBalances([FAUCET_ADDRESS])
  const [pendingTx, setPendingTx] = useState(false)
  const [requested, setRequested] = useState(false)
  const [faucetResult, setFaucetResult] = useState({ status: 200, message: null })
  const recaptchaRef: any = React.createRef()

  const onReCAPTCHAChange = async (captchaCode) => {
    if (!captchaCode) {
      return
    }

    setPendingTx(true)

    try {
      const faucetResponse = await axios.post('/api/faucet', { address: account, 'g-recaptcha-response': captchaCode })
      if (faucetResponse.data) {
        setFaucetResult(faucetResponse.data)
        if (faucetResponse.data.status == 200) {
          setRequested(true)
        } else if (faucetResponse.data.message.indexOf('daily limit') >= 0) {
          setRequested(true)
        }
      }
    } catch (err) {
      setFaucetResult({ status: 400, message: 'Failed to send the request to the server.' })
    } finally {
      setPendingTx(false)
    }
  }

  const handleRequest = useCallback(async () => {
    recaptchaRef.current.execute()
  }, [recaptchaRef])

  return (
    <>
      <Head>
        <title>Faucet | Solarbeam</title>
        <meta key="description" name="description" content="Moonriver Faucet" />
      </Head>

      <SolarbeamLogo />

      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={'6LeaGV4cAAAAAE2HKmub-Ilnb7raS1JfhdfhfrP1'}
        onChange={onReCAPTCHAChange}
      />

      <Container maxWidth="2xl" className="space-y-6">
        <DoubleGlowShadow opacity="0.6">
          <div className="p-4 space-y-4 rounded bg-dark-900" style={{ zIndex: 1 }}>
            <div className="flex items-center justify-center mb-4 space-x-3">
              <div className="grid grid-cols-3 rounded p-3px bg-dark-800 h-[46px]">
                <NavLink
                  activeClassName="font-bold border rounded text-high-emphesis border-dark-700 bg-dark-700"
                  exact
                  href={{
                    pathname: '/bridge',
                  }}
                >
                  <a className="flex items-center justify-center px-4 text-base font-medium text-center rounded-md text-secondary hover:text-high-emphesis ">
                    <Typography component="h1" variant="lg">
                      {i18n._(t`Bridge`)}
                    </Typography>
                  </a>
                </NavLink>
                <NavLink
                  activeClassName="font-bold border rounded text-high-emphesis border-dark-700 bg-dark-700"
                  exact
                  href={{
                    pathname: '/bridge/history',
                  }}
                >
                  <a className="flex items-center justify-center px-4 text-base font-medium text-center rounded-md text-secondary hover:text-high-emphesis">
                    <Typography component="h1" variant="lg">
                      {i18n._(t`History`)}
                    </Typography>
                  </a>
                </NavLink>
                <NavLink
                  activeClassName="font-bold border rounded text-high-emphesis border-dark-700 bg-dark-700"
                  exact
                  href={{
                    pathname: '/bridge/faucet',
                  }}
                >
                  <a className="flex items-center justify-center px-4 text-base font-medium text-center rounded-md text-secondary hover:text-high-emphesis">
                    <Typography component="h1" variant="lg">
                      {i18n._(t`Faucet`)}
                    </Typography>
                  </a>
                </NavLink>
              </div>
            </div>
            <div className="h-[570px] flex flex-col justify-center items-center">
              <div className="p-4 mb-3 space-y-3 text-center">
                <Typography component="h1" variant="base">
                  A Faucet is a tool that provides a small amount of MOVR for users that used the bridge to start using
                  Solarbeam.io without having to buy MOVR somewhere else.
                </Typography>
              </div>
              <div className="flex flex-1 justify-center text-center items-center mt-8 mb-12">
                <Image src="/images/faucet/moonriver-faucet.png" alt="Solarbeam" width={150} height={150} />
              </div>
              <div className="p-4 mb-3 space-y-1 text-center">
                <Typography component="h1" variant="base">
                  Faucet balance:{' '}
                  {formatNumberScale(tokenBalance[FAUCET_ADDRESS]?.toSignificant(4, undefined, 2) ?? 0, false, 4)} MOVR
                </Typography>
                <Typography component="h1" variant="base">
                  Faucet Address: {FAUCET_ADDRESS}
                </Typography>
              </div>

              <AutoColumn gap={'md'}>
                <div className={'flex items-center w-full'}>
                  {!account ? (
                    <Web3Connect size="lg" color="gradient" className="w-full" />
                  ) : (
                    <ButtonError
                      className="font-bold text-light"
                      onClick={handleRequest}
                      style={{
                        width: '100%',
                      }}
                      disabled={pendingTx || requested}
                    >
                      {pendingTx ? (
                        <div>
                          <AutoRow gap="6px" justify="center" align="center">
                            Requesting <Loader stroke="white" />
                          </AutoRow>
                        </div>
                      ) : (
                        i18n._(t`Give me some MOVR`)
                      )}
                    </ButtonError>
                  )}
                </div>
              </AutoColumn>
              <div className="p-4 mb-3 space-y-3 text-center">
                {faucetResult?.message && (
                  <Typography
                    component="h1"
                    variant="base"
                    className={`${faucetResult?.status == 200 ? 'text-green' : 'text-red'}`}
                  >
                    {faucetResult?.message}
                  </Typography>
                )}
              </div>
            </div>
          </div>
        </DoubleGlowShadow>
      </Container>
    </>
  )
}
