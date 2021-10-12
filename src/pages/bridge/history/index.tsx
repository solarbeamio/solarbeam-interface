import { ChainId, CurrencyAmount, Ether, WNATIVE } from '../../../sdk'
import React, { FC, useEffect, useMemo, useState } from 'react'

import Container from '../../../components/Container'
import Head from 'next/head'
import Typography from '../../../components/Typography'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import SolarbeamLogo from '../../../components/SolarbeamLogo'
import useSWR, { SWRResponse } from 'swr'
import NavLink from '../../../components/NavLink'
import Button from '../../../components/Button'
import { BottomGrouping } from '../../../features/swap/styleds'
import Web3Connect from '../../../components/Web3Connect'
import { useWeb3React } from '@web3-react/core'
import { BridgeContextName } from '../../../constants'
import { bridgeInjected } from '../../../connectors'
import { isTransactionRecent, useAllTransactions } from '../../../state/bridgeTransactions/hooks'
import { TransactionDetails } from '../../../state/transactions/reducer'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../state'
import { getExplorerLink } from '../../../functions/explorer'
import { CheckCircleIcon, ExclamationIcon, RefreshIcon, XCircleIcon } from '@heroicons/react/solid'
import { classNames } from '../../../functions'
import Loader from '../../../components/Loader'
import ExternalLink from '../../../components/ExternalLink'
import { RefreshCw } from 'react-feather'
import { NETWORK_ICON, NETWORK_LABEL } from '../../../constants/networks'
import moment from 'moment'
import { FixedSizeList } from 'react-window'
type AnyswapTokenInfo = {
  ID: string
  Name: string
  Symbol: string
  Decimals: number
  Description: string
  BaseFeePercent: number
  BigValueThreshold: number
  DepositAddress: string
  ContractAddress: string
  DcrmAddress: string
  DisableSwap: boolean
  IsDelegateContract: boolean
  MaximumSwap: number
  MaximumSwapFee: number
  MinimumSwap: number
  MinimumSwapFee: number
  PlusGasPricePercentage: number
  SwapFeeRate: number
}

type AnyswapResultPairInfo = {
  DestToken: AnyswapTokenInfo
  PairID: string
  SrcToken: AnyswapTokenInfo
  destChainID: string
  logoUrl: string
  name: string
  srcChainID: string
  symbol: string
}

type AvailableChainsInfo = {
  id: string
  token: AnyswapTokenInfo
  other: AnyswapTokenInfo
  logoUrl: string
  name: string
  symbol: string
  destChainID: string
}

export type AnyswapTokensMap = { [chainId: number]: { [contract: string]: AvailableChainsInfo } }

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const Transaction: FC<{ chainId: string; hash: string }> = ({ chainId, hash }) => {
  const { i18n } = useLingui()
  const allTransactions = useAllTransactions()
  const dispatch = useDispatch<AppDispatch>()
  const [status, setStatus] = useState(null)

  const tx = allTransactions?.[chainId][hash]
  const summary = tx?.summary
  const destChainId = tx?.destChainId
  const srcChaindId = tx?.srcChaindId
  const from = tx?.from
  const pairId = tx?.pairId

  const tzTime = parseInt(tx?.addedTime) / 1000

  const addedTime = moment.unix(tzTime).fromNow()

  const getUrl = () => {
    if (srcChaindId == ChainId.MOONRIVER) {
      return `https://bridgeapi.anyswap.exchange/v2/getWithdrawHashStatus/${from}/${hash}/${srcChaindId}/${pairId}/${destChainId}`
    } else {
      return `https://bridgeapi.anyswap.exchange/v2/getHashStatus/${from}/${hash}/${destChainId}/${pairId}/${srcChaindId}`
    }
  }
  const { data: anyswapInfo, error }: SWRResponse<any, Error> = useSWR(`${getUrl()}`, (url) =>
    fetch(url)
      .then((result) => result.json())
      .then((data) => {
        if (data && data.msg == 'Success') {
          let resultStatus = data?.info?.status || 8
          setStatus(resultStatus)
        }
      })
  )

  if (!chainId) return null

  return (
    <div className={'w-full px-2 py-2 text-left rounded select-none bg-dark-700  text-primary text-sm md:text-lg'}>
      <div className="flex flex-col px-2 md:px-0 md:flex-row">
        <div className="flex justify-between flex-row md:flex-none md:w-40">
          <div className="text-base font-bold text-primary items-center md:hidden">
            <div className="w-40">{i18n._(t`Date`)}</div>
          </div>
          <Typography variant="sm" className="flex items-center py-0.5">
            {addedTime}
          </Typography>
        </div>
        <div className="flex justify-between flex-row md:flex-grow">
          <div className="text-base font-bold text-primary items-center md:hidden">
            <div className="w-40">{i18n._(t`Transaction`)}</div>
          </div>
          <ExternalLink
            href={getExplorerLink(parseInt(chainId), hash, 'transaction')}
            className="flex items-center justify-between gap-2"
          >
            <Typography variant="sm" className="flex items-center hover:underline py-0.5">
              {summary} ↗
            </Typography>
          </ExternalLink>
        </div>
        <div className="flex justify-between flex-row md:flex-none md:w-24">
          <div className="text-base font-bold text-primary items-center md:hidden">
            <div className="w-40">{i18n._(t`From`)}</div>
          </div>
          <Typography variant="sm" className="flex items-center py-0.5">
            {NETWORK_LABEL[srcChaindId]}
          </Typography>
        </div>
        <div className="flex justify-between flex-row md:flex-none md:w-24">
          <div className="text-base font-bold text-primary items-center md:hidden">
            <div className="w-40">{i18n._(t`To`)}</div>
          </div>
          <Typography variant="sm" className="flex items-center py-0.5">
            {NETWORK_LABEL[destChainId]}
          </Typography>
        </div>
        <div className="flex justify-between md:justify-end flex-row md:flex-none md:w-24 ">
          <div className="text-base font-bold text-primary items-center md:hidden">
            <div className="w-40">{i18n._(t`Status`)}</div>
          </div>
          <Typography variant="sm" className="flex items-center md:py-0.5 justify-end">
            <div className={'text-primary'}>
              {status === null ? (
                <Loader stroke={'white'} />
              ) : status == 0 ? (
                'Pending'
              ) : status == 8 ? (
                'Processing'
              ) : status == 9 ? (
                'Minting'
              ) : status == 10 ? (
                'Complete'
              ) : (
                'Pending'
              )}
            </div>
          </Typography>
        </div>
      </div>
    </div>
  )
}

