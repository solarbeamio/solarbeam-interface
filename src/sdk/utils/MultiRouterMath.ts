import {BigNumber} from '@ethersproject/bignumber'
import { Pool, PoolType } from "../types/MultiRouterTypes"

const A_PRECISION = 100;

export function ConstantMeanParamsFromData(data: ArrayBuffer): [number, number] {
    const arr = new Uint8Array(data);
    return [arr[0], 100-arr[0]];
}

export function ConstantMeanDataFromParams(weight0: number, weight1: number): ArrayBuffer {
    console.assert(weight0+weight1 == 100, 'Weight wrong')
    const data = new ArrayBuffer(16);
    const arr = new Uint8Array(data);
    arr[0] = weight0;
    return data;
}

export function HybridParamsFromData(data: ArrayBuffer): number {
    const arr = new Int32Array(data);
    return arr[0];
}

export function HybridDataFromParams(A: number): ArrayBuffer {
    const data = new ArrayBuffer(16);
    const arr = new Int32Array(data);
    arr[0] = A;
    return data;
}

const DCacheBN = new Map<Pool, BigNumber>();
export function HybridComputeLiquidityBN(pool: Pool): BigNumber {
    const res = DCacheBN.get(pool);
    if (res != undefined)
        return res;
  
    const r0 = pool.reserve0;
    const r1 = pool.reserve1;

    if (r0.isZero() && r1.isZero()) {
        DCacheBN.set(pool, BigNumber.from(0));
        return BigNumber.from(0);
    }
    const s = r0.add(r1);

    const A = HybridParamsFromData(pool.data);
    const nA = BigNumber.from(A * 2);

    let prevD;

    let D = s;
    for (let i = 0; i < 256; i++) {
        const dP = D.mul(D).div(r0).mul(D).div(r1).div(4);
        prevD = D;
        D = nA.mul(s).div(A_PRECISION).add(dP.mul(2)).mul(D).div(nA.div(A_PRECISION).sub(1).mul(D).add(dP.mul(3)));
        if ( D.sub(prevD).abs().lte(1) ) {
            break;
        }
    }
    DCacheBN.set(pool, D);
    return D;
}

export function HybridgetYBN(pool: Pool, x: BigNumber): BigNumber {
    const D = HybridComputeLiquidityBN(pool);
    
    const nA = HybridParamsFromData(pool.data)*2;

    let c = D.mul(D).div(x.mul(2)).mul(D).div(nA*2/A_PRECISION);
    let b = D.mul(A_PRECISION).div(nA).add(x);
    
    let yPrev;
    let y = D;
    for (let i = 0; i < 256; i++) {
        yPrev = y;
        
        y = y.mul(y).add(c).div(y.mul(2).add(b).sub(D));
        if (y.sub(yPrev).abs().lte(1)) {
            break;
        }
    }
    return y;
}

export function calcOutByIn(pool:Pool, amountIn: number, direction = true): number {
    const xBN = direction ? pool.reserve0 : pool.reserve1;
    const yBN = direction ? pool.reserve1 : pool.reserve0;
    switch(pool.type) {
        case PoolType.ConstantProduct: {
            const x = parseInt(xBN.toString());
            const y = parseInt(yBN.toString());
            return y*amountIn/(x/(1-pool.fee) + amountIn);
        } 
        case PoolType.ConstantMean: {
            const x = parseInt(xBN.toString());
            const y = parseInt(yBN.toString());
            const [weight0, weight1] = ConstantMeanParamsFromData(pool.data);
            const weightRatio = direction ? weight0/weight1 : weight1/weight0;
            const actualIn = amountIn*(1-pool.fee);
            return y*(1-Math.pow(x/(x+actualIn), weightRatio));
        } 
        case PoolType.Hybrid: {
            // const xNew = x + amountIn*(1-pool.fee);
            // const yNew = HybridgetY(pool, xNew);
            // const dy = y - yNew;
            
            const xNewBN = xBN.add(getBigNumber(undefined, amountIn*(1-pool.fee)));
            const yNewBN = HybridgetYBN(pool, xNewBN);
            const dy = parseInt(yBN.sub(yNewBN).toString());
            
            return dy;
        }
    }
    console.error('Unknown pool type');
}

export function calcInByOut(pool:Pool, amountOut: number, direction: boolean): number {
    let input = 0;
    const xBN = direction ? pool.reserve0 : pool.reserve1;
    const yBN = direction ? pool.reserve1 : pool.reserve0;
    switch(pool.type) {
        case PoolType.ConstantProduct: {
            const x = parseInt(xBN.toString());
            const y = parseInt(yBN.toString());
            input = x*amountOut/(1-pool.fee)/(y - amountOut);
            break;
        } 
        case PoolType.ConstantMean: {
            const x = parseInt(xBN.toString());
            const y = parseInt(yBN.toString());
            const [weight0, weight1] = ConstantMeanParamsFromData(pool.data);
            const weightRatio = direction ? weight1/weight0 : weight1/weight0;
            input = x*(1-pool.fee)*(Math.pow(1-amountOut/y, -weightRatio) - 1);
            break;
        } 
        case PoolType.Hybrid: {
            const yNewBN = yBN.sub(getBigNumber(undefined, amountOut));
            const xNewBN = HybridgetYBN(pool, yNewBN);            
            input = Math.round(parseInt(xNewBN.sub(xBN).toString())/(1-pool.fee));

            // const yNew = y - amountOut;
            // const xNew = HybridgetY(pool, yNew);
            // input = (xNew - x)/(1-pool.fee);
            break;
        }
        default:
            console.error('Unknown pool type');
    }
    
    ASSERT(() => {
        const amount2 = calcOutByIn(pool, input, direction);
        const res = closeValues(amountOut, amount2, 1e-6);
        if (!res)
            console.log('Error 138:', amountOut, amount2);
        return res;
    });
    return input;
}

