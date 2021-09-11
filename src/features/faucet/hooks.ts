const { default: axios } = require('axios')

export function useFaucetApi() {
  return Promise.all([axios.get('/api/prices')])
}
