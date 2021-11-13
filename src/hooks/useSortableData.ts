import { useMemo, useState } from 'react'

import { BigNumber } from '@ethersproject/bignumber'

export enum SortableOptions {
  'tvl' = 'TVL',
  'roiPerYear' = 'APY',
}

function getNested(theObject: any, path: string, separator = '.') {
  try {
    return path
      .replace('[', separator)
      .replace(']', '')
      .split(separator)
      .reduce((obj, property) => {
        return obj[property]
      }, theObject)
  } catch (err) {
    return undefined
  }
}

const useSortableData = (
  items: any,
  config: any = { key: 'rewardsTotal', direction: 'descending', value: SortableOptions.tvl }
) => {
  const [sortConfig, setSortConfig] = useState(config)

  const sortedItems = useMemo(() => {
    if (items && items.length > 0) {
      const sortableItems = [...items]
      if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
          const aValue = getNested(a, sortConfig.key)
          const bValue = getNested(b, sortConfig.key)
          if (aValue instanceof BigNumber && bValue instanceof BigNumber) {
            if (aValue.lt(bValue)) {
              return sortConfig.direction === 'ascending' ? -1 : 1
            }
            if (aValue.gt(bValue)) {
              return sortConfig.direction === 'ascending' ? 1 : -1
            }
          } else {
            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1
            }
          }
          return 0
        })
      }
      return sortableItems
    }
    return []
  }, [items, sortConfig])

  const requestSort = (key: any, direction = 'descending') => {
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending'
    }
    setSortConfig({ key, direction, value: SortableOptions[key] })
  }

  return { items: sortedItems, requestSort, sortConfig, SortableOptions }
}

export default useSortableData
