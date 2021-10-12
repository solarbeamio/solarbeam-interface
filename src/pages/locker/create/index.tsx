/* eslint-disable @next/next/link-passhref */
import { ApprovalState, useActiveWeb3React, useApproveCallback } from '../../../hooks'

import Head from 'next/head'
import React, { useCallback, useEffect, useState } from 'react'
import { classNames, formatNumberScale, tryParseAmount } from '../../../functions'
import { useRouter } from 'next/router'
import NavLink from '../../../components/NavLink'
import Link from 'next/link'
import Card from '../../../components/Card'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import { LOCKER_ADDRESS } from '../../../constants'
import SolarbeamLogo from '../../../components/SolarbeamLogo'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import Button, { ButtonConfirmed, ButtonError } from '../../../components/Button'
import NumericalInput from '../../../components/NumericalInput'
import { AutoRow, RowBetween } from '../../../components/Row'
import { isAddress } from '@ethersproject/address'
import { useCurrency } from '../../../hooks/Tokens'
import { useCurrencyBalance } from '../../../state/wallet/hooks'
import Loader from '../../../components/Loader'
import Web3Connect from '../../../components/Web3Connect'
import Datetime from 'react-datetime'
import * as moment from 'moment'
import useLocker from '../../../features/locker/useLocker'
import { ethers } from 'ethers'
import { useAddPopup } from '../../../state/application/hooks'

