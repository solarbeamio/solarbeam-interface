import styled from 'styled-components'
import MenuAnalytics from '../MenuAnalytics'
import PinnedData from '../PinnedData'
import { useHistory } from 'react-router-dom'
import React from 'react'

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: ${({ open }) => (open ? '220px 1fr 200px' : '220px 1fr 64px')};

  @media screen and (max-width: 1400px) {
    grid-template-columns: 220px 1fr;
  }

  @media screen and (max-width: 1080px) {
    grid-template-columns: 1fr;
    max-width: 100vw;
    overflow: hidden;
    grid-gap: 0;
  }
`

const Center = styled.div`
  height: 100%;
  z-index: 9999;
  transition: width 0.25s ease;
  background-color: ${({ theme }) => theme.onlyLight};
`

const Right = styled.div`
  position: fixed;
  right: 0;
  bottom: 0rem;
  z-index: 99;
  width: ${({ open }) => (open ? '220px' : '64px')};
  height: ${({ open }) => (open ? 'fit-content' : '64px')};
  overflow: auto;
  background-color: ${({ theme }) => theme.bg1};
  @media screen and (max-width: 1400px) {
    display: none;
  }
`


export default function LayoutWrapperAnalytics({ children, savedOpen, setSavedOpen }) {
  const history = useHistory()
  // @ts-ignore
  return (
    <>
    <div className="p-4 space-y-3 rounded bg-dark-900" style={{ zIndex: 1 }}>
        {/*<MenuAnalytics history={history} />*/}
        <div
          className="space-y-4"
          // style={{ rowGap: 10, justifyContent: 'space-between' }}
        >
          {children}
        </div>
        {/*<Right open={savedOpen}>*/}
        {/*<PinnedData history={history} open={savedOpen} setSavedOpen={setSavedOpen} />*/}
        {/*</Right>*/}
      </div>
    </>
  )
}