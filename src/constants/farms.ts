import { ChainId } from '../sdk'


export type TokenInfo = {
  id: string
  name: string
  symbol: string
  decimals?: number
}

type PairInfo = {
  id: number,
  token0: TokenInfo
  token1?: TokenInfo
  name?: string
  symbol?: string
}

type AddressMap = {
  [chainId: number]: {
    [address: string]: PairInfo
  }
}

export const POOLS: AddressMap = {
  [ChainId.MOONRIVER]: {
    '0x7eDA899b3522683636746a2f3a7814e6fFca75e1': {
      id: 0,
      token0: {
        id: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
        name: 'Solarbeam',
        symbol: 'SOLAR',
        decimals: 18,
      },
      token1: {
        id: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
        name: 'Moonriver',
        symbol: 'MOVR',
        decimals: 18,
      },
      name: 'Solarbeam LP',
      symbol: 'SLP',
    },
    '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B': {
      id: 1,
      token0: {
        id: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
        name: 'Solarbeam',
        symbol: 'SOLAR',
        decimals: 18,
      },
    },
    '0x98878B06940aE243284CA214f92Bb71a2b032B8A': {
      id: 2,
      token0: {
        id: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
        name: 'Wrapped Moonriver',
        symbol: 'WMOVR',
        decimals: 18,
      },
    },
    '0xf9b7495b833804e4d894fC5f7B39c10016e0a911': {
      id: 3,
      token0: {
        id: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
        name: 'Solarbeam',
        symbol: 'SOLAR',
        decimals: 18,
      },
      token1: {
        id: '0xbD90A6125a84E5C512129D622a75CDDE176aDE5E',
        name: 'RiverBoat',
        symbol: 'RIB',
        decimals: 18,
      },
      name: 'Solarbeam LP',
      symbol: 'SLP',
    },
    '0x0acDB54E610dAbC82b8FA454b21AD425ae460DF9': {
      id: 4,
      token0: {
        id: '0xbD90A6125a84E5C512129D622a75CDDE176aDE5E',
        name: 'RiverBoat',
        symbol: 'RIB',
        decimals: 18,
      },
      token1: {
        id: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
        name: 'Moonriver',
        symbol: 'MOVR',
        decimals: 18,
      },
      name: 'Solarbeam LP',
      symbol: 'SLP',
    },
    '0xbD90A6125a84E5C512129D622a75CDDE176aDE5E': {
      id: 5,
      token0: {
        id: '0xbD90A6125a84E5C512129D622a75CDDE176aDE5E',
        name: 'RiverBoat',
        symbol: 'RIB',
        decimals: 18,
      },
    },
    '0xe537f70a8b62204832B8Ba91940B77d3f79AEb81': {
      id: 6,
      token0: {
        id: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
        name: 'USDC Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      token1: {
        id: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
        name: 'Moonriver',
        symbol: 'MOVR',
        decimals: 18,
      },
      name: 'Solarbeam LP',
      symbol: 'SLP',
    },
    '0xdb66BE1005f5Fe1d2f486E75cE3C50B52535F886': {
      id: 7,
      token0: {
        id: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
        name: 'Solarbeam',
        symbol: 'SOLAR',
        decimals: 18,
      },
      token1: {
        id: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
        name: 'USDC Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      name: 'Solarbeam LP',
      symbol: 'SLP',
    },
    '0xFE1b71BDAEE495dCA331D28F5779E87bd32FbE53': {
      id: 8,
      token0: {
        id: '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
      },
      token1: {
        id: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
        name: 'USDC Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      name: 'Solarbeam LP',
      symbol: 'SLP',
    },
    '0x384704557F73fBFAE6e9297FD1E6075FC340dbe5': {
      id: 9,
      token0: {
        id: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
        name: 'Binance-Peg BUSD Token',
        symbol: 'BUSD',
        decimals: 18,
      },
      token1: {
        id: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
        name: 'USDC Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      name: 'Solarbeam LP',
      symbol: 'SLP',
    },
  },
}
