import {BigNumber} from '@ethersproject/bignumber'

export interface RToken {
    name: string;
    gasPrice: number;
}

export enum PoolType {
    ConstantProduct = 'ConstantProduct',
    ConstantMean = 'ConstantMean',
    Hybrid = 'Hybrid'
}

export interface Pool {
    address: string;
    token0: RToken;
    token1: RToken;
    type: PoolType;
    reserve0: BigNumber;
    reserve1: BigNumber;
    data: ArrayBuffer;
    fee: number;
}

export interface RouteLeg {
    address: string;
    token: RToken;
    swapPortion: number;        // For router contract
    absolutePortion: number;    // To depict at webpage for user
}

export interface MultiRoute {
    amountIn: number,
    amountOut: number,
    legs: RouteLeg[],
    gasSpent: number,
    totalAmountOut: number
}