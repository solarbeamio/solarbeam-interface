import { Input as PercentInput } from '../PercentInput'
import React from 'react'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import Button from '../Button'

interface PercentInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  id: string
}

export default function PercentInputPanel({ value, onUserInput, id }: PercentInputPanelProps) {
  const { i18n } = useLingui()
  return (
    <div id={id} className="p-5 rounded bg-dark-800">
      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
        <div className="w-full text-white sm:w-2/5" style={{ margin: 'auto 0px' }}>
          {i18n._(t`Amount to Remove`)}
        </div>
        <div className="flex items-center w-full p-3 space-x-3 text-xl font-bold rounded bg-dark-900 sm:w-3/5">
          <Button onClick={() => onUserInput('100')}>{i18n._(t`MAX`)}</Button>
          <PercentInput
            className="token-amount-input"
            value={value}
            onUserInput={(val) => {
              onUserInput(val)
            }}
            align="right"
          />
          <div className="pl-2 text-xl font-bold">%</div>
        </div>
      </div>
    </div>
  )
}
