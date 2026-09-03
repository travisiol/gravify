import Link from "next/link";
import { Blank } from "./app/Shell";
import { Address } from "./ui/Address";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Marks";
import { cx } from "@/lib/cx";
import { addressExplorerUrl, chains } from "@/lib/chain";
import {
  formatAmount,
  formatBacking,
  statusLabel,
  statusTone,
  type ReserveReport,
} from "@/lib/reserves";

/**
 * One asset's backing. `compact` is the landing-page form: the headline
 * numbers and a link. The full form adds the addresses and the pinned blocks.
 */
export function ReserveCard({
  report,
  compact = false,
}: {
  report: ReserveReport;
  compact?: boolean;
}) {
  const { asset } = report;
  const alarming =
    report.status === "UNDERCOLLATERALIZED" || report.status === "UNVERIFIED";

  const collateral =
    report.collateralBalance !== null && report.sourceDecimals !== null
      ? `${formatAmount(report.collateralBalance, report.sourceDecimals, 2)} ${asset.symbol}`
      : null;
  const supply =
    report.wrappedSupply !== null && report.destinationDecimals !== null
      ? `${formatAmount(report.wrappedSupply, report.destinationDecimals, 2)} ${asset.wrapped}`
      : null;
  const backing =
    report.backingBps !== null
      ? formatBacking(report.backingBps)
      : report.wrappedSupply === 0n
        ? "No supply"
        : null;

  return (
    <div
      className={cx(
        "flex h-full flex-col rounded-md border bg-white p-5",
        alarming ? "border-[#B3261E]/50" : "border-line",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.icon} alt="" className="h-8 w-8" />
          <div>
            <div className="text-lg font-semibold leading-none text-ink">
              {asset.wrapped}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              {chains.ethereum.name} → {chains.robinhood.name}
            </div>
          </div>
        </div>
        <Badge tone={statusTone[report.status]}>{statusLabel[report.status]}</Badge>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4">
        <Figure label="Collateral" value={collateral} />
        <Figure label="Supply" value={supply} />
        <Figure
          label="Backing"
          value={backing}
          emphasis={
            report.status === "UNDERCOLLATERALIZED"
              ? "bad"
              : report.status === "FULLY_BACKED" && report.backingBps !== null
                ? "ok"
                : undefined
          }
        />
      </dl>

      {report.error ? (
        <p className="mt-4 break-words rounded-sm border border-[#B3261E]/30 bg-[#FCE9E7] p-3 font-mono text-[11px] text-[#B3261E]">
          {report.error}
        </p>
      ) : null}

      {!compact ? (
        <div className="mt-6 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
          <Detail label="Source vault">
            <Address
              address={asset.vault || undefined}
              href={asset.vault ? `${chains.ethereum.explorer}/address/${asset.vault}` : undefined}
            />
          </Detail>
          <Detail label="Wrapped contract">
            <Address
              address={asset.token || undefined}
              href={asset.token ? addressExplorerUrl(asset.token) : undefined}
            />
          </Detail>
          <Detail label="Source block">
            {report.sourceBlock !== null ? `#${report.sourceBlock.toLocaleString("en-US")}` : <Blank />}
          </Detail>
          <Detail label="Destination block">
            {report.destinationBlock !== null ? `#${report.destinationBlock.toLocaleString("en-US")}` : <Blank />}
          </Detail>
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {compact ? (
          <Link
            href={`/app/reserves?asset=${asset.wrapped}`}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline"
          >
            Inspect →
          </Link>
        ) : (
          <>
            <Button
              size="sm"
              variant="secondary"
              href={asset.vault ? `${chains.ethereum.explorer}/address/${asset.vault}` : undefined}
              disabled={!asset.vault}
            >
              View vault
            </Button>
            <Button
              size="sm"
              variant="secondary"
              href={asset.token ? addressExplorerUrl(asset.token) : undefined}
              disabled={!asset.token}
            >
              View contract
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function Figure({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string | null;
  emphasis?: "ok" | "bad";
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </dt>
      <dd
        className={cx(
          "mt-1 font-mono text-sm tabular-nums",
          emphasis === "bad" ? "text-[#B3261E]" : emphasis === "ok" ? "text-[#1F7A4D]" : "text-ink",
        )}
      >
        {value ?? <Blank />}
      </dd>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
