import Dots from '../../components/Dots'
import FarmListItem from './FarmListItem'
import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import useSortableData from '../../hooks/useSortableData'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'

const SortDirection = ({ sortConfig, sortKey }) => {
  return (
    <>
      {sortConfig &&
        sortConfig.key === sortKey &&
        ((sortConfig.direction === 'ascending' && <ChevronUpIcon width={12} height={12} />) ||
          (sortConfig.direction === 'descending' && <ChevronDownIcon width={12} height={12} />))}
    </>
  )
}
const FarmList = ({ farms, term }) => {
  const { items, sortConfig, requestSort } = useSortableData(farms)
  const { i18n } = useLingui()

  return items ? (
    <>
      <div className="grid grid-cols-4 text-base text-high-emphesis">
        <div className="flex items-center col-span-2 px-4 md:col-span-1 space-x-2">
          <div>{i18n._(t`Liquidity`)}</div>
        </div>
        <div
          className="flex items-center px-2 cursor-pointer hover:text-white space-x-2"
          onClick={() => requestSort('tvl')}
        >
          <div>{i18n._(t`TVL`)}</div>
          <SortDirection sortConfig={sortConfig} sortKey="tvl" />
        </div>
        <div
          className="items-center justify-start hidden px-2 cursor-pointer  md:flex hover:text-white space-x-2"
          onClick={() => requestSort('rewardsTotal')}
        >
          <div>{i18n._(t`Allocation`)}</div>
          <SortDirection sortConfig={sortConfig} sortKey="rewardsTotal" />
        </div>
        <div
          className="flex items-center justify-end px-4 cursor-pointer hover:text-white space-x-2"
          onClick={() => requestSort('roiPerYear')}
        >
          <div>{i18n._(t`APR`)}</div>
          <SortDirection sortConfig={sortConfig} sortKey="roiPerYear" />
        </div>
      </div>
      <div className="flex-col mt-2">
        {items.map((farm, index) => (
          <FarmListItem key={index} farm={farm} />
        ))}
      </div>
    </>
  ) : (
    <div className="w-full py-6 text-center">
      {term ? <span>{i18n._(t`No Results`)}</span> : <Dots>{i18n._(t`Loading`)}</Dots>}
    </div>
  )
}

export default FarmList
