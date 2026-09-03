"use client";

import { notFound, useParams } from "next/navigation";
import { Blank, PageHeader, Panel } from "@/components/app/Shell";
import { ReserveCard } from "@/components/ReserveCard";
import { Address } from "@/components/ui/Address";
import { Button } from "@/components/ui/Button";
import { Badge, Skeleton } from "@/components/ui/Marks";
import { addressExplorerUrl, chains } from "@/lib/chain";
import { assetByWrapped } from "@/lib/assets";
import { BRIDGE_DESTINATION, BRIDGE_SOURCE } from "@/lib/contracts";
import { formatAmount } from "@/lib/reserves";
import { useReserves } from "@/lib/useReserves";
import { formatBlock, useChainStatus } from "@/lib/useChainStatus";

/** One asset, end to end: its backing, its contracts, and where to act on it. */
export default function AssetPage() {
  const params = useParams<{ symbol: string }>();
  const asset = assetByWrapped(decodeURIComponent(params.symbol));
  if (!asset) notFound();

  const { reports } = useReserves();
  const { ethereum, robinhood } = useChainStatus();
  const report = reports?.find((r) => r.asset.symbol === asset.symbol);
  const deployed = Boolean(asset.vault && asset.token);

  return (
    <>
      <PageHeader
        kicker={`Asset · ${asset.symbol} → ${asset.wrapped}`}
        title={
          <span className="flex items-center gap-4">
            {asset.wrapped}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.icon} alt="" className="h-10 w-10" />
          </span>
        }
        aside={<Badge tone={deployed ? "ok" : "off"}>{deployed ? "Live" : "Not deployed"}</Badge>}
      >
        {asset.name} · {chains.ethereum.name} → {chains.robinhood.name}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Panel title="Backing status">
            {report ? <ReserveCard report={report} /> : <Skeleton className="h-72" />}
          </Panel>
        </div>

        <Panel title="Contract facts">
          <dl className="divide-y divide-line">
            <Row label="Source collateral">
              {report?.collateralBalance !== undefined &&
              report?.collateralBalance !== null &&
              report.sourceDecimals !== null
                ? `${formatAmount(report.collateralBalance, report.sourceDecimals, 6)} ${asset.symbol}`
                : <Blank />}
            </Row>
            <Row label="Wrapped supply">
              {report?.wrappedSupply !== undefined &&
              report?.wrappedSupply !== null &&
              report.destinationDecimals !== null
                ? `${formatAmount(report.wrappedSupply, report.destinationDecimals, 6)} ${asset.wrapped}`
                : <Blank />}
            </Row>
            <Row label="Vault">
              <Address
                address={asset.vault || undefined}
                href={
                  asset.vault ? `${chains.ethereum.explorer}/address/${asset.vault}` : undefined
                }
                full
              />
            </Row>
            <Row label="Contract (gToken)">
              <Address
                address={asset.token || undefined}
                href={asset.token ? addressExplorerUrl(asset.token) : undefined}
                full
              />
            </Row>
            <Row label="Source token">
              <Address
                address={asset.source}
                href={`${chains.ethereum.explorer}/token/${asset.source}`}
                full
              />
            </Row>
            <Row label="Decimals">{asset.decimals}</Row>
            <Row label="Bridge contract (source)">
              <Address
                address={BRIDGE_SOURCE || undefined}
                href={
                  BRIDGE_SOURCE
                    ? `${chains.ethereum.explorer}/address/${BRIDGE_SOURCE}`
                    : undefined
                }
                full
              />
            </Row>
            <Row label="Bridge contract (destination)">
              <Address
                address={BRIDGE_DESTINATION || undefined}
                href={BRIDGE_DESTINATION ? addressExplorerUrl(BRIDGE_DESTINATION) : undefined}
                full
              />
            </Row>
            <Row label={`Latest ${chains.ethereum.name} block`}>
              {ethereum ? formatBlock(ethereum.number) : <Blank />}
            </Row>
            <Row label={`Latest ${chains.robinhood.name} block`}>
              {robinhood ? formatBlock(robinhood.number) : <Blank />}
            </Row>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" href={`/app/bridge?asset=${asset.symbol}&direction=wrap`}>
              Wrap
            </Button>
            <Button
              size="sm"
              variant="secondary"
              href={`/app/bridge?asset=${asset.symbol}&direction=unwrap`}
            >
              Unwrap
            </Button>
            <Button size="sm" variant="secondary" href="/app/swap">
              Swap
            </Button>
            <Button size="sm" variant="secondary" href={`/app/reserves?asset=${asset.wrapped}`}>
              View reserves
            </Button>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[220px_1fr]">
      <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </dt>
      <dd className="min-w-0 break-all font-mono text-xs text-ink">{children}</dd>
    </div>
  );
}
