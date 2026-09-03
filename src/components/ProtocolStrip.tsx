"use client";

import type { ReactNode } from "react";
import { Skeleton } from "./ui/Marks";
import { chains } from "@/lib/chain";
import { supportedAssets, deployedAssetCount } from "@/lib/assets";
import { formatAge, formatBlock, useChainStatus } from "@/lib/useChainStatus";

/** Five numbers, read live, directly under the fold. */
export function ProtocolStrip() {
  const { robinhood, ethereum, now } = useChainStatus();

  const cells: { label: string; value: ReactNode; sub?: ReactNode }[] = [
    {
      label: "Network",
      value: chains.robinhood.name,
      sub: `chain id ${chains.robinhood.id} · ${robinhood ? "RPC connected" : "connecting"}`,
    },
    {
      label: "Block",
      value: robinhood ? formatBlock(robinhood.number) : <Skeleton className="h-6 w-28" />,
      sub: robinhood ? formatAge(robinhood.timestamp, now) : undefined,
    },
    {
      label: "Source",
      value: chains.ethereum.name,
      sub: ethereum
        ? `${formatBlock(ethereum.number)} · ${formatAge(ethereum.timestamp, now)}`
        : "connecting",
    },
    {
      label: "Assets",
      value: `${deployedAssetCount} / ${supportedAssets.length}`,
      sub: "registry defined · none deployed",
    },
    {
      label: "Reserves",
      value: deployedAssetCount === 0 ? "—" : <Skeleton className="h-6 w-20" />,
      sub: "awaiting deployment",
    },
  ];

  return (
    <section className="border-b border-line bg-sky-light/50">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-y divide-line md:grid-cols-5 md:divide-x md:divide-y-0">
        {cells.map((cell) => (
          <div key={cell.label} className="px-5 py-5 md:px-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              {cell.label}
            </div>
            <div className="mt-2 font-mono text-lg tabular-nums text-ink">
              {cell.value}
            </div>
            {cell.sub ? (
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                {cell.sub}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
