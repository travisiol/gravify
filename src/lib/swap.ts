import { erc20Abi, parseAbi, zeroAddress } from "viem";
import { CANONICAL_TOKENS, robinhoodClient, SWAP_ROUTER } from "./chain";

const routerAbi = parseAbi([
  "function factory() view returns (address)",
  "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)",
]);

const factoryAbi = parseAbi([
  "function getPair(address,address) view returns (address)",
]);

const pairAbi = parseAbi([
  "function token0() view returns (address)",
  "function getReserves() view returns (uint112,uint112,uint32)",
]);

export type TokenInfo = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
};

export type Hop = {
  pair: `0x${string}`;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  reserveIn: bigint;
  reserveOut: bigint;
};

export type Quote = {
  amountIn: bigint;
  expectedOutput: bigint;
  minimumOutput: bigint;
  priceImpactBps: number;
  path: `0x${string}`[];
  route: Hop[];
  blockNumber: bigint;
  quotedAt: number;
};

export class NoRouteError extends Error {
  constructor(message = "No route between these tokens on the configured router.") {
    super(message);
    this.name = "NoRouteError";
  }
}

/** Reads symbol and decimals for a pasted address. */
export async function readToken(address: `0x${string}`): Promise<TokenInfo> {
  const [symbol, decimals] = await robinhoodClient.multicall({
    allowFailure: false,
    contracts: [
      { address, abi: erc20Abi, functionName: "symbol" },
      { address, abi: erc20Abi, functionName: "decimals" },
    ],
  });
  return { address, symbol: symbol as string, decimals: Number(decimals) };
}

/**
 * Quotes a swap from the router itself: the direct pair first, then a two-hop
 * route through WETH. Price impact comes from the reserves along the route, so
 * it describes the pools rather than a model of them.
 */
export async function quoteSwap(
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  amountIn: bigint,
  slippageBps: number,
): Promise<Quote> {
  if (!SWAP_ROUTER || SWAP_ROUTER === zeroAddress) {
    throw new NoRouteError("Swap router not configured.");
  }
  if (amountIn <= 0n) throw new NoRouteError("Enter an amount to quote.");

  const weth = CANONICAL_TOKENS.find((t) => t.symbol === "WETH");
  const [factory, blockNumber] = await Promise.all([
    robinhoodClient.readContract({
      address: SWAP_ROUTER,
      abi: routerAbi,
      functionName: "factory",
    }),
    robinhoodClient.getBlockNumber(),
  ]);

  const candidates: `0x${string}`[][] = [[tokenIn.address, tokenOut.address]];
  if (
    weth &&
    tokenIn.address.toLowerCase() !== weth.address.toLowerCase() &&
    tokenOut.address.toLowerCase() !== weth.address.toLowerCase()
  ) {
    candidates.push([tokenIn.address, weth.address, tokenOut.address]);
  }

  let best: { path: `0x${string}`[]; amounts: bigint[] } | null = null;
  for (const path of candidates) {
    try {
      const amounts = (await robinhoodClient.readContract({
        address: SWAP_ROUTER,
        abi: routerAbi,
        functionName: "getAmountsOut",
        args: [amountIn, path],
        blockNumber,
      })) as readonly bigint[];
      const out = amounts[amounts.length - 1];
      if (out > 0n && (!best || out > best.amounts[best.amounts.length - 1])) {
        best = { path, amounts: [...amounts] };
      }
    } catch {
      /* this path has no pool — try the next one */
    }
  }
  if (!best) throw new NoRouteError();

  // Read the pools the route actually touches, for the impact figure.
  const route: Hop[] = [];
  for (let i = 0; i < best.path.length - 1; i++) {
    const a = best.path[i];
    const b = best.path[i + 1];
    const pair = await robinhoodClient.readContract({
      address: factory,
      abi: factoryAbi,
      functionName: "getPair",
      args: [a, b],
      blockNumber,
    });
    if (pair === zeroAddress) continue;
    const [token0, reserves] = await robinhoodClient.multicall({
      allowFailure: false,
      blockNumber,
      contracts: [
        { address: pair, abi: pairAbi, functionName: "token0" },
        { address: pair, abi: pairAbi, functionName: "getReserves" },
      ],
    });
    const [r0, r1] = reserves as readonly [bigint, bigint, number];
    const aIsToken0 = (token0 as string).toLowerCase() === a.toLowerCase();
    route.push({
      pair,
      tokenIn: a,
      tokenOut: b,
      reserveIn: aIsToken0 ? r0 : r1,
      reserveOut: aIsToken0 ? r1 : r0,
    });
  }

  const expectedOutput = best.amounts[best.amounts.length - 1];

  // Mid-price output: what the pools would return with no depth consumed.
  let numerator = amountIn;
  let denominator = 1n;
  for (const hop of route) {
    numerator *= hop.reserveOut;
    denominator *= hop.reserveIn;
  }
  const mid = denominator === 0n ? 0n : numerator / denominator;
  const priceImpactBps =
    mid === 0n ? 0 : Number(((mid - expectedOutput) * 10000n) / mid);

  return {
    amountIn,
    expectedOutput,
    minimumOutput: (expectedOutput * BigInt(10000 - slippageBps)) / 10000n,
    priceImpactBps: Math.max(0, priceImpactBps),
    path: best.path,
    route,
    blockNumber,
    quotedAt: Date.now(),
  };
}
