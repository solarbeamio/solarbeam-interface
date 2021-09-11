import { usePriceApi } from '../farm/hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'

const { default: axios } = require('axios')

const useAsync = (asyncFunction, immediate = true) => {
  const [value, setValue] = useState(null)

  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    return asyncFunction().then((response) => {
      let [prices] = response
      setValue({ data: { ...prices?.data } })
    })
  }, [asyncFunction])
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    const intervalId = setInterval(() => {
      execute()
    }, 60000)

    if (immediate) {
      execute()
    }

    return () => {
      clearInterval(intervalId) //This is important
    }
  }, [execute, immediate])

  return useMemo(() => {
    return value
  }, [value])
}

export function useFaucetApi() {
  return Promise.all([axios.get('/api/prices')])
}

export function useFaucetsApi() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAsync(useFaucetApi, true)
}