function renderTransactions(
  address: string,
  transactions: { [chainId: number]: { [txHash: string]: TransactionDetails } }
) {
  const txs = []
  Object.keys(transactions).forEach((chainId, i) => {
    const chainTxs = transactions[chainId]
    Object.keys(chainTxs).forEach((hash, idx) => {
      const tx = chainTxs[hash]
      if (tx.from.toString() == address?.toString()) {
        txs.push({ ...tx, chainId, hash })
      }
    })
  })
  return (
    <div className="flex flex-col flex-nowrap gap-2">
      {txs
        .sort((tx, tx1) => tx1.addedTime - tx.addedTime)
        .map((tx, i) => {
          return <Transaction key={i} hash={tx.hash} chainId={tx.chainId} />
        })}
    </div>
  )
}

export default function Bridge() {
  const { i18n } = useLingui()

  const { account: activeAccount, chainId: activeChainId } = useActiveWeb3React()
  const { account, chainId, library, activate } = useWeb3React(BridgeContextName)
  const [refresher, setRefresher] = useState(0)

  const allTransactions = useAllTransactions(refresher)

  useEffect(() => {
    activate(bridgeInjected)
  }, [activate, chainId, activeAccount, activeChainId])

  return (
    <>
      <Head>
        <title>{i18n._(t`Bridge`)} | Solarbeam</title>
        <meta key="description" name="description" content="Bridge" />
      </Head>

      <Container maxWidth="2xl" className="space-y-6 sm:pt-6 sm:pb-6">
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
            <div className="p-4 text-center">
              <div className="justify-between space-x-3 items-center">
                <Typography component="h3" variant="base">
                  {i18n._(t`View the history of all your bridge interactions`)}
                </Typography>
              </div>
            </div>
            <div className="flex items-center justify-between px-4">
              <Typography weight={700}></Typography>
              <div>
                <RefreshCw
                  onClick={() => setRefresher(refresher + 1)}
                  size={20}
                  className={'font-emphasis hover:font-high-emphasis cursor-pointer'}
                />
              </div>
            </div>
            <BottomGrouping>
              {!account && activeAccount ? (
                <Web3Connect size="lg" color="gradient" className="w-full" />
              ) : (
                <div className="space-y-2 p-4 rounded bg-dark-800 mb-2 h-[455px] overflow-y-auto">
                  {allTransactions && Object.keys(allTransactions).length > 0 ? (
                    <>
                      <div className="flex px-2 hidden md:flex text-base font-bold text-primary items-center">
                        <div className="flex-none w-40">{i18n._(t`Date`)}</div>
                        <div className="flex-grow">{i18n._(t`Transaction`)}</div>
                        <div className="flex-none w-24">{i18n._(t`From`)}</div>
                        <div className="flex-none w-24">{i18n._(t`To`)}</div>
                        <div className="flex-none w-24 text-right">{i18n._(t`Status`)}</div>
                      </div>
                      <div className="flex-col mt-2">
                        {renderTransactions(activeAccount || account, allTransactions)}
                      </div>
                    </>
                  ) : (
                    <Typography variant="sm" className="text-secondary">
                      {i18n._(t`Your transactions will appear here...`)}
                    </Typography>
                  )}
                </div>
              )}
            </BottomGrouping>
          </div>
        </DoubleGlowShadow>
      </Container>
    </>
  )
}
