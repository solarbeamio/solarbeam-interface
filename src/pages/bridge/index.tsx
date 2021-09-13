import {
  AbstractCurrency,
  Binance,
  ChainId,
  Currency,
  CurrencyAmount,
  Ether,
  JSBI,
  Moonriver,
  NATIVE,
  Token,
  WNATIVE,
} from '../../sdk'
import React, { useCallback, useEffect, useState } from 'react'

import { AutoRow } from '../../components/Row'
import Container from '../../components/Container'
import Head from 'next/head'
import { ArrowDown, ArrowRight } from 'react-feather'
import Typography from '../../components/Typography'
import Web3Connect from '../../components/Web3Connect'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import { useMultichainCurrencyBalance, useTokenBalance } from '../../state/wallet/hooks'
import DoubleGlowShadow from '../../components/DoubleGlowShadow'
import SolarbeamLogo from '../../components/SolarbeamLogo'
import { BottomGrouping } from '../../features/swap/styleds'
import Button from '../../components/Button'
import DualChainCurrencyInputPanel from '../../components/DualChainCurrencyInputPanel'
import ChainSelect from '../../components/ChainSelect'
import { Chain, DEFAULT_CHAIN_FROM, DEFAULT_CHAIN_TO } from '../../sdk/entities/Chain'
import { useBridgeInfo } from '../../features/bridge/hooks'
import useSWR, { SWRResponse } from 'swr'
import { getAddress } from 'ethers/lib/utils'
import { formatNumber } from '../../functions'
import { SUPPORTED_NETWORKS } from '../../modals/ChainModal'
import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { ethers } from 'ethers'
import { useTokenContract } from '../../hooks'
import Loader from '../../components/Loader'

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

