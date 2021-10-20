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
  const router = useRouter()
  const projects: any[] = [
    {
      status: 'upcoming',
      name: 'PolkaPet World',
      symbol: '$PETS',
      raise: '$ 100,000',
      logo: '/eclipse/polkapet/logo.png',
      teaser: '/eclipse/polkapet/teaser.mp4',
      starts: 'October 28th 2021',
      readmore: 'https://solarbeam.medium.com/eclipse-ido-partnership-pets-polkapets-world-8e746af1e7b2',
      website: 'https://www.polkapet.world/',
    },
  ]

  const goToLink = (link) => {
    window.open(link, '_blank').focus()
  }

  const filter = router.query['filter'] || ''

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
                <Typography variant="hero" className={'font-bold sm:mt-5 text-white'}>
                  Eclipse
                </Typography>
                <Typography variant="base" className={'max-w-xl text-gray-400'}>
                  Be the first to join Eclipse, a launchpad built for cross-chain token pools and auctions, enabling
                  projects to raise capital on a decentralized and interoperable environment based on Moonriver
                </Typography>
                <a
                  href="https://solarbeam.medium.com/solarbeam-eclipse-everything-you-need-to-know-4812b00065c9"
                  target="_blank"
                  rel="noreferrer"
                  className={'underline mt-1'}
                >
                  Read more
                </a>
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
                      href={'/eclipse?filter=upcoming'}
                      activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900"
                    >
                      <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                        Upcoming
                      </a>
                    </NavLink>
                    <NavLink
                      exact
                      href={'/eclipse?filter=closed'}
                      activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900"
                    >
                      <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                        Closed
                      </a>
                    </NavLink>
                    <NavLink
                      exact
                      href={'/eclipse?filter=my'}
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
                  {projects.filter((r) => r.status == filter).length == 0 && (
                    <>
                      {filter && (
                        <Typography variant="base" className={'max-w-xl m-auto text-center mb-2 text-gray-400'}>
                          No data
                        </Typography>
                      )}
                      {!filter && (
                        <div className="space-y-4 mt-10 p-6 mb-20 flex flex-col justify-center">
                          <Typography variant="base" className={'max-w-xl m-auto text-center mb-2 text-gray-400'}>
                            Want to see your project here?
                            <br />
                            <a
                              href="https://forms.gle/oik9pbenvwFjMndg9"
                              target="_blank"
                              rel="noreferrer"
                              className={
                                'underline font-extrabold bg-clip-text text-transparent bg-gradient-to-l from-purple to-dark-purple mt-2'
                              }
                            >
                              Click here to apply for Eclipse.
                            </a>
                          </Typography>
                        </div>
                      )}
                    </>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((r) => r.status == filter)
                      .map((p, i) => (
                        <Disclosure key={i}>
                          {({ open }) => (
                            <div className="mb-4">
                              <Disclosure.Button
                                className={classNames(
                                  open && '',
                                  'w-full text-left rounded cursor-pointer select-none bg-dark-800  text-primary text-sm md:text-lg'
                                )}
                              >
                                <div>
                                  <video src={p.teaser} autoPlay loop muted controls={false} />
                                </div>
                                <div className="px-4 py-6 -mt-24">
                                  <div className="grid grid-cols-1 space-y-4">
                                    <div className="flex">
                                      <div className={`flex flex-row justify-center items-center`}>
                                        <Image
                                          src={p.logo}
                                          width="60px"
                                          height="60px"
                                          className="rounded-full bg-white"
                                          layout="fixed"
                                          alt={p.name}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex flex-col">
                                      <Typography variant="h3" className="font-bold  mt-2">
                                        {p.name}
                                      </Typography>
                                      <Typography variant="base"> {p.symbol}</Typography>
                                    </div>
                                    <div className="flex flex-col">
                                      <Typography variant="base">Total raise</Typography>
                                      <Typography variant="lg" className="font-bold">
                                        {p.raise}
                                      </Typography>
                                    </div>
                                    <div className="flex flex-col">
                                      <Typography variant="base">Starts on</Typography>
                                      <Typography variant="lg" className="font-bold">
                                        {p.starts}
                                      </Typography>
                                    </div>
                                    <div className="flex sm:flex-row justify-between space-x-3">
                                      <a
                                        href={p.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={
                                          'hover:underline hover:font-extrabold bg-clip-text text-transparent bg-gradient-to-l from-purple to-dark-purple mt-2'
                                        }
                                      >
                                        Project Website
                                      </a>
                                      <a
                                        href={p.readmore}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={
                                          'hover:underline hover:font-extrabold bg-clip-text text-transparent bg-gradient-to-l from-purple to-dark-purple mt-2'
                                        }
                                      >
                                        Official announcement
                                      </a>
                                    </div>
                                  </div>
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
