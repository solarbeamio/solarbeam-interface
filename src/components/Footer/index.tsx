import { ANALYTICS_URL } from '../../constants'
import { ChainId } from '../../sdk'
import ExternalLink from '../ExternalLink'
import Polling from '../Polling'
import { t } from '@lingui/macro'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import React from 'react'
import NavLink from '../NavLink'

const Footer = () => {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  return (
    <footer className="flex-shrink-0 w-full mt-8 sm:mt-0">
      <div className="flex items-center justify-between h-20 px-4 ">
        <NavLink href="https://analytics.solarbeam.io" external={true}>
          <a
            id={`swap-nav-link`}
            className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
          >
            {i18n._(t`Analytics`)}
          </a>
        </NavLink>
      </div>
    </footer>
  )
}

export default Footer
