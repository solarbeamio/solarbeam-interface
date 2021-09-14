import {
  SerializableTransactionReceipt,
  addTransaction,
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
} from './actions'

import { createReducer } from '@reduxjs/toolkit'

const now = () => new Date().getTime()

export interface TransactionDetails {
  hash: string
  summary?: string
  destChainId?: string
  pairId?: string
  srcChaindId?: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      addTransaction,
      (transactions, { payload: { chainId, from, hash, summary, destChainId, pairId, srcChaindId } }) => {
        if (transactions[chainId]?.[hash]) {
          throw Error('Attempted to add existing transaction.')
        }
        const txs = transactions[chainId] ?? {}
        txs[hash] = {
          hash,
          summary,
          from,
          addedTime: now(),
          destChainId,
          pairId,
          srcChaindId,
        }
        transactions[chainId] = txs
      }
    )
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })
)
