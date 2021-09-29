/* eslint-disable @next/next/link-passhref */

import Head from 'next/head'
import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useLingui } from '@lingui/react'
import SolarbeamLogo from '../../components/SolarbeamLogo'
import DoubleGlowShadow from '../../components/DoubleGlowShadow'
import Card from '../../components/Card'
import Typography from '../../components/Typography'
import NavLink from '../../components/NavLink'
import { Disclosure } from '@headlessui/react'
import { classNames } from '../../functions'
import CurrencyLogo from '../../components/CurrencyLogo'
import Image from '../../components/Image'
import IconWrapper from '../../components/IconWrapper'
import { Info } from 'react-feather'

export default function NFTLaunchpad(): JSX.Element {
  const pools = [{}]

  return (
    <>
      <Head>
        <title>Eclipse | Solarbeam</title>
        <meta key="description" name="description" content="Eclipse" />
      </Head>

      <div className="flex container px-0 z-0 mx-auto -mt-64 justify-end">
        <div className="flex w-full  justify-end space-x-4">
          <div className="flex flex-1 justify-end ">
            <div className={`force-gpu relative w-96`}>
              <div
                style={{
                  filter: `blur(140px) opacity(1)`,
                }}
                className="absolute top-1/4 -left-1 bg-light-purple bottom-4 w-full rounded-full z-0 hidden sm:block"
              />
              <div
                style={{
                  filter: `blur(140px) opacity(1)`,
                }}
                className="absolute bottom-1/4 -right-1 bg-purple top-4 w-full rounded-full z-0 hidden sm:block"
              />
              <div className="relative filter drop-shadow">
                <div className="rounded-full h-96 w-96 flex items-center justify-center bg-dark-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-0 mx-auto pb-6 -mt-24">
        <div className={`mb-2 pb-4 grid grid-cols-12 gap-4`}>
          <div className="flex justify-center items-center col-span-12 lg:justify">
            <Link href="/farm">
              <SolarbeamLogo />
            </Link>
          </div>
        </div>
        <div className="relative w-full">
          <div className={`grid grid-cols-12 gap-2 min-h-1/2`}>
            <div className={`col-span-12`}>
              <div className={'justify-center flex flex-col items-center'}>
                <Typography variant="h2" className={'text-center mb-1 text-purple-700 text-opacity-25'}>
                  Eclipse
                </Typography>
                <Typography variant="lg" className={'text-center max-w-2xl'}>
                  Eclipse aims to drive new capital and trade to the exchange by increasing the attractiveness of
                  Solarbeam as a place for token creators and communities to launch new project tokens
                </Typography>
              </div>
              <div className={`mt-10 col-span-12 flex justify-center flex-col md:flex-row md:space-x-2`}>
                <NavLink
                  exact
                  href={'/eclipse'}
                  activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900"
                >
                  <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                    Live
                  </a>
                </NavLink>
                <NavLink
                  exact
                  href={'/locker/create'}
                  activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-yellow-dark-900"
                >
                  <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                    Upcoming
                  </a>
                </NavLink>
                <NavLink
                  exact
                  href={'/locker/create'}
                  activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-yellow-dark-900"
                >
                  <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                    Closed
                  </a>
                </NavLink>
                <NavLink
                  exact
                  href={'/locker/create'}
                  activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-yellow-dark-900"
                >
                  <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                    Participated
                  </a>
                </NavLink>
              </div>

              <Card className="bg-dark-1000 z-4 rounded">
                <div className="mt-10">
                  <div className="grid grid-cols-7 text-base font-bold text-primary mb-2 px-2">
                    <div className="flex items-center col-span-2">Pool name</div>
                    <div className="flex items-center">Type</div>
                    <div className="flex items-center">Swap Ratio</div>
                    <div className="flex items-center">Total raise</div>
                    <div className="flex items-center">Starting</div>
                    <div className="flex items-center">Progress</div>
                  </div>
                  <Disclosure>
                    {({ open }) => (
                      <div className="mb-4">
                        <Disclosure.Button
                          className={classNames(
                            open && '',
                            'w-full px-4 py-6 text-left rounded cursor-pointer select-none bg-dark-900  text-primary text-sm md:text-lg'
                          )}
                        >
                          <div className="grid grid-cols-7 ">
                            <div className="flex col-span-2 ">
                              <div className={`flex flex-row justify-center items-center space-x-3`}>
                                <Image
                                  src={`/images/tokens/polkapets.png`}
                                  width="60px"
                                  height="60px"
                                  className="rounded-full bg-white"
                                  layout="fixed"
                                  alt="polkapets"
                                />
                                <Typography variant="lg" className={'text-center'}>
                                  Polka Pet World
                                </Typography>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center">Overflow</div>
                            <div className="flex flex-col justify-center">1 PPW = 0.30 USDC</div>
                            <div className="flex flex-col justify-center">100,000 USDC</div>
                            <div className="flex flex-col justify-center">3 days</div>
                            <div className="flex flex-col justify-center">100%</div>
                          </div>
                        </Disclosure.Button>
                      </div>
                    )}
                  </Disclosure>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
