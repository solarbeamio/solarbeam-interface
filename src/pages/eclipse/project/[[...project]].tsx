/* eslint-disable @next/next/link-passhref */
import Head from 'next/head'
import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import Card from '../../../components/Card'
import Typography from '../../../components/Typography'
import { classNames, formatNumber, formatPercent, tryParseAmount } from '../../../functions'
import Image from '../../../components/Image'
import { ButtonConfirmed, ButtonError } from '../../../components/Button'
import { ECLIPSE_PROJECTS, PROJECT_STATUS } from '../../../constants/eclipse'
import Back from '../../../components/Back'
import NumericalInput from '../../../components/NumericalInput'
import { ApprovalState, useActiveWeb3React, useApproveCallback } from '../../../hooks'
import { useCurrency } from '../../../hooks/Tokens'
import { SOLAR_ADDRESS, SOLAR_MOVR_PAIR, WNATIVE } from '../../../constants'
import Web3Connect from '../../../components/Web3Connect'
import { AutoRow, RowBetween } from '../../../components/Row'
import Loader from '../../../components/Loader'
import { SolarEclipse } from '../../../features/eclipse/SolarEclipse'
import { AboutProjectTab } from '../../../features/eclipse/AboutProjectTab'
import { ProjectHero } from '../../../features/eclipse/ProjectHero'
import { useEclipse, useEclipseInfo, useEclipsePools, useEclipseUserInfo } from '../../../features/eclipse/hooks'
import { useBlockNumber } from '../../../state/application/hooks'
import { useV2PairsWithPrice } from '../../../hooks/useV2Pairs'
import { useCurrencyBalance } from '../../../state/wallet/hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'

const Menu = ({ children }) => {
  return (
    <div className="border border-b-1 border-t-0 border-r-0 border-l-0 border-dark-500 ">
      <div className={`pt-1 flex md:flex-row flex-col md:space-x-10 space-y-4 md:space-x-8 md:space-y-0 px-5`}>
        {children}
      </div>
    </div>
  )
}

const MenuItem = ({ tabName, title }) => {
  const router = useRouter()
  const id = router.query.project
  const tab = router.query.tab || 'about'

  return (
    <Typography
      variant="base"
      onClick={() =>
        router.push(
          {
            pathname: id.toString(),
            query: { tab: tabName },
          },
          undefined,
          { shallow: true }
        )
      }
      className={classNames(
        tab == tabName &&
          'font-bold bg-transparent border-transparent border-gradient-r-purple-dark-900 border border-t-0 border-r-0 border-l-0 border-b-2',
        'px-1 py-5'
      )}
    >
      {title}
    </Typography>
  )
}

