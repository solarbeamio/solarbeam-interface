/* eslint-disable @next/next/link-passhref */

import Head from 'next/head'
import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { formatNumberScale } from '../../functions'
import Button from '../../components/Button'

export default function Faucet(): JSX.Element {
  return (
    <>
      <Head>
        <title>Faucet | Solarbeam</title>
        <meta key="description" name="description" content="NFT Launchpad" />
      </Head>

      <div className="container px-0 mx-auto pb-6">
        <div className={`mb-2 grid grid-cols-12 gap-4`}>
          <div className="flex justify-center items-center col-span-12 lg:justify">
            <Button color="gradient" className="text-emphasis text-yellow" variant={'flexed'} size={'nobase'}>
              Faucet
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
