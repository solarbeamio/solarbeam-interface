import React from 'react'
import { usePricesApi } from '../features/farm/hooks'

export const PriceContext = React.createContext({
  movr: 0,
  solar: 0,
  rib: 0,
  mock: 1,
  usdc: 1,
})

export function PriceProvider({ children }) {
  const priceData = usePricesApi()
  return <PriceContext.Provider value={priceData}>{children}</PriceContext.Provider>
}

export default PriceProvider