export default function CreateLocker(): JSX.Element {
  const { i18n } = useLingui()
  const router = useRouter()
  const { chainId, account, library } = useActiveWeb3React()
  const [tokenAddress, setTokenAddress] = useState('')
  const [withdrawer, setWithdrawer] = useState('')
  const [value, setValue] = useState('')
  const [unlockDate, setUnlockDate] = useState(moment.default())
  const [pendingTx, setPendingTx] = useState(false)
  const addTransaction = useTransactionAdder()

  const assetToken = useCurrency(tokenAddress) || undefined

  const typedDepositValue = tryParseAmount(value, assetToken)

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, assetToken ?? undefined)

  const [approvalState, approve] = useApproveCallback(typedDepositValue, LOCKER_ADDRESS[chainId])

  const lockerContract = useLocker()
  const addPopup = useAddPopup()

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  const errorMessage = !isAddress(tokenAddress)
    ? 'Invalid token'
    : !isAddress(withdrawer)
    ? 'Invalid withdrawer'
    : isNaN(parseFloat(value)) || parseFloat(value) == 0
    ? 'Invalid amount'
    : moment.isDate(unlockDate) || moment.default(unlockDate).isBefore(new Date())
    ? 'Invalid unlock date'
    : ''

  const allInfoSubmitted = errorMessage == ''

  const handleApprove = useCallback(async () => {
    await approve()
  }, [approve])

  const handleLock = useCallback(async () => {
    if (allInfoSubmitted) {
      setPendingTx(true)

      try {
        const tx = await lockerContract.lockTokens(
          tokenAddress,
          withdrawer,
          value.toBigNumber(assetToken?.decimals),
          moment.default(unlockDate).unix().toString()
        )

        if (tx.wait) {
          const result = await tx.wait()

          const [_withdrawer, _amount, _id] = ethers.utils.defaultAbiCoder.decode(
            ['address', 'uint256', 'uint256'],
            result.events[2].data
          )

          addPopup({
            txn: { hash: result.transactionHash, summary: `Successfully created lock [${_id}]`, success: true },
          })

          setTokenAddress('')
          setWithdrawer('')
          setValue('')
          setUnlockDate(moment.default())
        } else {
          throw 'User denied transaction signature.'
        }
      } catch (err) {
        addPopup({
          txn: { hash: undefined, summary: `Failed to create lock: ${err}`, success: false },
        })
      } finally {
        setPendingTx(false)
      }
    }
  }, [allInfoSubmitted, addPopup, assetToken, tokenAddress, withdrawer, value, unlockDate, lockerContract])

  var valid = function (current) {
    return current.isAfter(moment.default(unlockDate).subtract(1, 'day'))
  }

  return (
    <>
      <Head>
        <title>Locker | Solarbeam</title>
        <meta key="description" name="description" content="Solarbeam Locker" />
      </Head>

      <div className="container px-0 mx-auto pb-5 pt-5">
        <DoubleGlowShadow maxWidth={false} opacity={'0.6'}>
          <div className={`grid grid-cols-12 gap-2 min-h-1/2`}>
            <div className={`col-span-12 flex flex-col md:flex-row md:space-x-2`}>
              <NavLink
                exact
                href={'/locker'}
                activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900"
              >
                <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                  {i18n._(t`Search lockers`)}
                </a>
              </NavLink>
              <NavLink
                exact
                href={'/locker/create'}
                activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-purple-dark-900"
              >
                <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                  {i18n._(t`Create lock`)}
                </a>
              </NavLink>
            </div>
            <div className={`col-span-12`} style={{ minHeight: '30rem' }}>
              <Card className="h-full bg-dark-900 z-4">
                <div className={`grid grid-cols-12 gap-4`}>
                  <div className={`col-span-12 md:col-span-8 bg-dark-800 px-6 py-4 rounded`}>
                    <div className={'px-4 py-2 rounded bg-dark-800'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start mt-2 md:mt-0 md:items-end justify-center mx-3.5">
                            <div className="text-base font-medium text-secondary whitespace-nowrap">Token Address</div>
                          </div>
                        </div>
                        <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                          <input
                            className="p-3 w-full flex overflow-ellipsis font-bold recipient-address-input bg-dark-900 h-full w-full rounded placeholder-low-emphesis"
                            type="text"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            pattern="^(0x[a-fA-F0-9]{40})$"
                            onChange={(e) => setTokenAddress(e.target.value)}
                            value={tokenAddress}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={'px-4 py-2 rounded bg-dark-800'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start mt-2 md:mt-0 md:items-end justify-center mx-3.5">
                            <div className="text-base font-medium text-secondary whitespace-nowrap">Amount</div>
                          </div>
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
                              <div
                                onClick={() => setValue(selectedCurrencyBalance.toFixed())}
                                className="text-xxs font-medium text-right cursor-pointer text-low-emphesis"
                              >
                                {i18n._(t`Balance:`)} {formatNumberScale(selectedCurrencyBalance.toSignificant(4))}{' '}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className={'px-4 py-2 rounded bg-dark-800'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start mt-2 md:mt-0 md:items-end justify-center mx-3.5">
                            <div className="text-base font-medium text-secondary whitespace-nowrap">Withdrawer</div>
                          </div>
                        </div>
                        <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                          <>
                            <input
                              className="p-3 w-full flex overflow-ellipsis font-bold recipient-address-input bg-dark-900 h-full w-full rounded placeholder-low-emphesis"
                              type="text"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              pattern="^(0x[a-fA-F0-9]{40})$"
                              onChange={(e) => setWithdrawer(e.target.value)}
                              value={withdrawer}
                            />
                            {account && (
                              <Button
                                onClick={() => setWithdrawer(account)}
                                size="xs"
                                className="text-xxs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap"
                              >
                                {i18n._(t`Me`)}
                              </Button>
                            )}
                          </>
                        </div>
                      </div>
                    </div>
                    <div className={'px-4 py-2 rounded bg-dark-800'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start mt-2 md:mt-0 md:items-end justify-center mx-3.5">
                            <div className="text-base font-medium text-secondary whitespace-nowrap">Unlock date</div>
                          </div>
                        </div>
                        <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                          <>
                            <Datetime
                              value={unlockDate}
                              utc={true}
                              closeOnSelect={true}
                              isValidDate={valid}
                              onChange={(e) => setUnlockDate(moment.default(e))}
                              inputProps={{
                                className:
                                  'p-3 w-full flex overflow-ellipsis font-bold recipient-address-input bg-dark-900 h-full w-full rounded placeholder-low-emphesis',
                              }}
                            />
                          </>
                        </div>
                      </div>
                    </div>

                    <div className={'px-4 py-2'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start md:items-end justify-center mx-3.5"></div>
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
                                    approvalState !== ApprovalState.NOT_APPROVED ||
                                    approvalSubmitted ||
                                    !allInfoSubmitted
                                  }
                                >
                                  {approvalState === ApprovalState.PENDING ? (
                                    <div className={'p-2'}>
                                      <AutoRow gap="6px" justify="center">
                                        Approving <Loader stroke="white" />
                                      </AutoRow>
                                    </div>
                                  ) : (
                                    i18n._(t`Approve`)
                                  )}
                                </ButtonConfirmed>
                              )}
                              {approvalState === ApprovalState.APPROVED && (
                                <ButtonError
                                  className="font-bold text-light"
                                  onClick={handleLock}
                                  style={{
                                    width: '100%',
                                  }}
                                  disabled={approvalState !== ApprovalState.APPROVED || !allInfoSubmitted || pendingTx}
                                >
                                  {pendingTx ? (
                                    <div className={'p-2'}>
                                      <AutoRow gap="6px" justify="center">
                                        Locking <Loader stroke="white" />
                                      </AutoRow>
                                    </div>
                                  ) : (
                                    i18n._(t`Lock`)
                                  )}
                                </ButtonError>
                              )}
                            </RowBetween>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`col-span-12 md:col-span-4 bg-dark-800 px-6 py-4 rounded`}>
                    <div className="mb-2 text-2xl text-emphesis">{i18n._(t`How to use`)}</div>
                    <div className="mb-4 text-base text-secondary">
                      <p>
                        {i18n._(
                          t`- Input your token or liquidity pair address, amount of tokens to lock, withdrawer address and when tokens will become unlocked`
                        )}
                      </p>
                      <p>{i18n._(t`- Click on "Approve" to allow the contract to transfer your tokens`)}</p>
                      <p>{i18n._(t`- Click on "Deposit" to lock your tokens into locker contract`)}</p>
                    </div>
                    <div className="mb-2 text-2xl text-emphesis">{i18n._(t`Fees`)}</div>{' '}
                    <div className="mb-4 text-base text-secondary">
                      <p>{i18n._(t`- 0.1 MOVR to lock`)}</p>
                    </div>
                    <div className="mb-2 text-2xl text-emphesis">{i18n._(t`Considerations`)}</div>{' '}
                    <div className="mb-4 text-base text-secondary">
                      <p>{i18n._(t`- You will not be able to withdraw your tokens before the unlock time`)}</p>
                      <p>{i18n._(t`- Locker contract address: ${LOCKER_ADDRESS[chainId || 1285]}`)}</p>
                      <p>{i18n._(t`- Always DYOR`)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </DoubleGlowShadow>
      </div>
    </>
  )
}
