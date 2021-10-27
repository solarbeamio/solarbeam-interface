import { ChainId } from '../sdk'

type ProjectsMap = { [id: number]: ProjectInfo }

export enum PROJECT_STATUS {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  COMPLETED = 'completed',
}

export type ProjectFeature = {
  title: string
  features: string[]
}

export type ProjectSocial = {
  title: string
  link: string
}

export type ProjectTokenomics = {
  title: string
  description: string
}

export type ProjectIDO = {
  title: string
  description: string
}

export type ProjectInfo = {
  status: PROJECT_STATUS
  name?: string
  description?: string
  symbol?: string
  logo?: string
  teaser?: string
  image?: string
  starts?: string
  startBlock?: number
  endBlock?: number
  startsOn?: string
  endsOn?: string
  raise?: number
  price?: number
  baseUrl?: string
  readmore?: string
  website?: string
  tokenContract?: string
  eclipseContract?: string
  idoContract?: string
  highlights?: string[]
  features?: ProjectFeature[]
  socials?: ProjectSocial[]
  tokenomics?: ProjectTokenomics[]
  ido?: ProjectIDO[]
}

export const ECLIPSE_PROJECTS: ProjectsMap = {
  0: {
    name: 'PolkaPet World',
    symbol: '$PETS',
    status: PROJECT_STATUS.UPCOMING,
    raise: 100000,
    price: 0.3,
    baseUrl: '/eclipse/polkapet',
    logo: '/eclipse/polkapet/logo.png',
    teaser: '/eclipse/polkapet/teaser.mp4',
    image: '/eclipse/polkapet/teaser.png',
    starts: 'October 28th 2021',
    startBlock: 810960 - 1490,
    endBlock: 810960,
    startsOn: 'October 28th 2021, 10:00 UTC',
    endsOn: 'October 28th 2021, 16:00 UTC',
    readmore: 'https://solarbeam.medium.com/eclipse-ido-partnership-pets-polkapets-world-8e746af1e7b2',
    website: 'https://www.polkapet.world/',
    tokenContract: 'PETS',
    eclipseContract: '0x44C590b5D78F206db14Cb2d67E5FC97eafFEfCA2',
    highlights: [
      '$PETS is the utility token for the PolkaPet ecosystem.',
      'Utility includes staking, governance, and in play-to-earn.',
      'The project has raised $ 3.1M from top VCs such as Animoca Brands, SkyVision Capital, DFG Group, Jsquare, Waterdrip Capital, Hillrise Capital, and 3Commas, among others.',
    ],
    description:
      'PolkaPets is a unique NFT concept that encourages participation in the Polkadot ecosystem through partnerships with some of the biggest projects around. Each partner has their very own PolkaPet which they can use to educate and engage owners through special utilities and perks. The PolkaPet World DeFi application will allow users to stake and farm $PETS tokens, earning valuable rewards including exclusive NFTs, tokens from partner projects, and of course $PETS tokens.',
    features: [
      {
        title: 'Staking',
        features: ['Stake $PETS for token rewards', 'Stake $PETS for exclusive NFTs', 'Stake $PETS to get PPW merch'],
      },
      {
        title: 'Governance',
        features: [
          'Vote for new Polkadot project partners',
          'Vote for artwork and creative selection',
          'Vote for community rewards',
        ],
      },
      {
        title: 'Earn',
        features: ['From using partner products', 'From games', 'For artwork voted on by the community'],
      },
    ],
    socials: [
      { title: 'Website', link: 'https://polkapet.world' },
      { title: 'Twitter', link: 'https://twitter.com/polkapets' },
      { title: 'Telegram', link: 'https://t.me/polkapetworld' },
      { title: 'Discord', link: 'https://discord.com/invite/VnGHEjMvV9' },
      { title: 'Medium', link: 'https://polkapetworld.medium.com/' },
      { title: 'Litepaper', link: 'https://bit.ly/3m8jpA3' },
    ],
    tokenomics: [
      { title: 'Name', description: 'PolkaPets' },
      { title: 'Symbol', description: 'PETS' },
      { title: 'Blockchain', description: 'Moonriver' },
      { title: 'Total Supply', description: '100,000,000 PETS' },
      { title: 'Price', description: '$0,30' },
    ],
    ido: [
      { title: 'Total PETS', description: '333,333 PETS' },
      { title: 'Total Raise', description: '$100,000' },
      { title: 'Start Block', description: '809760' },
      { title: 'End Block', description: '810960' },
      { title: 'Pools', description: 'Basic, Unlimited' },
    ],
  },
}
