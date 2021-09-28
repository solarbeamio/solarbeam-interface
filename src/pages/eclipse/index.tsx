/* eslint-disable @next/next/link-passhref */

import Head from 'next/head'
import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useLingui } from '@lingui/react'

export default function NFTLaunchpad(): JSX.Element {
  return (
    <>
      <Head>
        <title>Eclipse | Solarbeam</title>
        <meta key="description" name="description" content="Eclipse" />
      </Head>

      <div className="container px-0 mx-auto pb-6">
        <div className={`mb-2 grid grid-cols-12 gap-4`}>
          <div className="flex justify-center items-center col-span-12 lg:justify">
            <Link href="/eclipse">Coming sooo0n</Link>
          </div>
        </div>
      </div>
    </>
  )
}
