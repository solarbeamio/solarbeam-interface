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
import Search from '../../components/Search'
import Button from '../../components/Button'

export default function NFTLaunchpad(): JSX.Element {
  const projects: any[] = []

  return (
    <>
      <Head>
        <title>Eclipse | Solarbeam</title>
        <meta key="description" name="description" content="Eclipse" />
      </Head>

      <div className="flex container px-0 z-0 mx-auto -mt-96 justify-end">
        <div className="flex w-full  justify-end space-x-4">
          <div className="flex flex-1 justify-end ">
            <div className={`force-gpu relative w-[600px]`}>
              <div
                style={{
                  filter: `blur(120px) opacity(0.3)`,
                }}
                className="absolute top-1/4 -left-1 bg-light-purple bottom-4 w-full rounded-full z-0 "
              />
              <div
                style={{
                  filter: `blur(120px) opacity(0.3)`,
                }}
                className="absolute bottom-1/4 -right-1 bg-purple top-4 w-full rounded-full z-0"
              />
              <div className="relative filter drop-shadow">
                <div className="rounded-full h-[600px] w-[600px] flex items-center justify-center bg-dark-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-0 mx-auto pb-6 -mt-48">
        <div className="relative w-full">
          <div className={`grid grid-cols-12 gap-2 min-h-1/2`}>
            <div className={`col-span-12`}>
              <div className={'container p-6 md:p-0 justify-center flex flex-col mb-5 md:mb-20'}>
                <Typography variant="hero" className={'font-bold mt-5 text-white'}>
                  Eclipse
                </Typography>
                <Typography variant="base" className={'max-w-xl text-gray-400'}>
                  Be the first to join Eclipse, a launchpad built for cross-chain token pools and auctions, enabling
                  projects to raise capital on a decentralized and interoperable environment based on Moonriver.
                </Typography>
                {/* <a
                  href="https://forms.gle/oik9pbenvwFjMndg9"
                  target="_blank"
                  rel="noreferrer"
                  className={
                    'underline mt-1'
                  }
                >
                  How it work?
                </a> */}
              </div>

              <Card className="bg-dark-900 z-4 rounded">
                <div className={`flex md:flex-row flex-col space-y-4 md:space-x-8 md:space-y-0`}>
                  <div className={'col-span-5 p-2.5 rounded flex bg-dark-700 flex-col md:flex-row md:space-x-2'}>
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
                      href={'/eclipse?upcoming'}
                      activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900"
                    >
                      <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                        Upcoming
                      </a>
                    </NavLink>
                    <NavLink
                      exact
                      href={'/eclipse?closed'}
                      activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900"
                    >
                      <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                        Closed
                      </a>
                    </NavLink>
                    <NavLink
                      exact
                      href={'/eclipse?my'}
                      activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900"
                    >
                      <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                        Participated
                      </a>
                    </NavLink>
                  </div>
                  <div className={'flex flex-1 p-2 rounded flex bg-dark-800 flex-col md:flex-row md:space-x-2'}>
                    <Search
                      className={'bg-dark-800 rounded border border-dark-800'}
                      placeholder={'Search by name, symbol or address'}
                      term={''}
                      search={(value: string): void => {}}
                    />
                  </div>
                </div>
                <div className="mt-12 min-h-[400px]">
                  {projects.length == 0 && (
                    <div className="space-y-4 mt-10 p-6 mb-20 flex flex-col justify-center">
                      <>
                        <div
                          className="flex justify items-center mt-10 mb-10 m-auto"
                          style={{ minHeight: 40, opacity: 0.2 }}
                        >
                          <Image src="/icons/suzu-spaceship.png" alt="Solarbeam" width={280} height={200} />
                        </div>
                      </>
                      <Typography variant="base" className={'max-w-xl m-auto text-center mb-2 text-gray-400'}>
                        Applications for Eclipse are now open!
                        <br />
                        <a
                          href="https://forms.gle/oik9pbenvwFjMndg9"
                          target="_blank"
                          rel="noreferrer"
                          className={
                            'underline font-extrabold bg-clip-text text-transparent bg-gradient-to-l from-purple to-dark-purple mt-2'
                          }
                        >
                          Click here to apply.
                        </a>
                      </Typography>
                    </div>
                  )}
                  <div className="grid grid-cols-4">
                    {projects.map((p, i) => (
                      <Disclosure key={i}>
                        {({ open }) => (
                          <div className="mb-4">
                            <Disclosure.Button
                              className={classNames(
                                open && '',
                                'w-full px-4 py-6 text-left rounded cursor-pointer select-none bg-dark-800  text-primary text-sm md:text-lg'
                              )}
                            >
                              <div className="grid grid-cols-1">
                                <div className="flex">
                                  <div className={`flex flex-row justify-center items-center space-x-3`}>
                                    <Image
                                      src={`/images/tokens/${p.logo}.png`}
                                      width="60px"
                                      height="60px"
                                      className="rounded-full bg-white"
                                      layout="fixed"
                                      alt={p.name}
                                    />
                                    <Typography variant="lg" className={'text-center'}>
                                      {p.name}
                                    </Typography>
                                  </div>
                                </div>
                                <div className="flex flex-col justify-center">{p.method}</div>
                                <div className="flex flex-col justify-center">{p.price}</div>
                                <div className="flex flex-col justify-center">{p.raise}</div>
                                <div className="flex flex-col justify-center">{p.duration}</div>
                                <div className="flex flex-col justify-center">{p.filled}</div>
                              </div>
                            </Disclosure.Button>
                          </div>
                        )}
                      </Disclosure>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
