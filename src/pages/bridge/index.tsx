import { Currency, CurrencyAmount, JSBI, NATIVE, Token } from '../../sdk'
import React, { useCallback, useState } from 'react'

import { AutoRow } from '../../components/Row'
import Container from '../../components/Container'
import Head from 'next/head'
import { ArrowRight } from 'react-feather'
import Typography from '../../components/Typography'
import Web3Connect from '../../components/Web3Connect'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import { useTokenBalance } from '../../state/wallet/hooks'
import DoubleGlowShadow from '../../components/DoubleGlowShadow'
import SolarbeamLogo from '../../components/SolarbeamLogo'
import { BottomGrouping } from '../../features/swap/styleds'
import Button from '../../components/Button'
import DualChainCurrencyInputPanel from '../../components/DualChainCurrencyInputPanel'
import ChainSelect from '../../components/ChainSelect'
import { Chain, DEFAULT_CHAIN_FROM, DEFAULT_CHAIN_TO } from '../../sdk/entities/Chain'
import { useBridgeInfo } from '../../features/bridge/hooks'
import useSWR, { SWRResponse } from 'swr'

export default function Bridge() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()

  const { data: bridgeData, error }: SWRResponse<{ average: number }, Error> = useSWR(
    'https://bridgeapi.anyswap.exchange/v2/serverInfo/1285',
    (url) => fetch(url).then((r) => r.json())
  )

  console.log(bridgeData)

  const [chainFrom, setChainFrom] = useState<Chain | null>(DEFAULT_CHAIN_FROM)
  const [chainTo, setChainTo] = useState<Chain | null>(DEFAULT_CHAIN_TO)

  const [currency0, setCurrency0] = useState<Currency | null>(() => (chainId ? NATIVE[chainId] : null))
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const position: CurrencyAmount<Token> | undefined = useTokenBalance(undefined, null)

  const hasPosition = Boolean(position && JSBI.greaterThan(position.quotient, JSBI.BigInt(0)))

  const handleChainSelect = useCallback(
    (chain: Chain, source: string) => {
      if (source == 'from') {
        if (chainTo.id == chain.id) {
          setChainTo(chainFrom)
        }
        setChainFrom(chain)
      } else if (source == 'to') {
        if (chainFrom.id == chain.id) {
          setChainFrom(chainTo)
        }
        setChainTo(chain)
      }
    },
    [chainFrom, chainTo]
  )

  return (
    <>
      <Head>
        <title>{i18n._(t`Bridge`)} | Solarbeam</title>
        <meta key="description" name="description" content="Bridge" />
      </Head>

      <SolarbeamLogo />

      <Container maxWidth="xl" className="space-y-6">
        <DoubleGlowShadow>
          <div className="p-4 space-y-4 rounded bg-dark-900" style={{ zIndex: 1 }}>
            <div className="p-4 mb-3 space-y-3 text-center">
              <Typography component="h1" variant="h3">
                {i18n._(t`Solar Bridge`)}
              </Typography>
              <Typography component="h3" variant="base">
                {i18n._(t`Bridge tokens to and from the Moonriver Network`)}
              </Typography>
            </div>
            <AutoRow justify={'space-between'}>
              <ChainSelect
                label="From"
                chain={chainFrom}
                otherChain={chainTo}
                onChainSelect={(chain) => handleChainSelect(chain, 'from')}
              />
              <button className={'px-2'}>
                <ArrowRight size="32" />
              </button>
              <ChainSelect
                label="To"
                chain={chainTo}
                otherChain={chainFrom}
                onChainSelect={(chain) => handleChainSelect(chain, 'to')}
              />
            </AutoRow>

            <DualChainCurrencyInputPanel
              label={i18n._(t`Token to bridge:`)}
              value={'0'}
              currency={null}
              onUserInput={() => {}}
              onMax={() => {}}
              fiatValue={undefined}
              onCurrencySelect={() => {}}
              chainFrom={chainFrom}
              chainTo={chainTo}
            />

            <BottomGrouping>
              {!account ? (
                <Web3Connect size="lg" color="gradient" className="w-full" />
              ) : (
                <Button color="gradient" size="lg">
                  {i18n._(t`Bridge Token`)}
                </Button>
              )}
            </BottomGrouping>
            <AutoRow
              style={{ justifyItems: 'center', backgroundColor: '', padding: '12px 0px', borderRadius: '12px' }}
              justify={'center'}
              gap={'0 3px'}
            >
              {i18n._(t`Powered by Anyswap Network`)}
            </AutoRow>
          </div>
        </DoubleGlowShadow>
      </Container>
    </>
  )
}
