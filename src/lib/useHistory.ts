"use client";

import { useEffect, useState } from "react";
import { erc20Abi, parseAbiItem, zeroAddress } from "viem";
import { robinhoodClient } from "./chain";
import { supportedAssets } from "./assets";
import { formatAmount } from "./reserves";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);

/** How far back the RPC-log adapter looks without an indexer behind it. */
const LOOKBACK = 50_000n;

/** Only assets whose gToken exists can have events to read. */
const deployed = supportedAssets.filter((a) => a.token);

export type HistoryEntry = {
  hash: `0x${string}`;
  logIndex: number;
  kind: "MINT" | "BURN" | "TRANSFER";
  label: string;
  symbol: string;
  amount: string;
  block: bigint;
};

/**
 * Rebuilds a wallet's activity from gToken transfer logs: a mint from the zero
 * address is a completed wrap, a burn to it is an unwrap.
 */
export function useHistory(account: string | null) {
  // Keyed by account so a wallet switch reads as pending, not as stale rows.
  const [result, setResult] = useState<{
    account: string;
    entries: HistoryEntry[];
  } | null>(null);

  const idle = !account || deployed.length === 0;

  useEffect(() => {
    if (idle || !account) return;
    let live = true;

    (async () => {
      const head = await robinhoodClient.getBlockNumber();
      const fromBlock = head > LOOKBACK ? head - LOOKBACK : 0n;
      const found: HistoryEntry[] = [];

      for (const asset of deployed) {
        const address = asset.token as `0x${string}`;
        const decimals = await robinhoodClient
          .readContract({ address, abi: erc20Abi, functionName: "decimals" })
          .catch(() => asset.decimals);

        const [incoming, outgoing] = await Promise.all([
          robinhoodClient.getLogs({
            address,
            event: transferEvent,
            args: { to: account as `0x${string}` },
            fromBlock,
            toBlock: head,
          }),
          robinhoodClient.getLogs({
            address,
            event: transferEvent,
            args: { from: account as `0x${string}` },
            fromBlock,
            toBlock: head,
          }),
        ]);

        for (const log of [...incoming, ...outgoing]) {
          const from = log.args.from as string;
          const to = log.args.to as string;
          const value = log.args.value as bigint;
          const kind =
            from === zeroAddress ? "MINT" : to === zeroAddress ? "BURN" : "TRANSFER";
          found.push({
            hash: log.transactionHash!,
            logIndex: log.logIndex ?? 0,
            kind,
            label: kind === "MINT" ? "Wrap" : kind === "BURN" ? "Unwrap" : "Transfer",
            symbol: asset.wrapped,
            amount: formatAmount(value, Number(decimals), 4),
            block: log.blockNumber!,
          });
        }
      }

      if (!live) return;
      found.sort((a, b) => (b.block > a.block ? 1 : b.block < a.block ? -1 : 0));
      setResult({ account, entries: found });
    })().catch(() => live && setResult({ account, entries: [] }));

    return () => {
      live = false;
    };
  }, [account, idle]);

  const fresh = account !== null && result?.account === account;
  return {
    entries: fresh ? result.entries : [],
    pending: !idle && !fresh,
    unavailable: deployed.length === 0,
  };
}
