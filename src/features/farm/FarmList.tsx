import Dots from '../../components/Dots'
import FarmListItem2 from './FarmListItem2'
import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import useSortableData from '../../hooks/useSortableData'
import { useRouter } from 'next/router'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

const FarmList = ({ farms, term }) => {
  const { query } = useRouter()
  const { items } = useSortableData(farms)
  const { i18n } = useLingui()

  const singlePools = items.filter((i) => i.pair.token1).sort((a, b) => b.allocPoint - a.allocPoint)
  const liquidityPools = items.filter((i) => !i.pair.token1).sort((a, b) => b.allocPoint - a.allocPoint)
  const pools = singlePools.concat(liquidityPools)

  return items ? (
    <>
      <div className="grid grid-cols-4 text-base text-high-emphesis">
        <div className="flex items-center col-span-2 px-4 cursor-pointer md:col-span-1">
          <div className="hover:text-white">{i18n._(t`Liquidity`)}</div>
          {/* {sortConfig &&
            sortConfig.key === 'symbol' &&
            ((sortConfig.direction === 'ascending' && <ChevronUpIcon width={12} height={12} />) ||
              (sortConfig.direction === 'descending' && <ChevronDownIcon width={12} height={12} />))} */}
        </div>
        <div className="flex items-center px-2 cursor-pointer hover:text-white">
          {i18n._(t`TVL`)}
          {/* {sortConfig &&
            sortConfig.key === 'tvl' &&
            ((sortConfig.direction === 'ascending' && <ChevronUpIcon width={12} height={12} />) ||
              (sortConfig.direction === 'descending' && <ChevronDownIcon width={12} height={12} />))} */}
        </div>
        <div className="items-center justify-start hidden px-2 md:flex hover:text-white">
          {i18n._(t`Allocation`)}
        </div>
        <div className="flex items-center justify-end px-4 cursor-pointer hover:text-white">
          {i18n._(t`APR`)}
          {/* {sortConfig &&
            sortConfig.key === 'roiPerYear' &&
            ((sortConfig.direction === 'ascending' && <ChevronUpIcon width={12} height={12} />) ||
              (sortConfig.direction === 'descending' && <ChevronDownIcon width={12} height={12} />))} */}
        </div>
      </div>
      <div className="flex-col mt-2">
        {pools.map((farm, index) => (
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
