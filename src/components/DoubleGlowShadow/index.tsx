import { classNames } from '../../functions'
import Image from 'next/image'

const DoubleGlowShadow = ({ maxWidth = true, opacity = '0.6', children }) => {
  return (
    <div className={`force-gpu relative w-full ${maxWidth ? 'max-w-2xl' : ''}`}>
      {/* <div style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }}>
        <Image src="/radial.svg" alt="Radial" layout="fill" aria-hidden="true" />
      </div> */}
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
      <div className="relative filter drop-shadow">{children}</div>
    </div>
  )
}

export default DoubleGlowShadow
