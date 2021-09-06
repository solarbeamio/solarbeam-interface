import Dots from '../../components/Dots'
import FarmListItem2 from './FarmListItem2'
import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import useSortableData from '../../hooks/useSortableData'
import { useRouter } from 'next/router'

const FarmList = ({ farms, term, filter }) => {
  const { asPath, pathname, route, query, basePath } = useRouter()
  const { items, requestSort, sortConfig, SortableOptions } = useSortableData(farms)
  const { i18n } = useLingui()

  const isBeefy = query['filter'] == 'beefy'

  return isBeefy ? (
    <div className="w-full py-6 text-center">{i18n._(t`Soon`)}</div>
  ) : items ? (
    <>
      {/* <div className="flex items-center justify-end	 text-secondary gap-3 cursor-pointer">
        <div className="flex flex-row items-center">
          <span className="text-sm">{i18n._(t`Order by`)}:</span>
        </div>
        <NeonSelect value={sortConfig && sortConfig.value}>
          {Object.entries(SortableOptions).map(([k, v]) => (
            <NeonSelectItem key={k} value={v} onClick={() => requestSort(k, 'descending')}>
              {i18n._(t`${v}`)}
            </NeonSelectItem>
          ))}
        </NeonSelect>
      </div> */}

      <div className="grid grid-cols-4 text-base font-bold text-primary">
        <div className="flex items-center col-span-2 px-4 cursor-pointer md:col-span-1">
          <div className="hover:text-high-emphesis">{i18n._(t`Stake`)}</div>
          {/* {sortConfig &&
            sortConfig.key === 'symbol' &&
            ((sortConfig.direction === 'ascending' && <ChevronUpIcon width={12} height={12} />) ||
              (sortConfig.direction === 'descending' && <ChevronDownIcon width={12} height={12} />))} */}
        </div>
        <div className="flex items-center px-2 cursor-pointer hover:text-high-emphesis">
          {i18n._(t`TVL`)}
          {/* {sortConfig &&
            sortConfig.key === 'tvl' &&
            ((sortConfig.direction === 'ascending' && <ChevronUpIcon width={12} height={12} />) ||
              (sortConfig.direction === 'descending' && <ChevronDownIcon width={12} height={12} />))} */}
        </div>
        <div className="items-center justify-start hidden px-2 md:flex hover:text-high-emphesis">
          {i18n._(t`Allocation`)}
        </div>
        <div className="flex items-center justify-end px-4 cursor-pointer hover:text-high-emphesis">
          {i18n._(t`APR`)}
          {/* {sortConfig &&
            sortConfig.key === 'roiPerYear' &&
            ((sortConfig.direction === 'ascending' && <ChevronUpIcon width={12} height={12} />) ||
              (sortConfig.direction === 'descending' && <ChevronDownIcon width={12} height={12} />))} */}
        </div>
      </div>
      <div className="flex-col mt-2">
        {items
          .filter((a) => a.pair.token1)
          .sort((a, b) => b.allocPoint - a.allocPoint)
          .map((farm, index) => (
            <FarmListItem2 key={index} farm={farm} />
          ))}
        {items
          .filter((a) => !a.pair.token1)
          .sort((a, b) => b.allocPoint - a.allocPoint)
          .map((farm, index) => (
            <FarmListItem2 key={index} farm={farm} />
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
