import styled from 'styled-components'
import { transparentize } from 'polished'
import { TrendingUp, List, PieChart, Disc } from 'react-feather'
import { t } from '@lingui/macro'
import React from 'react'
import { useLingui } from '@lingui/react'
import NavLink from '../NavLink'
import Typography from '../Typography'

const Wrapper = styled.div`
  height: ${({ isMobile }) => (isMobile ? 'initial' : '100vh')};
    //background-color: ${({ theme }) => transparentize(0.4, theme.bg1)};
  color: ${({ theme }) => theme.text1};
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  position: sticky;
  top: 0px;
  z-index: 9999;
  box-sizing: border-box;
  /* background-color: #1b1c22; */
  //background: linear-gradient(193.68deg, #1b1c22 0.68%, #000000 100.48%);
  color: ${({ theme }) => theme.bg2};

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }

  @media screen and (max-width: 600px) {
    padding: 1rem;
  }
`

const Option = styled.div`
  font-weight: 500;
  font-size: 14px;
  opacity: ${({ activeText }) => (activeText ? 1 : 0.6)};
  color: ${({ theme }) => theme.white};
  display: flex;

  :hover {
    opacity: 1;
  }
`

const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const MenuItem = ({ href, title, icon }) => {
  const { i18n } = useLingui()
  return (
    <NavLink
      activeClassName="font-bold border rounded text-high-emphesis border-dark-700 bg-dark-700"
      exact
      href={href}
    >
      <a className="flex items-center justify-center px-4 text-base font-medium text-center rounded-md text-secondary hover:text-high-emphesis ">
        {icon}
        <Typography component="h1" variant="lg">
          {i18n._(t`${title}`)}
        </Typography>
      </a>
    </NavLink>
  )
}

export default function MenuAnalytics({ history }) {


  return (
    <div className="flex items-center justify-center mb-4 space-x-3">
      <div className="grid grid-cols-3 rounded p-3px bg-dark-800 h-[46px]">
        <MenuItem href="/analytics/home" title="Overview" icon={<TrendingUp size={20} style={{ marginRight: '.75rem' }} />}/>
        <MenuItem href="/analytics/tokens" title="Tokens" icon={<Disc size={20} style={{ marginRight: '.75rem' }} />}/>
        <MenuItem href="/analytics/pairs" title="Pairs" icon={<PieChart size={20} style={{ marginRight: '.75rem' }} />}/>
      </div>
    </div>
  )
}