const Pool = ({ project, poolInfo, eclipseInfo }) => {
  
  const { account, chainId } = useActiveWeb3React()
  const [value, setValue] = useState('')
  const [valueUnstake, setValueUnstake] = useState('')

  const assetToken = useCurrency(SOLAR_MOVR_PAIR[chainId]) || undefined

  const typedDepositValue = tryParseAmount(value, assetToken)

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, assetToken ?? undefined)

  const [approvalState, approve] = useApproveCallback(typedDepositValue, project.eclipseContract)
  const [pendingTx, setPendingTx] = useState(false)
  const [pendingWithdrawTx, setPendingWithdrawTx] = useState(false)

  const addTransaction = useTransactionAdder()

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const eligible = eclipseInfo?.userInfo?.eligible

  const poolRaise = project.raise * (poolInfo.raisingAmount / eclipseInfo.totalRaise)

  const totalCommited = (poolInfo.totalAmountPool / 1e18) * eclipseInfo.pairPrice
  const totalCommitedPercent = (totalCommited / poolRaise) * 100
  const multiplier = eclipseInfo?.userInfo?.multiplier
  const stakingInOtherPools = eclipseInfo?.userInfo?.pools?.find((p) => p.amount > 0 && p.id !== poolInfo.id)
  const stakingPool = eclipseInfo?.userInfo?.pools?.find((p) => p.id == poolInfo.id)

  const userCommittedAmount = stakingPool?.amount / 1e18
  const maxUserCommitAmount = (poolInfo.baseLimitInLP / 1e18) * multiplier - userCommittedAmount
  const maxUserCommitValue = maxUserCommitAmount * eclipseInfo.pairPrice

  const errorMessage = stakingInOtherPools
    ? `You're participating in another pool`
    : isNaN(parseFloat(value)) || parseFloat(value) == 0
    ? 'Enter Amount'
    : parseFloat(value) > parseFloat(selectedCurrencyBalance.toExact())
    ? 'Insufficient Balance'
    : poolInfo?.baseLimitInLP > 0 && parseFloat(value) > maxUserCommitAmount
    ? 'Amount Exceeds User Limit'
    : ''

  const allInfoSubmitted = errorMessage == ''
  const saleMessage =
    project.status == PROJECT_STATUS.COMPLETED
      ? 'Sale ended'
      : project.status == PROJECT_STATUS.UPCOMING
      ? 'Sale is not active'
      : !eligible && stakingPool.amount == 0
      ? `You're not eligible`
      : null

  const unstakeErrorMessage = stakingInOtherPools
    ? `You're participating in another pool`
    : isNaN(parseFloat(valueUnstake)) || parseFloat(valueUnstake) == 0
    ? 'Enter Amount'
    : parseFloat(valueUnstake) > userCommittedAmount
    ? 'Insufficient Amount'
    : ''

  const unstakeAllInfoSubmitted = unstakeErrorMessage == ''

  const handleApprove = useCallback(async () => {
    await approve()
  }, [approve])

  const { deposit, withdraw } = useEclipse(project.eclipseContract)

  return (
    <div className={'w-full text-left rounded  bg-dark-800 text-primary text-sm md:text-lg'}>
      <div className="flex">
        <div className={`flex flex-row justify-center items-center rounded-t`}>
          <Image
            src={`${project.baseUrl}/${poolInfo.baseLimitInLP == 0 ? 'unlimited.png' : 'basic.png'}`}
            width="1440"
            height="788"
            className="rounded-t"
            alt={project.name}
          />
        </div>
      </div>
      <div className="px-4 py-6 -mt-8">
        <div className="grid grid-cols-1 space-y-4">
          <div className="flex flex-col">
            <Typography variant="h3" className="font-bold  mt-4">
              {poolInfo?.baseLimitInLP == 0 ? 'Unlimited Sale' : 'Basic Sale'}
            </Typography>
          </div>
          <div className={`flex flex-row space-x-10`}>
            <div className="flex flex-col">
              <Typography variant="base">Total Raise</Typography>
              <Typography variant="lg" className="font-bold text-right">
                {formatNumber(poolRaise, true, false)}
              </Typography>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="relative">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-base inline-block">Total Commited</span>
                </div>
                <div className="text-right">
                  <span className="text-base text-purple">
                    {formatNumber(totalCommited, true, false)} ({formatPercent(totalCommitedPercent)})
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-dark-500">
                <div
                  style={{ width: totalCommitedPercent > 100 ? '100%' : totalCommitedPercent.toFixed(0) + '%' }}
                  className="rounded bg-gradient-to-r from-light-purple  to-purple"
                ></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <Typography variant="h3" className="font-bold mt-4">
              Participate
            </Typography>
          </div>
          {saleMessage ? (
            <Typography variant="base">{saleMessage}</Typography>
          ) : (
            <>
              <div>
                <div className="flex mb-2 items-center justify-between ">
                  <div>
                    <span className="text-base inline-block">SOLAR/MOVR to commit</span>
                  </div>
                  {poolInfo?.baseLimitInLP > 0 && (
                    <div className="flex flex-col">
                      <div
                        className="text-right text-xs cursor-pointer text-purple"
                        onClick={() => {
                          let max = maxUserCommitAmount.toString()
                          if (selectedCurrencyBalance) {
                            if (maxUserCommitAmount > parseFloat(selectedCurrencyBalance.toExact())) {
                              max = selectedCurrencyBalance.toFixed()
                            }
                          }
                          setValue(max)
                        }}
                      >
                        Max {formatNumber(maxUserCommitValue, true, false)} (
                        {formatNumber(maxUserCommitAmount, false, false)})
                      </div>
                    </div>
                  )}
                </div>
                <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                  <NumericalInput
                    className={'p-3 text-base bg-transparent'}
                    id="token-amount-input"
                    value={value}
                    onUserInput={(val) => {
                      setValue(val)
                    }}
                  />
                  {assetToken && selectedCurrencyBalance ? (
                    <div className="flex flex-col">
                      <div className="flex flex-col">
                        <div
                          onClick={() => setValue(selectedCurrencyBalance.toFixed())}
                          className="text-xxs font-medium text-right cursor-pointer text-low-emphesis"
                        >
                          Wallet: {formatNumber(selectedCurrencyBalance.toSignificant(4))}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div
                          onClick={() => setValue(selectedCurrencyBalance.toFixed())}
                          className="text-xxs font-medium text-right cursor-pointer text-low-emphesis"
                        >
                          ≈{' '}
                          {formatNumber(
                            parseFloat(selectedCurrencyBalance.toExact()) * eclipseInfo.pairPrice,
                            true,
                            false
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={'flex items-center w-full'}>
                {!account ? (
                  <Web3Connect size="lg" color="gradient" className="w-full" />
                ) : !allInfoSubmitted ? (
                  <ButtonError className="font-bold" style={{ width: '100%' }} disabled={!allInfoSubmitted}>
                    {errorMessage}
                  </ButtonError>
                ) : (
                  <RowBetween>
                    {approvalState !== ApprovalState.APPROVED && (
                      <ButtonConfirmed
                        onClick={handleApprove}
                        disabled={
                          approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted || !allInfoSubmitted
                        }
                      >
                        {approvalState === ApprovalState.PENDING ? (
                          <div className={'p-2'}>
                            <AutoRow gap="6px" justify="center">
                              Approving <Loader stroke="white" />
                            </AutoRow>
                          </div>
                        ) : (
                          <span>Approve</span>
                        )}
                      </ButtonConfirmed>
                    )}
                    {approvalState === ApprovalState.APPROVED && (
                      <ButtonError
                        className="font-bold text-light"
                        onClick={async () => {
                          setPendingTx(true)
                          try {
                            const tx = await deposit(value.toBigNumber(18), poolInfo?.id)
                            addTransaction(tx, { summary: 'Commit' })
                          } catch (error) {
                            console.error(error)
                          }
                          setPendingTx(false)
                        }}
                        style={{
                          width: '100%',
                        }}
                        disabled={approvalState !== ApprovalState.APPROVED || !allInfoSubmitted || pendingTx}
                      >
                        {pendingTx ? (
                          <div className={'p-2'}>
                            <AutoRow gap="6px" justify="center">
                              Commit <Loader stroke="white" />
                            </AutoRow>
                          </div>
                        ) : (
                          <span>Commit</span>
                        )}
                      </ButtonError>
                    )}
                  </RowBetween>
                )}
              </div>
              <>
                <div>
                  <div className="flex mb-2 items-center justify-between ">
                    <div>
                      <span className="text-base inline-block">Your committed</span>
                    </div>
                  </div>
                  <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                    <NumericalInput
                      className={'p-3 text-base bg-transparent'}
                      id="token-amount-input"
                      value={valueUnstake}
                      onUserInput={(val) => {
                        setValueUnstake(val)
                      }}
                    />
                    {userCommittedAmount ? (
                      <div className="flex flex-col">
                        <div className="flex flex-col">
                          <div
                            onClick={() => setValueUnstake(userCommittedAmount.toFixed())}
                            className="text-xxs font-medium text-right cursor-pointer text-low-emphesis"
                          >
                            Commited: {formatNumber(userCommittedAmount, false, false)}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div
                            onClick={() => setValueUnstake(userCommittedAmount.toFixed())}
                            className="text-xxs font-medium text-right cursor-pointer text-low-emphesis"
                          >
                            ≈ {formatNumber(userCommittedAmount * eclipseInfo.pairPrice, true, false)}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className={'flex items-center w-full'}>
                  {!account ? (
                    <Web3Connect size="lg" color="gradient" className="w-full" />
                  ) : !unstakeAllInfoSubmitted ? (
                    <ButtonError className="font-bold" style={{ width: '100%' }} disabled={!unstakeAllInfoSubmitted}>
                      {unstakeErrorMessage}
                    </ButtonError>
                  ) : (
                    <RowBetween>
                      <ButtonError
                        className="font-bold text-light"
                        onClick={async () => {
                          setPendingWithdrawTx(true)
                          try {
                            const tx = await withdraw(valueUnstake.toBigNumber(18), poolInfo?.id)
                            addTransaction(tx, { summary: 'Withdraw' })
                          } catch (error) {
                            console.error(error)
                          }
                          setPendingWithdrawTx(false)
                        }}
                        style={{
                          width: '100%',
                        }}
                        disabled={!unstakeAllInfoSubmitted || pendingWithdrawTx}
                      >
                        {pendingWithdrawTx ? (
                          <div className={'p-2'}>
                            <AutoRow gap="6px" justify="center">
                              Withdraw <Loader stroke="white" />
                            </AutoRow>
                          </div>
                        ) : (
                          <span>Withdraw</span>
                        )}
                      </ButtonError>
                    </RowBetween>
                  )}
                </div>
              </>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const ClaimItem = ({ project, eclipseInfo, releaseBlock, k }) => {
  const { account } = useActiveWeb3React()
  const blockNumber = useBlockNumber()

  const [pendingTx, setPendingTx] = useState(false)

  const addTransaction = useTransactionAdder()

  const { harvest } = useEclipse(project.eclipseContract)

  const claimEnabled = eclipseInfo.claimEnabled

  const userPoolId = eclipseInfo?.userInfo?.pools?.find((r) => r.amount > 0)

  return (
    <div className="grid py-1 grid-cols-3 border border-t-0 border-r-0 border-l-0 items-center border-thin border-dark-600">
      <a
        className="text-emphesis font-xs"
        href={'https://moonriver.moonscan.io/block/countdown/' + releaseBlock?.toString()}
        target="_blank"
        rel="noreferrer"
      >
        {releaseBlock?.toString()}
      </a>
      <Typography variant="base" className="text-emphesis text-right">
        {formatPercent(eclipseInfo?.harvestReleasePercent[k] / 1e2)}
      </Typography>
      {!account || !claimEnabled ? (
        <div className="flex justify-end px-6">
          <Typography variant="base" className="text-emphesis text-center">
            {!claimEnabled ? 'Locked' : 'Connect wallet'}
          </Typography>
        </div>
      ) : (
        <div className="flex justify-end">
          <ButtonError
            className="font-bold text-emphesis text-center px-6"
            onClick={async () => {
              setPendingTx(true)
              try {
                const tx = await harvest(userPoolId?.id?.toString(), k.toString())
                addTransaction(tx, { summary: 'Harvest' })
              } catch (error) {
                console.error(error)
              }
              setPendingTx(false)
            }}
            style={{
              width: '150px',
            }}
            size="xs"
            disabled={releaseBlock > blockNumber || !claimEnabled || userPoolId?.claimed?.[k] || pendingTx}
          >
            {pendingTx ? (
              <div className="flex items-center justify-center">
                <div className="pr-2">Claim</div> <Loader stroke="white" size="12px" />
              </div>
            ) : releaseBlock > blockNumber ? (
              'Locked'
            ) : userPoolId?.claimed?.[k] ? (
              'Claimed'
            ) : (
              'Claim'
            )}
          </ButtonError>
        </div>
      )}
    </div>
  )
}

const Claim = ({ project, eclipseInfo }) => {
  const { account } = useActiveWeb3React()

  const errorMessage = !account ? 'Connect your wallet' : ''
  const allInfoSubmitted = errorMessage === ''

  return (
    <div className={`bg-light-glass md:px-6 px-4 py-4 md:rounded`}>
      <div className="mb-2 text-2xl text-emphesis">{`Eclipse #${parseInt(project.id) + 1} - ${project.name}`}</div>
      <div className="mb-4 text-base">
        <Typography variant="base" className="text-emphesis">
          Here you can claim your offering tokens, and your refund (if there is overflow). The rest of the tokens are
          gradually released following the vesting schedule.
        </Typography>
      </div>
      <>
        <div className="flex flex-col mt-4">
          <Typography variant="h3" className="text-emphesis mt-2 mb-2">
            Vesting Schedule
          </Typography>
        </div>
        <div className={'flex flex-col mt-1'}>
          {!allInfoSubmitted ? (
            <Typography variant="base" className="text-secondary">
              {errorMessage}
            </Typography>
          ) : (
            <div className={'bg-dark-700 rounded flex-col p-4 '}>
              <div className="grid  py-1 grid-cols-3 border border-t-0 border-r-0 border-l-0 border-thin border-dark-600">
                <Typography variant="base" className="text-light font-bold">
                  Block Number
                </Typography>
                <Typography variant="base" className="text-light text-right  font-bold">
                  %
                </Typography>
                <Typography variant="base" className="text-light text-center  font-bold"></Typography>
              </div>
              {eclipseInfo?.harvestReleaseBlocks?.map((releaseBlock, k) => {
                return (
                  <ClaimItem releaseBlock={releaseBlock} key={k} k={k} eclipseInfo={eclipseInfo} project={project} />
                )
              })}
            </div>
          )}
        </div>
      </>
    </div>
  )
}

const UserInfo = ({ project, pools, eclipseInfo }) => {
  const { account } = useActiveWeb3React()

  const eligible = eclipseInfo?.userInfo?.eligible

  const userPoolId = eclipseInfo?.userInfo?.pools?.find((r) => r.amount > 0)
  const pool = pools[userPoolId?.id]
  const commited = !userPoolId ? 0 : (userPoolId?.amount / 1e18) * eclipseInfo.pairPrice
  const participation = !userPoolId ? 0 : userPoolId?.allocation / 1e12

  console.log(userPoolId)

  return (
    <div className={`bg-light-glass px-6 py-4 rounded`}>
      <div className="mb-2 text-2xl text-emphesis">{`Eclipse #${parseInt(project.id) + 1} - ${project.name}`}</div>
      <div className="mb-4 text-base">
        <Typography variant="base" className="text-secondary">
          Before Sale
        </Typography>
        <Typography variant="base" className="text-emphesis">
          You need to stake at least 50 SOLAR in one of the Vaults to be eligible. Multiplier boosts are tiered, you can
          read more about it{' '}
          <a
            className="underline"
            href="https://solarbeam.medium.com/solarbeam-eclipse-everything-you-need-to-know-4812b00065c9"
            target="_blank"
            rel="noreferrer"
          >
            here.
          </a>
        </Typography>
        <Typography variant="base" className="text-secondary mt-2">
          During Sale
        </Typography>
        <Typography variant="base" className="text-emphesis">
          While the sale is live, you need to create SOLAR-MOVR liquidity pairs to commit to the pool of your choice.
        </Typography>
        <Typography variant="base" className="text-emphesis">
          You can only choose between one of the two pools: Basic or Unlimited.
        </Typography>
        <Typography variant="base" className="text-emphesis">
          The IDO contract will renew all the user vaults on user commit.
        </Typography>
        <Typography variant="base" className="text-secondary mt-2">
          Immediately after sale
        </Typography>
        <Typography variant="base" className="text-emphesis">
          You can claim your offering tokens, and your refund (if there is overflow). The rest of the tokens are
          gradually released following the vesting schedule.
        </Typography>
      </div>
      <div className="flex flex-col">
        <Typography variant="h3" className="text-emphesis mt-4 mb-2">
          Your Stats
        </Typography>
      </div>
      {!account ? (
        <Web3Connect size="lg" color="gradient" className="w-full" />
      ) : (
        <>
          <div className={`flex flex-col  space-x-10 mb-4`}>
            <div className="grid grid-cols-3 justify-between">
              <div>
                <Typography variant="base" className="text-secondary">
                  Status
                </Typography>
                <Typography variant="base" className="text-emphesis">
                  {eligible ? 'Eligible' : 'Not eligible'}
                </Typography>
              </div>
              <div>
                <Typography variant="base" className="text-secondary">
                  Multiplier
                </Typography>
                <Typography variant="base" className=" text-emphesis">
                  {eligible ? `${eclipseInfo?.userInfo?.multiplier}x` : '--'}
                </Typography>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <Typography variant="h3" className="text-emphesis mt-4 mb-2">
              Your Participation
            </Typography>
          </div>
          <div className={`flex flex-col  space-x-10 pb-2`}>
            <div className="grid grid-cols-3 justify-between">
              <div>
                <Typography variant="base" className="text-secondary">
                  Pool
                </Typography>
                <Typography variant="base" className="text-emphesis">
                  {userPoolId ? (pool.baseLimitInLP > 0 ? 'Basic' : 'Unlimited') : '--'}
                </Typography>
              </div>
              <div>
                <Typography variant="base" className="text-secondary">
                  Commited
                </Typography>
                <Typography variant="base" className=" text-emphesis">
                  {userPoolId ? `${formatNumber(commited, true, false)}` : '--'}
                </Typography>
              </div>
              <div>
                <Typography variant="base" className="text-secondary">
                  Allocation
                </Typography>
                <Typography variant="base" className="text-emphesis">
                  {userPoolId ? `${formatPercent(participation * 100)}` : '--'}
                </Typography>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function EclipseProject(): JSX.Element {
  const { chainId } = useActiveWeb3React()
  const router = useRouter()
  const blockNumber = useBlockNumber()

  const id = router.query.project
  const tab = router.query.tab || 'about'

  const projectInfo = ECLIPSE_PROJECTS[parseInt(id.toString())]
  const project = {
    id,
    ...projectInfo,
    status:
      blockNumber >= projectInfo.startBlock && blockNumber < projectInfo.endBlock
        ? PROJECT_STATUS.LIVE
        : blockNumber >= projectInfo.endBlock
        ? PROJECT_STATUS.COMPLETED
        : PROJECT_STATUS.UPCOMING,
  }

  const eclipseInfo = useEclipseInfo(project.eclipseContract)
  const eclipsePools = useEclipsePools(project.eclipseContract)
  const eclipseUserInfo = useEclipseUserInfo(project.eclipseContract)

  let token0 = useCurrency(SOLAR_ADDRESS[chainId])
  let token1 = useCurrency(WNATIVE[chainId])
  const [data] = useV2PairsWithPrice([[token0, token1]])
  const [state, pair, pairPrice] = data

  const totalRaise = eclipsePools?.reduce((previousValue, currentValue) => {
    return previousValue + currentValue.raisingAmount * 1
  }, 0)

  const totalCommited =
    eclipsePools?.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.totalAmountPool / 1e18
    }, 0) * pairPrice

  const extraEclipseInfo = {
    ...eclipseInfo,
    totalRaise,
    totalCommited,
    pairPrice,
    userInfo: {
      ...eclipseUserInfo,
    },
  }

  return (
    <>
      <Head>
        <title>Eclipse | Solarbeam</title>
        <meta key="description" name="description" content="Eclipse" />
      </Head>

      <SolarEclipse />

      <div className="container mx-auto pb-6 -mt-48 px-2 md:px-0 mb-20 md:mb-10">
        <div className="relative w-full">
          <div className={`grid grid-cols-1 md:grid-cols-12 gap-2 min-h-1/2`}>
            <div className="block mb-10">
              <Back />
            </div>
            <div className={`col-span-1 md:col-span-12`}>
              <ProjectHero project={project} totalCommited={totalCommited} />
              <Card
                className="bg-dark-900 z-4 rounded"
                header={
                  <Menu>
                    <MenuItem tabName="about" title="About The Project" />
                    <MenuItem tabName="join" title="Join Pool" />
                    <MenuItem tabName="claim" title="Claim" />
                  </Menu>
                }
                removePadding
              >
                <div className="md:p-6 min-h-[400px]">
                  {!project ? (
                    <Typography variant="base" className={'max-w-xl m-auto text-center mb-2 text-gray-400'}>
                      Project not Found
                    </Typography>
                  ) : (
                    <>
                      {tab == 'about' && <AboutProjectTab project={project} />}
                      {tab == 'join' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-4 md:mt-0">
                          {eclipsePools.map((pool, idx) => {
                            return <Pool key={idx} project={project} poolInfo={pool} eclipseInfo={extraEclipseInfo} />
                          })}
                          <UserInfo project={project} pools={eclipsePools} eclipseInfo={extraEclipseInfo} />
                        </div>
                      )}
                      {tab == 'claim' && <Claim project={project} eclipseInfo={extraEclipseInfo} />}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
