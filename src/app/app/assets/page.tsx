"use client";

import { useRouter } from "next/navigation";
import { Blank, PageHeader } from "@/components/app/Shell";
import { useLiquidity } from "@/components/LiquidityTable";
import { Badge, Skeleton } from "@/components/ui/Marks";
import { chains } from "@/lib/chain";
import { supportedAssets } from "@/lib/assets";
import { site } from "@/lib/site";
import {
  formatAmount,
  formatBacking,
  statusLabel,
  statusTone,
  type ReserveReport,
} from "@/lib/reserves";
import { useReserves } from "@/lib/useReserves";

const columns = [
  "Asset",
  "Source",
  "Destination",
  "Locked",
  "Minted",
  "Backing",
  "Liquidity",
  "Status",
];

/** The registry, with every live figure the interface can actually read. */
export default function AssetsPage() {
  const { reports, pending } = useReserves();
  const { snapshot } = useLiquidity();
  const router = useRouter();

  const poolsFor = (token: string) =>
    !snapshot || !token
      ? 0
      : snapshot.pools.filter(
          (p) =>
            p.token0.address.toLowerCase() === token.toLowerCase() ||
            p.token1.address.toLowerCase() === token.toLowerCase(),
        ).length;

  return (
    <>
      <PageHeader kicker="Assets" title="Supported assets">
        The registry lists every asset {site.name} is built to carry. Locked, minted and
        backing figures are live reads; a row without deployed contracts shows exactly
        that.
      </PageHeader>

      <div className="rounded-md border border-line bg-white p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {columns.map((c) => (
                  <th
                    key={c}
                    className="py-2 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-ink-muted"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {supportedAssets.map((asset) => {
                const report = reports?.find((r) => r.asset.symbol === asset.symbol);
                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => router.push(`/app/assets/${asset.wrapped}`)}
                    className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-sky-panel/60"
                  >
                    <td className="py-3 pr-4 align-middle">
                      <span className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.icon} alt="" className="h-7 w-7" />
                        <span>
                          <span className="block font-semibold text-ink">
                            {asset.symbol}
                          </span>
                          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                            {asset.name}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-middle">{chains.ethereum.name}</td>
                    <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
                      {asset.wrapped}
                    </td>
                    <Figure value={locked(report)} pending={pending} />
                    <Figure value={minted(report)} pending={pending} />
                    <Figure value={backing(report)} pending={pending} />
                    <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
                      {poolsFor(asset.token)} pools
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      {report ? (
                        <Badge tone={statusTone[report.status]}>
                          {statusLabel[report.status]}
                        </Badge>
                      ) : (
                        <Skeleton className="h-5 w-32" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function locked(report?: ReserveReport) {
  if (!report || report.collateralBalance === null || report.sourceDecimals === null) {
    return null;
  }
  return `${formatAmount(report.collateralBalance, report.sourceDecimals, 2)} ${report.asset.symbol}`;
}

function minted(report?: ReserveReport) {
  if (!report || report.wrappedSupply === null || report.destinationDecimals === null) {
    return null;
  }
  return `${formatAmount(report.wrappedSupply, report.destinationDecimals, 2)} ${report.asset.wrapped}`;
}

function backing(report?: ReserveReport) {
  if (!report || report.backingBps === null) return null;
  return formatBacking(report.backingBps);
}

function Figure({ value, pending }: { value: string | null; pending: boolean }) {
  return (
    <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
      {pending ? <Skeleton className="h-4 w-16" /> : (value ?? <Blank />)}
    </td>
  );
}
