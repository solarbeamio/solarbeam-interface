import Badge from '../../components/Badge'
import { ChainId } from '../../sdk'
import NavLink from '../../components/NavLink'
import React from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'

const MenuItem = ({ href, title }) => {
  const { i18n } = useLingui()
  return (
    <NavLink
      exact
      href={href}
      activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-yellow-dark-900"
    >
      <a className="flex items-center justify-between px-6 py-6  text-base font-bold border border-transparent rounded cursor-pointer bg-dark-800">
        {i18n._(t`${title}`)}
      </a>
    </NavLink>
  )
}
const Menu = ({ positionsLength }) => {
  const { account, chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  return (
    <div className={`grid grid-cols-12`}>
      <div className="col-span-12 flex flex-col space-y-4">
        <MenuItem href="/farm" title="All Farms" />
        {account && positionsLength > 0 && <MenuItem href={`/farm?filter=my`} title={`My Farms`} />}
        {/* <MenuItem href="/farm?filter=solar" title="SOLAR Farms" />
        <MenuItem href="/farm?filter=moonriver" title="MOVR Farms" />
        <MenuItem href="/farm?filter=stables" title="Stables Farms" />
        <MenuItem href="/farm?filter=single" title="Single Asset" /> */}
      </div>
    </div>
  )
}

export default Menu
