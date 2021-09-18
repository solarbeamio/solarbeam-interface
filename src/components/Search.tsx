import React from 'react'
import { Search as SearchIcon } from 'react-feather'
import { classNames } from '../functions'

export default function Search({
  term,
  search,
  placeholder,
  className = 'bg-dark-700',
  inputProps = {
    className:
      'text-baseline bg-transparent w-full py-3 pl-4 pr-14 rounded w-full bg-transparent focus:outline-none bg-dark-700 rounded',
  },
  ...rest
}: {
  term: string
  search: (value: string) => void
  placeholder?: string
  inputProps?: any
  className?: string
}) {
  return (
    <div className={classNames('relative w-full rounded', className)} {...rest}>
      <input
        className={classNames(
          inputProps.className || 'text-baseline py-3 pl-4 pr-14 rounded w-full bg-transparent focus:outline-none'
        )}
        onChange={(e) => search(e.target.value)}
        value={term}
        placeholder={placeholder}
        {...inputProps}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
        <SearchIcon size={16} />
      </div>
    </div>
  )
}
