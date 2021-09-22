import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export default function AnalyticsItem({ children, title, sideTitle }) {
  const { i18n } = useLingui()
  return (
    <div className='space-y-3'>
      {title && (
        <div
          className='flex items-center px-2 cursor-pointer hover:text-high-emphesis text-base font-bold text-primary'>
          {i18n._(t`${title}`)}
        </div>
      )}
      <div
        className={'w-full px-4 py-6 text-left rounded cursor-pointer select-none bg-dark-700  text-primary text-sm md:text-lg'}>
        {children}
      </div>
    </div>
  )
}