export function calcPrice(pool:Pool, amountIn: number): number {
    const r0 = parseInt(pool.reserve0.toString());
    const r1 = parseInt(pool.reserve1.toString());
    switch(pool.type) {
        case PoolType.ConstantProduct: {
            const x = r0/(1-pool.fee);
            return r1*x/(x+amountIn)/(x+amountIn);
        } 
        case PoolType.ConstantMean: {
            const [weight0, weight1] = ConstantMeanParamsFromData(pool.data);
            const weightRatio = weight0/weight1;
            const x = r0+amountIn*(1-pool.fee);
            return r1*weightRatio*(1-pool.fee)*Math.pow(r0/x, weightRatio)/x;
        } 
        case PoolType.Hybrid: {
            const D = parseInt(HybridComputeLiquidityBN(pool).toString());
            const A = HybridParamsFromData(pool.data)/A_PRECISION;
            const x = r0 + amountIn;
            const b = 4*A*x + D - 4*A*D;
            const ac4 = D*D*D/x;
            const Ds = Math.sqrt(b*b + 4*A*ac4);
            const res = (0.5 - (2*b-ac4/x)/Ds/4)*(1-pool.fee);
            return res;
        }
    }
    return 0;
}

function calcInputByPriceConstantMean(pool:Pool, price:number) {
    const r0 = parseInt(pool.reserve0.toString());
    const r1 = parseInt(pool.reserve1.toString());
    const w = ConstantMeanParamsFromData(pool.data);
    const weightRatio = w[0]/w[1];
    const t = r1*price*weightRatio*(1-pool.fee)*Math.pow(r0, weightRatio);
    return (Math.pow(t, 1/(weightRatio+1)) - r0)/(1-pool.fee);
}

export function calcInputByPrice(pool: Pool, priceEffective: number, hint = 1): number {
    switch(pool.type) {
        case PoolType.ConstantProduct: {
            const r0 = parseInt(pool.reserve0.toString());
            const r1 = parseInt(pool.reserve1.toString());
            const x = r0/(1-pool.fee);
            const res =  Math.sqrt(r1*x*priceEffective) - x;
            return res;
        } 
        case PoolType.ConstantMean: {
            const res = calcInputByPriceConstantMean(pool, priceEffective);
            return res;
        } 
        case PoolType.Hybrid: {
            return revertPositive( (x:number) => 1/calcPrice(pool, x), priceEffective, hint);
        }
    }
}


//====================== Utils ========================

export function ASSERT(f: () => boolean, t?: string) {
    if (!f() && t)
        console.error(t);
}

export function closeValues(a: number, b: number, accuracy: number): boolean {
    if (accuracy == 0)
        return a == b;
    if (a < 1/accuracy)
        return Math.abs(a-b) <= 10;
    return Math.abs(a/b-1) < accuracy;
}

export function calcSquareEquation(a:number, b:number, c:number): [number, number] {
    const D = b*b-4*a*c;
    console.assert(D >= 0, `Discriminant is negative! ${a} ${b} ${c}`);
    const sqrtD = Math.sqrt(D);
    return [(-b-sqrtD)/2/a, (-b+sqrtD)/2/a];
}

// returns such x > 0 that f(x) = out or 0 if there is no such x or f defined not everywhere
// hint - approximation of x to spead up the algorithm
// f assumed to be continues monotone growth function defined everywhere
export function revertPositive(f: (x:number)=>number, out: number, hint = 1) {
    try {
        if (out <= f(0)) return 0;
        let min, max;
        if (f(hint) > out) {
            min = hint/2;
            while (f(min) > out) min /= 2;
            max = min*2;
        } else {
            max = hint*2;
            while (f(max) < out) max *= 2;
            min = max/2;
        }
        
        while((max/min - 1) > 1e-4)
        {
            const x0: number = (min+max)/2;
            const y0 = f(x0);
            if (out == y0) return x0;
            if (out < y0) 
                max=x0;
            else
                min=x0;
        }
        return (min+max)/2;
    } catch (e) {
        return 0;
    }
}

export function getBigNumber(valueBN: BigNumber | undefined, value: number): BigNumber {
    if (valueBN !== undefined)
        return valueBN;

    if (value < Number.MAX_SAFE_INTEGER)
        return BigNumber.from(Math.round(value));

    const exp = Math.floor(Math.log(value)/Math.LN2);
    console.assert(exp >= 51, 'Internal Error 314');
    const shift = exp - 51;
    const mant = Math.round(value/Math.pow(2, shift));
    const res = BigNumber.from(mant).mul(BigNumber.from(2).pow(shift));
    return res;
}