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
  tokenIn: TokenInfo;
  tokenOut: TokenInfo;
  reserveIn: bigint;
  reserveOut: bigint;
  amountIn: bigint;
  amountOut: bigint;
  /** How much of the total slippage this pool alone contributes. */
  impactBps: number;
};

export type Quote = {
  amountIn: bigint;
  expectedOutput: bigint;
  minimumOutput: bigint;
  priceImpactBps: number;
  path: `0x${string}`[];
  route: Hop[];
  /** The router this quote was priced against. */
  routerAddress: `0x${string}`;
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

  // Name every token on the path, so the inspector can show units not wei.
  const named = new Map<string, TokenInfo>();
  for (const t of [tokenIn, tokenOut, ...CANONICAL_TOKENS]) {
    named.set(t.address.toLowerCase(), {
      address: t.address,
      symbol: t.symbol,
      decimals: t.decimals,
    });
  }
  const unknown = best.path.filter((a) => !named.has(a.toLowerCase()));
  for (const address of unknown) {
    named.set(address.toLowerCase(), await readToken(address));
  }

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
    const reserveIn = aIsToken0 ? r0 : r1;
    const reserveOut = aIsToken0 ? r1 : r0;
    const hopIn = best.amounts[i];
    const hopOut = best.amounts[i + 1];

    // What this pool would have paid at its mid-price, versus what it pays.
    const midOut = reserveIn === 0n ? 0n : (hopIn * reserveOut) / reserveIn;
    const impactBps =
      midOut === 0n ? 0 : Number(((midOut - hopOut) * 10000n) / midOut);

    route.push({
      pair,
      tokenIn: named.get(a.toLowerCase())!,
      tokenOut: named.get(b.toLowerCase())!,
      reserveIn,
      reserveOut,
      amountIn: hopIn,
      amountOut: hopOut,
      impactBps: Math.max(0, impactBps),
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
    routerAddress: SWAP_ROUTER,
    blockNumber,
    quotedAt: Date.now(),
  };
}
