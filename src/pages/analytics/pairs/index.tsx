/* eslint-disable @next/next/link-passhref */

import Head from 'next/head'
import Link from 'next/link'
import SolarbeamLogo from '../../../components/SolarbeamLogo'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import Card from '../../../components/Card'
import LayoutWrapperAnalytics from '../../../components/LayoutWrapperAnalytics'
import QuestionHelper from '../../../components/QuestionHelper'
import React, { useState } from 'react'
import AnalyticsItem from '../../../components/AnalyticsItem'
import Checkbox2 from '../../../components/Checkbox2'
import PairList from '../../../components/PairList'
import { t } from '@lingui/macro'
import { i18n } from '@lingui/core'

export default function AnalyticsPairs(): JSX.Element{
  const  allPairs  = {}

  // for tracked data on pairs
  const [useTracked, setUseTracked] = useState(true)
  const [savedOpen, setSavedOpen] = useState(false)
  return (
    <>
      <Head>
        <title>Analytics | Solarbeam</title>
        <meta key='description' name='description' content='Analytics' />
      </Head>

      <div className='container px-0 mx-auto pb-6'>
        <div className={`mb-2 pb-4 grid grid-cols-12 gap-4`}>
          <div className='flex justify-center items-center col-span-12 lg:justify'>
            <Link href='/farm'>
              <SolarbeamLogo />
            </Link>
          </div>
        </div>

        <DoubleGlowShadow maxWidth={false} opacity={'0.4'}>
          <div className={`grid grid-cols-12 gap-2 min-h-1/2`}>
            <div className={`col-span-12`}>
              <Card className='bg-dark-900 z-4'>
                <LayoutWrapperAnalytics savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  {/*@ts-ignore*/}
                  <AnalyticsItem
                    title={`${i18n._(t`Top Tokens`)}`}
                    //@ts-ignore
                    subTitle={
                      <>
                        <Checkbox2
                          setChecked={() => setUseTracked(!useTracked)}
                          checked={useTracked}
                          text={'Hide untracked pairs'}
                        />
                        <QuestionHelper
                          text='USD amounts may be inaccurate in low liquiidty pairs or pairs without ETH or stablecoins.' />
                      </>
                    }
                  >
                    {/*@ts-ignore*/}
                    <PairList pairs={allPairs} useTracked={useTracked} />
                    {/*</Panel>*/}
                  </AnalyticsItem>
                </LayoutWrapperAnalytics>
              </Card>
            </div>
          </div>
        </DoubleGlowShadow>
      </div>
    </>
  )
}