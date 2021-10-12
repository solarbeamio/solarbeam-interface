import { ChainId } from '../sdk'

export type TokenInfo = {
  id: string
  name: string
  symbol: string
  decimals?: number
}

type PairInfo = {
  id: number
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
    '0xA0D8DFB2CC9dFe6905eDd5B71c56BA92AD09A3dC': {
      id: 10,
      token0: {
        id: '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',
        name: 'Ethereum',
        symbol: 'ETH',
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
    '0xfb1d0D6141Fc3305C63f189E39Cc2f2F7E58f4c2': {
      id: 11,
      token0: {
        id: '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c',
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18,
      },
      token1: {
        id: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
        name: 'Binance-Peg BUSD Token',
        symbol: 'BUSD',
        decimals: 18,
      },
      name: 'Solarbeam LP',
      symbol: 'SLP',
    },
    '0x83d7a3fc841038E8c8F46e6192BBcCA8b19Ee4e7': {
      id: 12,
      token0: {
        id: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        decimals: 8,
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
    '0x2a44696DDc050f14429bd8a4A05c750C6582bF3b': {
      id: 13,
      token0: {
        id: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
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
    '0x29633cc367AbD9b16d327Adaf6c3538b6e97f6C0': {
      id: 14,
      token0: {
        id: '0x682F81e57EAa716504090C3ECBa8595fB54561D8',
        name: 'Matic',
        symbol: 'MATIC',
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
    '0xb9a61ac826196AbC69A3C66ad77c563D6C5bdD7b': {
      id: 15,
      token0: {
        id: '0x14a0243C333A5b238143068dC3A7323Ba4C30ECB',
        name: 'Avalanche',
        symbol: 'AVAX',
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
    '0x9e0d90ebB44c22303Ee3d331c0e4a19667012433': {
      id: 16,
      token0: {
        id: '0xAd7F1844696652ddA7959a49063BfFccafafEfe7',
        name: 'Relay Token',
        symbol: 'RELAY',
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
    '0x55Ee073B38BF1069D5F1Ed0AA6858062bA42F5A9': {
      id: 17,
      token0: {
        id: '0x7f5a79576620C046a293F54FFCdbd8f2468174F1',
        name: 'miMatic',
        symbol: 'MAI',
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
    '0x1eebed8F28A6865a76D91189FD6FC45F4F774d67': {
      id: 18,
      token0: {
        id: '0xaD12daB5959f30b9fF3c2d6709f53C335dC39908',
        name: 'Fantom Token',
        symbol: 'FTM',
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
    '0x9051fB701d6D880800e397e5B5d46FdDfAdc7056': {
      id: 19,
      token0: {
        id: '0x0caE51e1032e8461f4806e26332c030E34De3aDb',
        name: 'Magic Internet Money',
        symbol: 'MIM',
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
