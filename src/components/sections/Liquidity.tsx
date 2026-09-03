"use client";

import { useEffect, useState } from "react";
import { Address } from "../ui/Address";
import { Button } from "../ui/Button";
import { Badge, SectionHeader, Skeleton } from "../ui/Marks";
import { Reveal } from "../ui/Reveal";
import { addressExplorerUrl } from "@/lib/chain";
import {
  emptySnapshot,
  formatUnitsFixed,
  readLiquidity,
  type LiquiditySnapshot,
  type Pool,
} from "@/lib/liquidity";

const ROWS = 6;
const REFRESH = 30_000;

/** 07 — pools enumerated from the factory and read at one block. */
export function Liquidity() {
  const [snapshot, setSnapshot] = useState<LiquiditySnapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const load = () =>
      readLiquidity()
        .then((s) => live && setSnapshot(s))
        .catch(() => live && (setFailed(true), setSnapshot(emptySnapshot)));
    load();
    const poll = setInterval(load, REFRESH);
    return () => {
      live = false;
      clearInterval(poll);
    };
  }, []);

  return (
    <section className="border-b border-line bg-sky-light/40">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
        <Reveal>
          <SectionHeader index="07" kicker="Liquidity" title="Backed on-chain.">
            Pools are enumerated from the configured router&apos;s factory and read at one
            block. TVL comes from reserves quoted in USDG through the on-chain WETH/USDG
            pool; volume needs an indexer and is omitted.
          </SectionHeader>
        </Reveal>

        <Reveal>
          {!snapshot ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="rounded-md border border-line bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                <span>
                  Factory{" "}
                  <Address
                    address={snapshot.factory ?? undefined}
                    href={
                      snapshot.factory ? addressExplorerUrl(snapshot.factory) : undefined
                    }
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
                  <span>
                    · WETH ≈ {formatUnitsFixed(snapshot.wethPriceUsdg, 6, 1)} USDG
                  </span>
                ) : null}
              </div>

              {snapshot.pools.length === 0 ? (
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
                        ].map((h, i) => (
                          <th
                            key={i}
                            className="py-2 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-ink-muted"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.pools.slice(0, ROWS).map((pool) => (
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
          )}
        </Reveal>
      </div>
    </section>
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
