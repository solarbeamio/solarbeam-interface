import { AppDispatch, AppState } from '../index'
import { useAppDispatch, useAppSelector } from '../hooks'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { TransactionDetails } from './reducer'
import { TransactionResponse } from '@ethersproject/providers'
import { addTransaction } from './actions'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useWeb3React } from '@web3-react/core'
import { BridgeContextName } from '../../constants'

export interface TransactionResponseLight {
  hash: string
  chainId: number
  from: string
}

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponseLight,
  customData?: {
    summary?: string
    destChainId?: string
    pairId?: string
    srcChaindId?: string
  }
) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (
      response: TransactionResponseLight,
      {
        summary,
        destChainId,
        pairId,
        srcChaindId,
      }: {
        summary?: string
        destChainId?: string
        pairId?: string
        srcChaindId?: string
      } = {}
    ) => {
      const { hash, chainId, from } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(
        addTransaction({
          hash,
          from,
          chainId: parseInt(srcChaindId),
          summary,
          destChainId,
          pairId,
          srcChaindId,
        })
      )
    },
    [dispatch]
  )
}

// returns all the transactions for the current chain
export function useAllTransactions(refresher = 0): { [chainId: number]: { [txHash: string]: TransactionDetails } } {
  const state = useAppSelector((state) => state.bridgeTransactions)
  return useMemo(() => {
    return state
  }, [state, refresher])
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}
