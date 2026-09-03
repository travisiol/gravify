import { erc20Abi, parseAbi, zeroAddress } from "viem";
import {
  CANONICAL_TOKENS,
  robinhoodClient,
  SWAP_ROUTER,
  WETH_USDG_POOL,
} from "./chain";
import { supportedAssets } from "./assets";

const routerAbi = parseAbi([
  "function factory() view returns (address)",
  "function WETH() view returns (address)",
]);

const factoryAbi = parseAbi([
  "function allPairsLength() view returns (uint256)",
  "function allPairs(uint256) view returns (address)",
  "function getPair(address,address) view returns (address)",
]);

const pairAbi = parseAbi([
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112,uint112,uint32)",
  "function totalSupply() view returns (uint256)",
]);

/** How far into each end of the factory's pair list we read. */
const SCAN_EDGE = 40;

export type PoolToken = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  isGravToken: boolean;
};

export type Pool = {
  address: `0x${string}`;
  token0: PoolToken;
  token1: PoolToken;
  reserve0: bigint;
  reserve1: bigint;
  feeBps: number;
  lpSupply: bigint;
  status: "ACTIVE" | "EMPTY";
  tvlUsdg: bigint | null;
};

export type LiquiditySnapshot = {
  factory: `0x${string}` | null;
  totalPairs: bigint;
  scanned: number;
  pools: Pool[];
  blockNumber: bigint | null;
  wethPriceUsdg: bigint | null;
  notes: string[];
};

export const emptySnapshot: LiquiditySnapshot = {
  factory: null,
  totalPairs: 0n,
  scanned: 0,
  pools: [],
  blockNumber: null,
  wethPriceUsdg: null,
  notes: [],
};

/**
 * Enumerates the router's factory and reads every pool at a single block, so
 * the whole table is one consistent view of the chain rather than a stream of
 * numbers drifting past each other.
 */
