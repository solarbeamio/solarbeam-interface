import { IconProps } from 'react-feather'
import React, { FC, useState } from 'react'

import Image from '../Image'
import { classNames } from '../../functions'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export type LogoProps = {
  srcs: string[]
  width: string | number
  height: string | number
  alt?: string
} & IconProps

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
const Logo: FC<LogoProps> = ({ srcs, width, height, style, alt = '', className, ...rest }) => {
  const [, refresh] = useState<number>(0)
  let src = srcs.find((src) => !BAD_SRCS[src])
  src = alt == 'SOLAR' ? '/images/tokens/solar.png' : src
  return (
    <div className="rounded" style={{ width, height }}>
      <Image
        src={src || 'https://raw.githubusercontent.com/sushiswap/icons/master/token/unknown.png'}
        width={width}
        height={height}
        alt={alt}
        layout="fixed"
        className={classNames('rounded', className)}
        style={style}
        quality={50}
        {...rest}
      />
    </div>
  )
}

export default Logo
