import React, { FC, useCallback, useState } from 'react'
import { QuestionMarkCircleIcon as SolidQuestionMarkCircleIcon } from '@heroicons/react/solid'
import { RewardTooltip } from '../Tooltip'

const QuestionHelper: FC<{ text: any }> = ({ children, text }) => {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  if (children) {
    return (
      <RewardTooltip text={text} show={show}>
        <div
          className="flex items-center justify-center outline-none"
          onClick={open}
          onMouseEnter={open}
          onMouseLeave={close}
        >
          {children}
        </div>
      </RewardTooltip>
    )
  }

  return (
    <div className="ml-1 flex">
      <RewardTooltip text={text} show={show}>
        <div
          className="flex items-center justify-center outline-none cursor-help hover:text-primary"
          onClick={open}
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <SolidQuestionMarkCircleIcon width={16} height={16} />
        </div>
      </RewardTooltip>
    </div>
  )
}

export default QuestionHelper
