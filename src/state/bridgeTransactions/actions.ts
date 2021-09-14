import { ChainId } from '../../sdk'
import { createAction } from '@reduxjs/toolkit'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

export const addTransaction = createAction<{
  chainId: ChainId
  hash: string
  from: string
  summary?: string
  destChainId?: string
  pairId?: string
  srcChaindId?: string
}>('bridgeTransactions/addTransaction')

export const clearAllTransactions = createAction<{ chainId: ChainId }>('bridgeTransactions/clearAllTransactions')

export const finalizeTransaction = createAction<{
  chainId: ChainId
  hash: string
  receipt: SerializableTransactionReceipt
}>('bridgeTransactions/finalizeTransaction')

export const checkedTransaction = createAction<{
  chainId: ChainId
  hash: string
  blockNumber: number
}>('bridgeTransactions/checkedTransaction')