export default function Bridge() {
  const { i18n } = useLingui()
  const { account, chainId, library } = useActiveWeb3React()

  const currentChainFrom = chainId &&
    SUPPORTED_NETWORKS[chainId] && { id: chainId, icon: NETWORK_ICON[chainId], name: NETWORK_LABEL[chainId] }

  const [chainFrom, setChainFrom] = useState<Chain | null>(currentChainFrom || DEFAULT_CHAIN_FROM)

  const [chainTo, setChainTo] = useState<Chain | null>(
    chainId == ChainId.MOONRIVER ? DEFAULT_CHAIN_FROM : DEFAULT_CHAIN_TO
  )

  const [tokenList, setTokenList] = useState<Currency[] | null>([])
  const [currency0, setCurrency0] = useState<Currency | null>(null)
  const [currencyAmount, setCurrencyAmount] = useState<string | null>('')
  const [tokenToBridge, setTokenToBridge] = useState<AvailableChainsInfo | null>(null)
  const currencyContract = useTokenContract(currency0?.isToken && currency0?.address, true)
  const [pendingTx, setPendingTx] = useState(false)

  const selectedCurrencyBalance = useMultichainCurrencyBalance(
    chainFrom?.id,
    account ?? undefined,
    currency0 ?? undefined
  )

  const { data: anyswapInfo, error }: SWRResponse<AnyswapTokensMap, Error> = useSWR(
    'https://bridgeapi.anyswap.exchange/v2/serverInfo/1285',
    (url) =>
      fetch(url)
        .then((result) => result.json())
        .then((data) => {
          let result: AnyswapTokensMap = {}

          Object.keys(data || {}).map((key) => {
            const info: AnyswapResultPairInfo = data[key]

            let sourceContractAddress = info.SrcToken.ContractAddress
            if (!sourceContractAddress) {
              sourceContractAddress = WNATIVE[parseInt(info.srcChainID)].address
            }

            sourceContractAddress = sourceContractAddress.toLowerCase()

            let existingSource = result[parseInt(info.srcChainID)]
            if (!existingSource) {
              result[parseInt(info.srcChainID)] = {
                [sourceContractAddress]: {
                  destChainID: info.destChainID,
                  id: info.PairID,
                  logoUrl: info.logoUrl,
                  name: info.name,
                  symbol: info.symbol,
                  token: info.DestToken,
                  other: info.SrcToken,
                },
              }
            } else {
              result[parseInt(info.srcChainID)][sourceContractAddress] = {
                destChainID: info.destChainID,
                id: info.PairID,
                logoUrl: info.logoUrl,
                name: info.name,
                symbol: info.symbol,
                token: info.DestToken,
                other: info.SrcToken,
              }
            }

            let destContractAddress = info.DestToken.ContractAddress
            if (!destContractAddress) {
              destContractAddress = WNATIVE[parseInt(info.destChainID)].address
            }

            destContractAddress = destContractAddress.toLowerCase()

            let existingDestination = result[parseInt(info.destChainID)]
            if (!existingDestination) {
              result[parseInt(info.destChainID)] = {
                [destContractAddress]: {
                  destChainID: info.srcChainID,
                  id: info.PairID,
                  logoUrl: info.logoUrl,
                  name: info.name,
                  symbol: info.symbol,
                  token: info.SrcToken,
                  other: info.DestToken,
                },
              }
            } else {
              result[parseInt(info.destChainID)][destContractAddress] = {
                destChainID: info.srcChainID,
                id: info.PairID,
                logoUrl: info.logoUrl,
                name: info.name,
                symbol: info.symbol,
                token: info.SrcToken,
                other: info.DestToken,
              }
            }
          })
          return result
        })
  )

  useEffect(() => {
    let tokens: Currency[] = Object.keys((anyswapInfo && anyswapInfo[chainFrom.id]) || {})
      .filter((r) => anyswapInfo[chainFrom.id][r].destChainID == chainTo.id.toString())
      .map((r) => {
        const info: AvailableChainsInfo = anyswapInfo[chainFrom.id][r]
        if (r.toLowerCase() == WNATIVE[chainFrom.id].address.toLowerCase()) {
          if (chainFrom.id == ChainId.MOONRIVER) {
            return Moonriver.onChain(chainFrom.id)
          }
          if (chainFrom.id == ChainId.BSC) {
            return Binance.onChain(chainFrom.id)
          }
          if (chainFrom.id == ChainId.MAINNET) {
            return Ether.onChain(chainFrom.id)
          }
        }
        return new Token(chainFrom.id, getAddress(r), info.token.Decimals, info.token.Symbol, info.name)
      })

    setTokenList(tokens)
    setCurrency0(null)
    setCurrencyAmount('')
  }, [chainFrom, anyswapInfo, chainTo.id])

  const handleChainFrom = useCallback(
    (chain: Chain) => {
      let changeTo = chainTo
      if (chainTo.id == chain.id) {
        changeTo = chainFrom
      }
      if (changeTo.id !== ChainId.MOONRIVER && chain.id !== ChainId.MOONRIVER) {
        setChainTo(DEFAULT_CHAIN_TO)
      } else {
        setChainTo(changeTo)
      }
      setChainFrom(chain)
    },
    [chainFrom, chainTo]
  )

  const handleChainTo = useCallback(
    (chain: Chain) => {
      let changeFrom = chainFrom
      if (chainFrom.id == chain.id) {
        changeFrom = chainTo
      }
      if (changeFrom.id !== ChainId.MOONRIVER && chain.id !== ChainId.MOONRIVER) {
        setChainFrom(DEFAULT_CHAIN_TO)
      } else {
        setChainFrom(changeFrom)
      }
      setChainTo(chain)
    },
    [chainFrom, chainTo]
  )

  const handleTypeInput = useCallback(
    (value: string) => {
      setCurrencyAmount(value)
    },
    [setCurrencyAmount]
  )

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      setCurrency0(currency)
      handleTypeInput('')
      if (currency) {
        const tokenTo =
          anyswapInfo[chainFrom.id][
            currency.isToken ? currency?.address?.toLowerCase() : currency?.wrapped?.address?.toLowerCase()
          ]
        console.debug(tokenTo)
        setTokenToBridge(tokenTo)
      }
    },
    [anyswapInfo, chainFrom.id, handleTypeInput]
  )

  const insufficientBalance = () => {
    if (currencyAmount && selectedCurrencyBalance) {
      try {
        const balance = parseFloat(selectedCurrencyBalance.toFixed(currency0.decimals))
        const amount = parseFloat(currencyAmount)
        return amount > balance
      } catch (ex) {
        return false
      }
    }
    return false
  }

  const aboveMin = () => {
    if (currencyAmount && tokenToBridge) {
      const amount = parseFloat(currencyAmount)
      const minAmount = parseFloat(tokenToBridge?.other?.MinimumSwap.toString())
      return amount >= minAmount
    }
    return false
  }

  const belowMax = () => {
    if (currencyAmount && tokenToBridge) {
      const amount = parseFloat(currencyAmount)
      const maxAmount = parseFloat(tokenToBridge?.other?.MaximumSwap.toString())
      return amount <= maxAmount
    }
    return false
  }

  const buttonDisabled =
    (chainFrom && chainFrom.id !== chainId) ||
    !currency0 ||
    !currencyAmount ||
    currencyAmount == '' ||
    !aboveMin() ||
    !belowMax() ||
    insufficientBalance() ||
    pendingTx

  const buttonText =
    chainFrom && chainFrom.id !== chainId
      ? `Switch to ${chainFrom.name} Network`
      : !currency0
      ? `Select a Token`
      : !currencyAmount || currencyAmount == ''
      ? 'Enter an Amount'
      : !aboveMin()
      ? `Below Minimum Amount`
      : !belowMax()
      ? `Above Maximum Amount`
      : insufficientBalance()
      ? `Insufficient Balance`
      : pendingTx
      ? `Confirming Transaction`
      : `Bridge ${currency0?.symbol}`

  const bridgeToken = async () => {
    const amountToBridge = ethers.utils.parseUnits(currencyAmount, tokenToBridge.other.Decimals)
    setPendingTx(true)

    try {
      if (currency0.isNative) {
        await library.getSigner().sendTransaction({
          from: account,
          to: tokenToBridge.other.DepositAddress,
          value: amountToBridge,
        })
      } else if (currency0.isToken) {
        const fn = currencyContract?.interface?.getFunction('transfer')
        const data = currencyContract.interface.encodeFunctionData(fn, [
          tokenToBridge.other.DepositAddress,
          amountToBridge.toString(),
        ])
        await library.getSigner().sendTransaction({
          value: 0x0,
          from: account,
          to: currency0.address,
          data,
        })
      }
    } catch (ex) {
    } finally {
      setPendingTx(false)
    }
  }
  return (
    <>
      <Head>
        <title>{i18n._(t`Bridge`)} | Solarbeam</title>
        <meta key="description" name="description" content="Bridge" />
      </Head>

      <SolarbeamLogo />

      <Container maxWidth="2xl" className="space-y-6">
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
            <div className="flex flex-row justify-between items-center text-center">
              <ChainSelect
                availableChains={Object.keys(anyswapInfo || {}).map((r) => parseInt(r))}
                label="From"
                chain={chainFrom}
                otherChain={chainTo}
                onChainSelect={(chain) => handleChainFrom(chain)}
              />
              <button className={'sm:m-6'}>
                <ArrowRight size="32" />
              </button>
              <ChainSelect
                availableChains={Object.keys(anyswapInfo || {}).map((r) => parseInt(r))}
                label="To"
                chain={chainTo}
                otherChain={chainFrom}
                onChainSelect={(chain) => handleChainTo(chain)}
              />
            </div>

            <DualChainCurrencyInputPanel
              label={i18n._(t`Token to bridge:`)}
              value={currencyAmount}
              currency={currency0}
              onUserInput={handleTypeInput}
              onMax={(amount) => handleTypeInput(amount)}
              onCurrencySelect={(currency) => {
                handleCurrencySelect(currency)
              }}
              chainFrom={chainFrom}
              chainTo={chainTo}
              tokenList={tokenList}
              chainList={anyswapInfo}
            />

            <BottomGrouping>
              {!account ? (
                <Web3Connect size="lg" color="gradient" className="w-full" />
              ) : (
                <Button
                  onClick={() => bridgeToken()}
                  color={buttonDisabled ? 'gray' : 'gradient'}
                  size="lg"
                  disabled={buttonDisabled}
                >
                  {pendingTx ? (
                    <div className={'p-2'}>
                      <AutoRow gap="6px" justify="center">
                        {buttonText} <Loader stroke="white" />
                      </AutoRow>
                    </div>
                  ) : (
                    buttonText
                  )}
                </Button>
              )}
            </BottomGrouping>

            {currency0 && (
              <div className={'p-2 sm:p-5 rounded bg-dark-800'}>
                <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                  <div className="text-sm font-medium text-secondary">
                    Minimum Bridge Amount: {formatNumber(tokenToBridge?.other?.MinimumSwap)}{' '}
                    {tokenToBridge?.other?.Symbol}
                  </div>
                </div>
                <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                  <div className="text-sm font-medium text-secondary">
                    Maximum Bridge Amount: {formatNumber(tokenToBridge?.other?.MaximumSwap)}{' '}
                    {tokenToBridge?.other?.Symbol}
                  </div>
                </div>
                {tokenToBridge?.other?.MinimumSwapFee > 0 && (
                  <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                    <div className="text-sm font-medium text-secondary">
                      Minimum Swap Fee: {formatNumber(tokenToBridge?.other?.MinimumSwapFee)}{' '}
                      {tokenToBridge?.other?.Symbol}
                    </div>
                  </div>
                )}
                {tokenToBridge?.other?.MaximumSwapFee > 0 && (
                  <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                    <div className="text-sm font-medium text-secondary">
                      Maximum Swap Fee: {formatNumber(tokenToBridge?.other?.MaximumSwapFee)}{' '}
                      {tokenToBridge?.other?.Symbol}
                    </div>
                  </div>
                )}
                <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                  <div className="text-sm font-medium text-secondary">
                    Fee: {formatNumber(tokenToBridge?.other?.SwapFeeRate * 100)} %
                  </div>
                </div>
                <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                  <div className="text-sm font-medium text-secondary">
                    Amounts greater than {formatNumber(tokenToBridge?.other?.BigValueThreshold)}{' '}
                    {tokenToBridge?.other?.Symbol} could take up to 12 hours.
                  </div>
                </div>
              </div>
            )}

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
