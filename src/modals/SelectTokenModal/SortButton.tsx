import React from 'react'
import { RowFixed } from '../../components/Row'
import styled from 'styled-components'

export const FilterWrapper = styled(RowFixed)`
  padding: 8px;
  border-radius: 8px;
  user-select: none;
  & > * {
    user-select: none;
  }
  :hover {
    cursor: pointer;
  }
`

export default function SortButton({
  toggleSortOrder,
  ascending,
}: {
  toggleSortOrder: () => void
  ascending: boolean
}) {
  return (
    <FilterWrapper onClick={toggleSortOrder} className="text-sm bg-dark-800">
      {ascending ? '↑' : '↓'}
    </FilterWrapper>
  )
}
