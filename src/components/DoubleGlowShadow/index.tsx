import { classNames } from '../../functions'
import Image from 'next/image'

const DoubleGlowShadow = ({ maxWidth = true, opacity = '0.5', children, className = '' }) => {
  return (
    <div
      style={{
        height: 'calc(100vmin - 30px)',
      }}
      className={classNames(`force-gpu relative w-full ${maxWidth ? 'max-w-2xl' : ''}`, className)}
    >
      <div
        style={{
          position: `fixed`,
          left: '50%',
          transform: 'translateX(-50%)',
          top: 0,
          height: 'calc(100vmin - 30px)',
          width: 'calc(100vmin - 30px)',
        }}
      >
        <div
          style={{
            filter: `blur(150px) opacity(${opacity})`,
          }}
          className="absolute top-1/4 -left-1 bg-light-purple bottom-4 w-3/5 rounded-full z-0 hidden sm:block"
        />
        <div
          style={{
            filter: `blur(150px) opacity(${opacity})`,
          }}
          className="absolute bottom-1/4 -right-1 bg-purple top-4 w-3/5 rounded-full z-0 hidden sm:block"
        />
      </div>
      <div className="relative filter drop-shadow pt-20">{children}</div>
    </div>
  )
}

export default DoubleGlowShadow
