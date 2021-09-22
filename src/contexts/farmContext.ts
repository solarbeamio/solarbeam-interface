import React from 'react'

const FarmContext = React.createContext({
  data: [
    {
      address: null,
      baseSymbol: null,
      baseAmount: null,
      single: false,
    },
  ],
})

export default FarmContext
