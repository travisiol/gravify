"use client";

import { useEffect, useState } from "react";
import { Address } from "./ui/Address";
import { Button } from "./ui/Button";
import { Badge, Skeleton } from "./ui/Marks";
import { addressExplorerUrl } from "@/lib/chain";
import { formatUnitsFixed } from "@/lib/format";
import {
  emptySnapshot,
  readLiquidity,
  type LiquiditySnapshot,
  type Pool,
} from "@/lib/liquidity";

const REFRESH = 30_000;

/** Reads the factory once and hands the snapshot to whoever asked. */
export function useLiquidity() {
  const [snapshot, setSnapshot] = useState<LiquiditySnapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const load = () =>
      readLiquidity()
        .then((s) => live && setSnapshot(s))
        .catch(() => {
          if (!live) return;
          setFailed(true);
          setSnapshot(emptySnapshot);
        });
    load();
    const poll = setInterval(load, REFRESH);
    return () => {
      live = false;
      clearInterval(poll);
    };
  }, []);

  return { snapshot, failed };
}

/**
 * Pools enumerated from the router's factory, read at one block. `limit`
 * trims the landing page to the top of the list; the explorer shows them all.
 */
export function LiquidityTable({ limit }: { limit?: number }) {
  const { snapshot, failed } = useLiquidity();

  if (!snapshot) return <Skeleton className="h-48" />;

  const pools = limit ? snapshot.pools.slice(0, limit) : snapshot.pools;

  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        <span>
          Factory{" "}
          <Address
            address={snapshot.factory ?? undefined}
            href={snapshot.factory ? addressExplorerUrl(snapshot.factory) : undefined}
          />
        </span>
        <span>
          · {Number(snapshot.totalPairs).toLocaleString("en-US")} pairs total ·{" "}
          {snapshot.scanned} read
        </span>
        {snapshot.blockNumber !== null ? (
          <span>· block #{snapshot.blockNumber.toString()}</span>
        ) : null}
        {snapshot.wethPriceUsdg !== null ? (
          <span>· WETH ≈ {formatUnitsFixed(snapshot.wethPriceUsdg, 6, 1)} USDG</span>
        ) : null}
      </div>

      {pools.length === 0 ? (
        <p className="py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          {failed ? "Router unreachable" : "No pools found at this block"}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {[
                  "Pair",
                  "TVL (USDG)",
                  "Token 0 reserve",
                  "Token 1 reserve",
                  "Pool",
                  "Fee",
                  "Status",
                  "",
                ].map((head, i) => (
                  <th
                    key={i}
                    className="py-2 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-ink-muted"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pools.map((pool) => (
                <Row key={pool.address} pool={pool} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        {snapshot.notes.map((note) => (
          <li key={note}>· {note}</li>
        ))}
      </ul>
    </div>
  );
}

function Row({ pool }: { pool: Pool }) {
  return (
    <tr className="border-b border-line/70 last:border-0">
      <td className="py-3 pr-4 align-middle">
        <span className="font-semibold text-ink">
          {pool.token0.symbol} / {pool.token1.symbol}
        </span>
      </td>
      <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
        {pool.tvlUsdg === null ? "—" : formatUnitsFixed(pool.tvlUsdg, 6, 0)}
      </td>
      <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
        {formatUnitsFixed(pool.reserve0, pool.token0.decimals, 4)} {pool.token0.symbol}
      </td>
      <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
        {formatUnitsFixed(pool.reserve1, pool.token1.decimals, 4)} {pool.token1.symbol}
      </td>
      <td className="py-3 pr-4 align-middle">
        <Address address={pool.address} href={addressExplorerUrl(pool.address)} />
      </td>
      <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
        {(pool.feeBps / 100).toFixed(2)}%
      </td>
      <td className="py-3 pr-4 align-middle">
        <Badge tone={pool.status === "ACTIVE" ? "ok" : "off"}>{pool.status}</Badge>
      </td>
      <td className="py-3 pr-4 align-middle">
        <div className="flex gap-2">
          <Button
            size="sm"
            href={`/app/swap?in=${pool.token0.address}&out=${pool.token1.address}`}
          >
            Swap
          </Button>
          <Button size="sm" variant="secondary" href={addressExplorerUrl(pool.address)}>
            View
          </Button>
        </div>
      </td>
    </tr>
  );
}
