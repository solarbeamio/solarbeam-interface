import { ChainId } from '../../sdk'
import React from 'react'

import Image from 'next/image'
import Link from 'next/link'
import More from './More'
import NavLink from '../NavLink'
import { Popover } from '@headlessui/react'
import Web3Status from '../Web3Status'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import TokenStats from '../TokenStats'
import LanguageSwitch from '../LanguageSwitch'
import { classNames } from '../../functions'

function AppBar(): JSX.Element {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()

  return (
    <header className="flex-shrink-0 z-10  w-full bg-dark-1000 sm:bg-transparent">
      <Popover as="nav" className="z-10 w-full">
        {({ open }) => (
          <>
            <div
              className={classNames(
                open ? 'header-border-none' : 'header-border-b',
                'px-4 py-4 sm:py-6 pr-6 items-center sm:header-border-none'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="hidden sm:flex sm:ml-4 space-x-10 items-center">
                    <Image
                      onClick={() => window.open('https://app.solarbeam.io', '_parent')}
                      src={'/solarbeam-text.png'}
                      alt="solarbeam_logo"
                      width="177"
                      height="34"
                      layout="fixed"
                      className="cursor-pointer"
                    />
                    <div className="flex space-x-4">
                      <NavLink href="/exchange/swap">
                        <a
                          id={`swap-nav-link`}
                          className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap"
                        >
                          {i18n._(t`Swap`)}
                        </a>
                      </NavLink>
                      <NavLink href="/exchange/pool">
                        <a
                          id={`pool-nav-link`}
                          className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap"
                        >
                          {i18n._(t`Pool`)}
                        </a>
                      </NavLink>
                      <NavLink href={'/farm'}>
                        <a
                          id={`farm-nav-link`}
                          className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap"
                        >
                          {i18n._(t`Farm`)}
                        </a>
                      </NavLink>
                      <NavLink href={'/farm-v2'}>
                        <a
                          id={`farm-nav-link`}
                          className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap"
                        >
                          {i18n._(t`Farm V2`)}
                        </a>
                      </NavLink>
                      <NavLink href={'/vaults'}>
                        <a
                          id={`vaults-nav-link`}
                          className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap"
                        >
                          {i18n._(t`Vaults`)}
                        </a>
                      </NavLink>
                      <NavLink href={'/locker'}>
                        <a
                          id={`farm-nav-link`}
                          className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap"
                        >
                          {i18n._(t`Locker`)}
                        </a>
                      </NavLink>
                      <NavLink href={'/bridge'}>
                        <a className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap">
                          {i18n._(t`Bridge`)}
                        </a>
                      </NavLink>
                      <NavLink href={'/eclipse'}>
                        <a className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap">
                          {i18n._(t`Eclipse`)}
                        </a>
                      </NavLink>
                      <NavLink href="https://analytics.solarbeam.io">
                        <a
                          target="_blank"
                          id={`swap-nav-link`}
                          className="p-2 text-base text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap"
                        >
                          {i18n._(t`Analytics`)}
                        </a>
                      </NavLink>
                    </div>
                  </div>
                </div>

                <div className="fixed bottom-0 left-0 z-10 flex flex-row items-center justify-center w-full p-4 lg:w-auto bg-dark-1000 lg:relative lg:p-0 lg:bg-transparent">
                  <div className="flex items-center justify-between w-full space-x-2 sm:justify-end">
                    {chainId && [ChainId.MOONRIVER].includes(chainId) && (
                      <div className="w-auto flex items-center rounded mr-1 bg-dark-800 shadow-sm text-primary text-xs hover:bg-dark-700 whitespace-nowrap text-xs font-bold cursor-pointer select-none pointer-events-auto hidden sm:block">
                        <TokenStats token="MOVR" />
                      </div>
                    )}
                    {chainId && [ChainId.MOONRIVER].includes(chainId) && (
                      <div className="w-auto flex items-center rounded mr-1 bg-dark-800 shadow-sm text-primary text-xs hover:bg-dark-700 whitespace-nowrap text-xs font-bold cursor-pointer select-none pointer-events-auto">
                        <TokenStats token="SOLAR" />
                      </div>
                    )}
                    <div className="w-auto flex items-center rounded bg-transparent shadow-sm text-primary text-xs hover:bg-dark-900 whitespace-nowrap text-xs font-bold cursor-pointer select-none pointer-events-auto">
                      <Web3Status />
                    </div>
                    <div className="hidden md:block">
                      <LanguageSwitch />
                    </div>
                    <More />
                  </div>
                </div>
                <div className="flex flex-1 -mr-2 sm:hidden items-center">
                  <div className="flex-1 flex items-center">
                    <Image
                      onClick={() => window.open('https://app.solarbeam.io', '_parent')}
                      src={'/solarbeam-text.png'}
                      alt="solarbeam_logo"
                      width="177"
                      height="34"
                      layout="fixed"
                      className="sm:hidden cursor-pointer"
                    />
                  </div>
                  <LanguageSwitch />
                  <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-high-emphesis focus:outline-none">
                    <span className="sr-only">{i18n._(t`Open main menu`)}</span>
                    {open ? (
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    )}
                  </Popover.Button>
                </div>
              </div>
            </div>

            <Popover.Panel className="sm:hidden header-border-b">
              <div className="flex flex-col px-4 pt-2 pb-3 space-y-1">
                <Link href={'/exchange/swap'}>
                  <a
                    id={`swap-nav-link`}
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Swap`)}
                  </a>
                </Link>
                <Link href={'/exchange/pool'}>
                  <a
                    id={`pool-nav-link`}
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Pool`)}
                  </a>
                </Link>
                <Link href={'/farm'}>
                  <a
                    id={`farm-nav-link`}
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Farm`)}
                  </a>
                </Link>
                <Link href={'/vaults'}>
                  <a
                    id={`vaults-nav-link`}
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Vaults`)}
                  </a>
                </Link>
                <Link href={'/locker'}>
                  <a
                    id={`farm-nav-link`}
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Locker`)}
                  </a>
                </Link>
                <Link href={'/bridge'}>
                  <a className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap">
                    {i18n._(t`Bridge`)}
                  </a>
                </Link>
                <Link href={'/eclipse'}>
                  <a className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap">
                    {i18n._(t`Eclipse`)}
                  </a>
                </Link>
                <Link href="https://analytics.solarbeam.io">
                  <a
                    target="_blank"
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Analytics`)}
                  </a>
                </Link>
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </header>
  )
}

export default AppBar
