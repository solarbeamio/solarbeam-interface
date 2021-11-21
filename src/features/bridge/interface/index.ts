export type TokenInfo = {
  ID?: string
  Name?: string
  Symbol?: string
  Decimals?: number
  Description?: string
  BaseFeePercent?: number
  BigValueThreshold?: number
  DepositAddress?: string
  ContractAddress?: string
  DcrmAddress?: string
  DisableSwap?: boolean
  IsDelegateContract?: boolean
  MaximumSwap?: number
  MaximumSwapFee?: number
  MinimumSwap?: number
  MinimumSwapFee?: number
  PlusGasPricePercentage?: number
  SwapFeeRate?: number
  ResourceId?: string
}

export type ResultPairInfo = {
  DestToken: TokenInfo
  PairID: string
  SrcToken: TokenInfo
  destChainID: number
  logoUrl: string
  name: string
  srcChainID: number
  symbol: string
}

export type AvailableChainsInfo = {
  id: string
  token: TokenInfo
  other: TokenInfo
  logoUrl: string
  name: string
  symbol: string
  destChainID: number
  bridgeTokenAddress?: string
  bridgeAddress?: string
  destChainsInRelay?: number[]
  poweredBy: string
}

export type TokensMap = { [chainId: number]: { [contract: string]: AvailableChainsInfo } }
