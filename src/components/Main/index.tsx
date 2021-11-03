const Main = ({ children }) => (
  <main
    className="flex flex-col items-center justify-start flex-grow w-full h-full z-4 "
    style={{ height: 'max-content', marginTop: '-88px' }}
  >
    {children}
  </main>
)

export default Main
