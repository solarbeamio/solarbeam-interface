const Main = ({ children }) => (
  <main
    className="flex flex-col items-center justify-start flex-grow w-full h-full z-4 px-2 sm:py-8 md:py-12"
    style={{ height: 'max-content' }}
  >
    {children}
  </main>
)

export default Main
