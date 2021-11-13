import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { CurrencyAmount, JSBI, Token, ZERO } from '../../sdk'
import { Disclosure, Transition } from '@headlessui/react'
import React, { useState } from 'react'
import { usePendingSolar, useUserInfo } from './hooks'
import Button from '../../components/Button'
import Dots from '../../components/Dots'
import { SOLAR_DISTRIBUTOR_ADDRESS, SOLAR_DISTRIBUTOR_V2_ADDRESS } from '../../constants/addresses'
import { Input as NumericalInput } from '../../components/NumericalInput'
import { formatNumber, formatNumberScale, formatPercent } from '../../functions'
import { getAddress } from '@ethersproject/address'
import { t } from '@lingui/macro'
import { tryParseAmount } from '../../functions/parse'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import useMasterChef from './useMasterChef'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { isMobile } from 'react-device-detect'
import { Zero } from '@ethersproject/constants'
import { useV2LiquidityTokenPermit } from '../../hooks/useERC20Permit'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'

const FarmListItem = ({ farm }) => {
  const { i18n } = useLingui()

  const { account, chainId, library } = useActiveWeb3React()
  const [pendingTx, setPendingTx] = useState(false)
  const [depositValue, setDepositValue] = useState('')
  const [withdrawValue, setWithdrawValue] = useState('')

  const addTransaction = useTransactionAdder()

  const liquidityToken = new Token(
    chainId,
    getAddress(farm.lpToken),
    farm.pair.token1 ? 18 : farm.pair.token0 ? farm.pair.token0.decimals : 18,
    farm.pair.token1 ? farm.pair.symbol : farm.pair.token0.symbol,
    farm.pair.token1 ? farm.pair.name : farm.pair.token0.name
  )

  // User liquidity token balance
  const balance = useTokenBalance(account, liquidityToken)
  const deadline = useTransactionDeadline()

  const nextHarvestUntil = (farm?.nextHarvestUntil || Zero) * 1000

  const amount = farm?.amount ? CurrencyAmount.fromRawAmount(liquidityToken, farm?.amount) : undefined

  const pendingRewards = farm?.pendingRewards?.filter((r) => r.amount > 0)
  const hasRewards = pendingRewards?.length > 0

  const typedDepositValue = tryParseAmount(depositValue, liquidityToken)
  const typedWithdrawValue = tryParseAmount(withdrawValue, liquidityToken)

  // allowance handling
  const { gatherPermitSignature, signatureData } = useV2LiquidityTokenPermit(
    typedDepositValue,
    farm.version == 1 ? undefined : SOLAR_DISTRIBUTOR_V2_ADDRESS[chainId]
  )

  const [approvalState, approve] = useApproveCallback(
    typedDepositValue,
    farm.version == 1 ? SOLAR_DISTRIBUTOR_ADDRESS[chainId] : SOLAR_DISTRIBUTOR_V2_ADDRESS[chainId]
  )

  const pendingApproval = gatherPermitSignature
    ? approvalState === ApprovalState.NOT_APPROVED && !signatureData
    : approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING

  async function onAttemptToApprove() {
    if (!liquidityToken || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = typedDepositValue
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    if (gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approve()
        }
      }
    } else {
      await approve()
    }
  }

  const { deposit, depositWithPermit, withdraw, harvest } = useMasterChef(farm.version)

  return (
    <Transition
      show={true}
      enter="transition-opacity duration-0"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Disclosure.Panel className="flex flex-col w-full border-t-0 rounded rounded-t-none bg-dark-800" static>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="col-span-2 text-center md:col-span-1">
            {farm?.depositFeeBP > 0 ? (
              <div className="pr-4 mb-2 text-left text-red">{`${i18n._(t`Deposit Fee`)}: ${formatPercent(
                farm.depositFeeBP / 100
              )}`}</div>
            ) : null}
            {account && (
              <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
                {i18n._(t`Wallet Balance`)}: {formatNumberScale(balance?.toSignificant(4, undefined, 2) ?? 0, false, 4)}
                {farm.price && balance
                  ? ` (` + formatNumberScale(farm.price * Number(balance?.toFixed(18) ?? 0), true, 2) + `)`
                  : ``}
              </div>
            )}
            <div className="relative flex items-center w-full mb-4">
              <NumericalInput
                className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple"
                value={depositValue}
                onUserInput={setDepositValue}
              />
              {account && (
                <Button
                  variant="outlined"
                  color="light-green"
                  size="xs"
                  disabled={farm?.id === '1'}
                  onClick={() => {
                    if (!balance.equalTo(ZERO)) {
                      if (liquidityToken?.symbol == 'SOLAR') {
                        try {
                          const minValue = 1 / 10 ** (liquidityToken?.decimals - 10)
                          const newValue = parseFloat(balance.toFixed(liquidityToken?.decimals)) - minValue
                          setDepositValue(newValue.toFixed(liquidityToken?.decimals))
                        } catch (e) {
                          setDepositValue(balance.toFixed(liquidityToken?.decimals))
                        }
                      } else {
                        setDepositValue(balance.toFixed(liquidityToken?.decimals))
                      }
                    }
                  }}
                  className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
                >
                  {i18n._(t`MAX`)}
                </Button>
              )}
            </div>
            {pendingApproval ? (
              <Button
                className="w-full"
                size="sm"
                variant="outlined"
                color="gradient"
                disabled={approvalState === ApprovalState.PENDING}
                onClick={onAttemptToApprove}
              >
                {approvalState === ApprovalState.PENDING ? <Dots>Approving </Dots> : i18n._(t`Approve`)}
              </Button>
            ) : (
              <Button
                className="w-full"
                size="sm"
                variant="outlined"
                color="gradient"
                disabled={pendingTx || !typedDepositValue || balance.lessThan(typedDepositValue) || farm?.id === '1'}
                onClick={async () => {
                  setPendingTx(true)
                  try {
                    let tx
                    if (gatherPermitSignature && signatureData) {
                      tx = await depositWithPermit(
                        farm?.id,
                        depositValue.toBigNumber(liquidityToken?.decimals),
                        signatureData.deadline,
                        signatureData.v,
                        signatureData.r,
                        signatureData.s
                      )
                    } else {
                      tx = await deposit(farm?.id, depositValue.toBigNumber(liquidityToken?.decimals))
                    }

                    addTransaction(tx, {
                      summary: `${i18n._(t`Deposit`)} ${
                        farm.pair.token1
                          ? `${farm.pair.token0.symbol}/${farm.pair.token1.symbol}`
                          : farm.pair.token0.symbol
                      }`,
                    })
                  } catch (error) {
                    console.error(error)
                  }
                  setPendingTx(false)
                }}
              >
                {i18n._(t`Stake`)}
              </Button>
            )}
          </div>
          <div className="col-span-2 text-center md:col-span-1">
            {farm?.depositFeeBP > 0 && !isMobile ? <div className="pr-4 mb-2 " style={{ height: '24px' }} /> : null}
            {account && (
              <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
                {i18n._(t`Your Staked`)}: {formatNumberScale(amount?.toSignificant(6)) ?? 0}
                {farm.price && amount
                  ? ` (` + formatNumberScale(farm.price * Number(amount?.toSignificant(18) ?? 0), true, 2) + `)`
                  : ``}
              </div>
            )}
            <div className="relative flex items-center w-full mb-4">
              <NumericalInput
                className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-light-purple"
                value={withdrawValue}
                onUserInput={setWithdrawValue}
              />
              {account && (
                <Button
                  variant="outlined"
                  color="light-green"
                  size="xs"
                  onClick={() => {
                    if (!amount.equalTo(ZERO)) {
                      setWithdrawValue(amount.toFixed(liquidityToken?.decimals))
                    }
                  }}
                  className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
                >
                  {i18n._(t`MAX`)}
                </Button>
              )}
            </div>
            <Button
              className="w-full"
              size="sm"
              variant="outlined"
              color="gradient"
              disabled={pendingTx || !typedWithdrawValue || amount.lessThan(typedWithdrawValue)}
              onClick={async () => {
                setPendingTx(true)
                try {
                  // KMP decimals depend on asset, SLP is always 18
                  const tx = await withdraw(farm?.id, withdrawValue.toBigNumber(liquidityToken?.decimals))
                  addTransaction(tx, {
                    summary: `${i18n._(t`Withdraw`)} ${
                      farm.pair.token1
                        ? `${farm.pair.token0.symbol}/${farm.pair.token1.symbol}`
                        : farm.pair.token0.symbol
                    }`,
                  })
                } catch (error) {
                  console.error(error)
                }

                setPendingTx(false)
              }}
            >
              {i18n._(t`Unstake`)}
            </Button>
          </div>
        </div>
        {hasRewards && (
          <div className="px-4 pb-4">
            <Button
              color="gradient"
              className="w-full"
              variant={!!nextHarvestUntil && nextHarvestUntil > Date.now() ? 'outlined' : 'filled'}
              disabled={!!nextHarvestUntil && nextHarvestUntil > Date.now()}
              onClick={async () => {
                setPendingTx(true)
                try {
                  const tx = await harvest(farm.id)
                  addTransaction(tx, {
                    summary: `${i18n._(t`Harvest`)} ${
                      farm.pair.token1
                        ? `${farm.pair.token0.symbol}/${farm.pair.token1.symbol}`
                        : farm.pair.token0.symbol
                    }`,
                  })
                } catch (error) {
                  console.error(error)
                }
                setPendingTx(false)
              }}
            >
              {`Harvest ${pendingRewards
                .map((reward) => `${formatNumber(reward?.amount / 10 ** reward?.decimals)}  ${reward.symbol}`)
                .join(' & ')}`}
            </Button>
          </div>
        )}
      </Disclosure.Panel>
    </Transition>
  )
}

export default FarmListItem
