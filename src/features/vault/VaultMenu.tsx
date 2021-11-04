import Badge from '../../components/Badge'
import { ChainId } from '../../sdk'
import NavLink from '../../components/NavLink'
import React from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import Search from '../../components/Search'

const MenuItem = ({ href, title }) => {
  const { i18n } = useLingui()
  return (
    <NavLink exact href={href} activeClassName="bg-light-glass rounded-xl text-high-emphesis">
      <a className="flex items-center justify-between px-5 py-1.5 text-base rounded-xl cursor-pointer">{title}</a>
    </NavLink>
  )
}
const Menu = ({ positionsLength }) => {
  const { account } = useActiveWeb3React()
  const { i18n } = useLingui()
  return (
    <div className={`col-span-6 p-2  rounded-xxl flex bg-dark-700 flex-col md:flex-row md:space-x-2`}>
      <MenuItem href="/vaults" title={i18n._(t`All vaults`)} />
      <MenuItem href={`/vaults?filter=my`} title={i18n._(t`My vaults`)} />
    </div>
  )
}

export default Menu
