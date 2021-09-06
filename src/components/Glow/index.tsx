const Glow = ({ maxWidth = true, opacity = '1', children }) => {
  return (
    <div className={`relative w-full`}>
      <div
        style={{ filter: `blur(30px) opacity(${opacity})`, WebkitTransform: 'translateZ(0)', WebkitPerspective: '1000', WebkitBackfaceVisibility: 'hidden' }}
        className="absolute top-1/4  bottom-1/4 bg-yellow w-full rounded-full z-0"
      />
      <div className="relative filter drop-shadow">{children}</div>
    </div>
  )
}

export default Glow
