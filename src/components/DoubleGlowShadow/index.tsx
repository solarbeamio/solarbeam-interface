const DoubleGlowShadow = ({ maxWidth = true, opacity = '1', children }) => {
  return (
    <div className={`relative w-full ${maxWidth ? 'max-w-2xl' : ''}`}>
      <div
        style={{
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          WebkitPerspective: '1000',
          WebkitBackfaceVisibility: 'hidden',
          filter: `blur(150px) opacity(${opacity})`,
        }}
        className="absolute top-1/4 -left-1 bg-yellow bottom-4 w-3/5 rounded-full z-0 hidden sm:block"
      />
      <div
        style={{
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          WebkitPerspective: '1000',
          WebkitBackfaceVisibility: 'hidden',
          filter: `blur(150px) opacity(${opacity})`,
        }}
        className="absolute bottom-1/4 -right-1 bg-yellow top-4 w-3/5 rounded-full z-0 hidden sm:block"
      />
      <div className="relative filter drop-shadow">{children}</div>
    </div>
  )
}

export default DoubleGlowShadow
