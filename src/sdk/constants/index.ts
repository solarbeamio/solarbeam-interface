export * from './addresses'
export * from './natives'

import JSBI from 'jsbi'

export const MaxUint256 = JSBI.BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
)

export const INIT_CODE_HASH: string =
  '0x9a100ded5f254443fbd264cb7e87831e398a8b642e061670a9bc35ba27293dbf'
  
// export const INIT_CODE_HASH: string =
//   '0x1f8a283ca49e2be3a4c310bfa79ed27628edc584d5f528a02daafe1762f41fa2'

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _9975 = JSBI.BigInt(9975)
export const _10000 = JSBI.BigInt(10000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256',
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  ),
}