export async function readLiquidity(): Promise<LiquiditySnapshot> {
  if (!SWAP_ROUTER || SWAP_ROUTER === zeroAddress) return emptySnapshot;

  const client = robinhoodClient;
  const factory = await client.readContract({
    address: SWAP_ROUTER,
    abi: routerAbi,
    functionName: "factory",
  });
  const blockNumber = await client.getBlockNumber();
  const totalPairs = await client.readContract({
    address: factory,
    abi: factoryAbi,
    functionName: "allPairsLength",
    blockNumber,
  });

  const total = Number(totalPairs);
  const indices: bigint[] = [];
  for (let i = 0; i < Math.min(SCAN_EDGE, total); i++) indices.push(BigInt(i));
  for (let i = Math.max(SCAN_EDGE, total - SCAN_EDGE); i < total; i++) {
    indices.push(BigInt(i));
  }

  // Any gToken that is live gets its canonical pairs looked up by name.
  const gTokens = supportedAssets
    .map((a) => a.token)
    .filter(Boolean) as `0x${string}`[];
  const wanted: { a: `0x${string}`; b: `0x${string}` }[] = [];
  for (const g of gTokens) {
    for (const c of CANONICAL_TOKENS) wanted.push({ a: g, b: c.address });
  }

  const [listed, paired] = await Promise.all([
    client.multicall({
      allowFailure: true,
      blockNumber,
      contracts: indices.map((i) => ({
        address: factory,
        abi: factoryAbi,
        functionName: "allPairs",
        args: [i],
      })),
    }),
    wanted.length
      ? client.multicall({
          allowFailure: true,
          blockNumber,
          contracts: wanted.map((w) => ({
            address: factory,
            abi: factoryAbi,
            functionName: "getPair",
            args: [w.a, w.b],
          })),
        })
      : Promise.resolve([]),
  ]);

  const addresses = new Set<string>();
  for (const r of [...listed, ...paired]) {
    if (r.status !== "success") continue;
    const pair = r.result as unknown as string;
    if (pair && pair !== zeroAddress) addresses.add(pair.toLowerCase());
  }
  if (WETH_USDG_POOL) addresses.add(WETH_USDG_POOL.toLowerCase());

  const pairs = [...addresses] as `0x${string}`[];
  const reads = await client.multicall({
    allowFailure: true,
    blockNumber,
    contracts: pairs.flatMap((address) => [
      { address, abi: pairAbi, functionName: "token0" },
      { address, abi: pairAbi, functionName: "token1" },
      { address, abi: pairAbi, functionName: "getReserves" },
      { address, abi: pairAbi, functionName: "totalSupply" },
    ]),
  });

  type Raw = {
    pair: `0x${string}`;
    t0: `0x${string}`;
    t1: `0x${string}`;
    r0: bigint;
    r1: bigint;
    lp: bigint;
  };
  const raw: Raw[] = [];
  const tokenSet = new Set<string>();
  for (let i = 0; i < pairs.length; i++) {
    const [t0, t1, res, lp] = reads.slice(4 * i, 4 * i + 4);
    if (
      t0?.status !== "success" ||
      t1?.status !== "success" ||
      res?.status !== "success" ||
      lp?.status !== "success"
    ) {
      continue;
    }
    const [r0, r1] = res.result as readonly [bigint, bigint, number];
    raw.push({
      pair: pairs[i],
      t0: t0.result as `0x${string}`,
      t1: t1.result as `0x${string}`,
      r0,
      r1,
      lp: lp.result as bigint,
    });
    tokenSet.add((t0.result as string).toLowerCase());
    tokenSet.add((t1.result as string).toLowerCase());
  }

  const tokens = [...tokenSet] as `0x${string}`[];
  const meta = await client.multicall({
    allowFailure: true,
    blockNumber,
    contracts: tokens.flatMap((address) => [
      { address, abi: erc20Abi, functionName: "symbol" },
      { address, abi: erc20Abi, functionName: "decimals" },
    ]),
  });

  const gravSet = new Set(gTokens.map((g) => g.toLowerCase()));
  const byAddress = new Map<string, PoolToken>();
  tokens.forEach((address, i) => {
    const symbol = meta[2 * i];
    const decimals = meta[2 * i + 1];
    const known = CANONICAL_TOKENS.find(
      (c) => c.address.toLowerCase() === address.toLowerCase(),
    );
    byAddress.set(address.toLowerCase(), {
      address,
      symbol: symbol?.status === "success" ? (symbol.result as string) : known?.symbol ?? "?",
      decimals:
        decimals?.status === "success"
          ? Number(decimals.result)
          : known?.decimals ?? 18,
      isGravToken: gravSet.has(address.toLowerCase()),
    });
  });

  const weth = CANONICAL_TOKENS.find((c) => c.symbol === "WETH");
  const stable = CANONICAL_TOKENS.find((c) => c.stable);

  // Price WETH from the canonical pool, in stable units.
  let wethPriceUsdg: bigint | null = null;
  const quote = raw.find(
    (r) => r.pair.toLowerCase() === WETH_USDG_POOL.toLowerCase(),
  );
  if (quote && weth && stable) {
    const wethIsToken0 = quote.t0.toLowerCase() === weth.address.toLowerCase();
    const wethReserve = wethIsToken0 ? quote.r0 : quote.r1;
    const stableReserve = wethIsToken0 ? quote.r1 : quote.r0;
    if (wethReserve > 0n) {
      wethPriceUsdg = (stableReserve * 10n ** BigInt(weth.decimals)) / wethReserve;
    }
  }

  const tvlOf = (a: PoolToken, b: PoolToken, r0: bigint, r1: bigint) => {
    for (const [token, reserve] of [
      [a, r0],
      [b, r1],
    ] as const) {
      if (stable && token.address.toLowerCase() === stable.address.toLowerCase()) {
        return 2n * reserve;
      }
      if (
        weth &&
        wethPriceUsdg !== null &&
        token.address.toLowerCase() === weth.address.toLowerCase()
      ) {
        return (reserve * wethPriceUsdg * 2n) / 10n ** BigInt(weth.decimals);
      }
    }
    return null;
  };

  const pools: Pool[] = raw.map((r) => {
    const token0 = byAddress.get(r.t0.toLowerCase())!;
    const token1 = byAddress.get(r.t1.toLowerCase())!;
    return {
      address: r.pair,
      token0,
      token1,
      reserve0: r.r0,
      reserve1: r.r1,
      feeBps: 30,
      lpSupply: r.lp,
      status: r.r0 > 0n && r.r1 > 0n ? "ACTIVE" : "EMPTY",
      tvlUsdg: tvlOf(token0, token1, r.r0, r.r1),
    };
  });

  // gToken pools first — they are the reason this table exists — then by size.
  pools.sort((a, b) => {
    const aG = Number(a.token0.isGravToken || a.token1.isGravToken);
    const bG = Number(b.token0.isGravToken || b.token1.isGravToken);
    if (aG !== bG) return bG - aG;
    const at = a.tvlUsdg ?? -1n;
    const bt = b.tvlUsdg ?? -1n;
    return bt > at ? 1 : bt < at ? -1 : 0;
  });

  return {
    factory,
    totalPairs,
    scanned: pairs.length,
    pools,
    blockNumber,
    wethPriceUsdg,
    notes: [
      `Scanned the oldest ${Math.min(SCAN_EDGE, total)} and newest ${Math.min(
        SCAN_EDGE,
        Math.max(0, total - SCAN_EDGE),
      )} of ${total.toLocaleString("en-US")} pairs, plus gToken and canonical pools.`,
      wethPriceUsdg !== null
        ? "TVL is derived from reserves at this block, quoted in USDG (WETH priced via the WETH/USDG pool). Pools without WETH or USDG show no TVL."
        : "TVL unavailable: no USDG quote on this network.",
      "Volume is omitted: it needs an indexer.",
    ],
  };
}
