import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'

export const dexCandlesGraph = (chainId) => {
  const uri = 'https://analytics.solarbeam.io/api/dexcandles'
  return new ApolloClient({
    link: createHttpLink({
      uri: uri,
    }),
    cache: new InMemoryCache(),
  })
}

export const pairsGraph = (chainId) => {
  const uri = 'https://analytics.solarbeam.io/api/subgraph'
  return new ApolloClient({
    link: createHttpLink({
      uri: uri,
    }),
    cache: new InMemoryCache(),
  })
}

export const blocklyticsGraph = (chainId) => {
  const uri = 'https://analytics.solarbeam.io/api/blocklytics'
  return new ApolloClient({
    link: createHttpLink({
      uri: uri,
    }),
    cache: new InMemoryCache(),
  })
}
