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
