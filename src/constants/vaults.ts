import { ChainId } from '../sdk'

export type TokenInfo = {
  id: string
  name: string
  symbol: string
  decimals?: number
}

type PairInfo = {
  id: number
  lpToken: string
  token0: TokenInfo
  token1?: TokenInfo
  name?: string
  symbol?: string
}

type AddressMap = {
  [chainId: number]: {
    [id: string]: PairInfo
  }
}

export const VAULTS: AddressMap = {
  [ChainId.MOONRIVER]: {
    '0': {
      id: 0,
      lpToken: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
      token0: {
        id: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
        name: 'Solarbeam',
        symbol: 'SOLAR',
        decimals: 18,
      },
    },
    '1': {
      id: 1,
      lpToken: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
      token0: {
        id: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
        name: 'Solarbeam',
        symbol: 'SOLAR',
        decimals: 18,
      },
    },
    '2': {
      id: 2,
      lpToken: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
      token0: {
        id: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
        name: 'Solarbeam',
        symbol: 'SOLAR',
        decimals: 18,
      },
    }
  },
}
