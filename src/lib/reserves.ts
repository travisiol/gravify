import { erc20Abi, parseAbi } from "viem";
import { ethClient, robinhoodClient, chains } from "./chain";
import { supportedAssets, type SupportedAsset } from "./assets";
import type { Tone } from "@/components/ui/Marks";

const vaultAbi = parseAbi(["function totalLocked() view returns (uint256)"]);

export type ReserveStatus =
  | "FULLY_BACKED"
  | "WATCH"
  | "UNDERCOLLATERALIZED"
  | "NOT_DEPLOYED"
  | "UNVERIFIED";

export const statusLabel: Record<ReserveStatus, string> = {
  FULLY_BACKED: "FULLY BACKED",
  WATCH: "WATCH",
  UNDERCOLLATERALIZED: "UNDERCOLLATERALIZED",
  NOT_DEPLOYED: "AWAITING DEPLOYMENT",
  UNVERIFIED: "UNVERIFIED",
};

export const statusTone: Record<ReserveStatus, Tone> = {
  FULLY_BACKED: "ok",
  WATCH: "warn",
  UNDERCOLLATERALIZED: "bad",
  NOT_DEPLOYED: "off",
  UNVERIFIED: "bad",
};

/** One contract read, kept so the inspector can show its provenance. */
export type RawRead = {
  chain: string;
  label: string;
  contract: string;
  method: string;
  value: string;
  block: bigint;
};

export type ReserveReport = {
  asset: SupportedAsset;
  status: ReserveStatus;
  collateralBalance: bigint | null;
  vaultLedger: bigint | null;
  wrappedSupply: bigint | null;
  sourceDecimals: number | null;
  destinationDecimals: number | null;
  backingBps: bigint | null;
  sourceBlock: bigint | null;
  destinationBlock: bigint | null;
  sourceTimestamp: bigint | null;
  destinationTimestamp: bigint | null;
  reads: RawRead[];
  error?: string;
};

function undeployed(asset: SupportedAsset): ReserveReport {
  return {
    asset,
    status: "NOT_DEPLOYED",
    collateralBalance: null,
    vaultLedger: null,
    wrappedSupply: null,
    sourceDecimals: null,
    destinationDecimals: null,
    backingBps: null,
    sourceBlock: null,
    destinationBlock: null,
    sourceTimestamp: null,
    destinationTimestamp: null,
    reads: [],
  };
}

/**
 * Compares one gToken against the collateral its vault holds, both read at a
 * pinned block so the two sides describe the same instant. Nothing is stored:
 * the ratio is computed here, in the open, on every read.
 */
export async function readReserve(asset: SupportedAsset): Promise<ReserveReport> {
  if (!asset.vault || !asset.token) return undeployed(asset);

  const vault = asset.vault as `0x${string}`;
  const token = asset.token as `0x${string}`;
  const base = undeployed(asset);

  try {
    const [srcBlock, dstBlock] = await Promise.all([
      ethClient.getBlock(),
      robinhoodClient.getBlock(),
    ]);

    const [source, destination] = await Promise.all([
      ethClient.multicall({
        blockNumber: srcBlock.number!,
        allowFailure: false,
        contracts: [
          { address: asset.source, abi: erc20Abi, functionName: "balanceOf", args: [vault] },
          { address: asset.source, abi: erc20Abi, functionName: "decimals" },
          { address: vault, abi: vaultAbi, functionName: "totalLocked" },
        ],
      }),
      robinhoodClient.multicall({
        blockNumber: dstBlock.number!,
        allowFailure: false,
        contracts: [
          { address: token, abi: erc20Abi, functionName: "totalSupply" },
          { address: token, abi: erc20Abi, functionName: "decimals" },
        ],
      }),
    ]);

    const [collateral, sourceDecimals, locked] = source as [bigint, number, bigint];
    const [supply, destinationDecimals] = destination as [bigint, number];

    const reads: RawRead[] = [
      { chain: chains.ethereum.name, label: "Source token", contract: asset.source, method: `balanceOf(${vault})`, value: collateral.toString(), block: srcBlock.number! },
      { chain: chains.ethereum.name, label: "Source token", contract: asset.source, method: "decimals()", value: String(sourceDecimals), block: srcBlock.number! },
      { chain: chains.ethereum.name, label: "Vault", contract: vault, method: "totalLocked()", value: locked.toString(), block: srcBlock.number! },
      { chain: chains.robinhood.name, label: "gToken", contract: token, method: "totalSupply()", value: supply.toString(), block: dstBlock.number! },
      { chain: chains.robinhood.name, label: "gToken", contract: token, method: "decimals()", value: String(destinationDecimals), block: dstBlock.number! },
    ];

    // Put both sides on the same decimal footing before dividing.
    const aligned =
      sourceDecimals === destinationDecimals
        ? collateral
        : sourceDecimals < destinationDecimals
          ? collateral * 10n ** BigInt(destinationDecimals - sourceDecimals)
          : collateral / 10n ** BigInt(sourceDecimals - destinationDecimals);

    const backingBps = supply === 0n ? null : (10000n * aligned) / supply;

    const status: ReserveStatus =
      supply === 0n
        ? "FULLY_BACKED"
        : backingBps === null
          ? "UNVERIFIED"
          : backingBps >= 10000n
            ? "FULLY_BACKED"
            : backingBps >= 9900n
              ? "WATCH"
              : "UNDERCOLLATERALIZED";

    return {
      ...base,
      status,
      collateralBalance: collateral,
      vaultLedger: locked,
      wrappedSupply: supply,
      sourceDecimals,
      destinationDecimals,
      backingBps,
      sourceBlock: srcBlock.number!,
      destinationBlock: dstBlock.number!,
      sourceTimestamp: srcBlock.timestamp,
      destinationTimestamp: dstBlock.timestamp,
      reads,
    };
  } catch (e) {
    return {
      ...base,
      status: "UNVERIFIED",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function readAllReserves() {
  return Promise.all(supportedAssets.map(readReserve));
}

/** Formats a token amount with a fixed number of decimal places. */
export function formatAmount(value: bigint, decimals: number, dp = 2) {
  const base = 10n ** BigInt(decimals);
  const whole = (value / base).toLocaleString("en-US");
  if (dp === 0) return whole;
  const frac = (value % base).toString().padStart(decimals, "0").slice(0, dp);
  return `${whole}.${frac}`;
}

export function formatBacking(bps: bigint) {
  return `${(Number(bps) / 100).toFixed(2)}%`;
}
