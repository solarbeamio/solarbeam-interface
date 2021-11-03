export const SolarEclipse = () => {
  return (
    <div className="flex container px-0 z-0 mx-auto -mt-72 justify-end">
      <div className="flex w-full  justify-end space-x-4">
        <div className="flex flex-1 justify-end ">
          <div className={`force-gpu relative w-[600px]`}>
            <div
              style={{
                filter: `blur(120px) opacity(0.3)`,
              }}
              className="absolute top-1/4 -left-1 bg-light-purple bottom-4 w-full rounded-full z-0 "
            />
            <div
              style={{
                filter: `blur(120px) opacity(0.3)`,
              }}
              className="absolute bottom-1/4 -right-1 bg-purple top-4 w-full rounded-full z-0"
            />
            <div className="relative filter drop-shadow">
              <div className="rounded-full h-[600px] w-[600px] flex items-center justify-center bg-dark-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
