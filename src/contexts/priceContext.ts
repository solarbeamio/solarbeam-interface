import React from 'react'

const PriceContext = React.createContext({
  data: {
    movr: 0,
    solar: 0,
    rib: 0,
    farms: []
  },
})

export default PriceContext
