import gql from 'graphql-tag'

export const dexCandlesQuery = gql`
  query dexCandlesQuery($token0: String!, $token1: String!, $period: Int!, $skip: Int!) {
    candles(
      first: 1000
      skip: $skip
      orderBy: time
      orderDirection: asc
      where: { token0: $token0, token1: $token1, period: $period }
    ) {
      time
      open
      low
      high
      close
    }
  }
`
