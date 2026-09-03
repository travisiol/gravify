"use client";

import { ChevronDown, ExternalLink, RefreshCw } from "lucide-react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader, Panel } from "@/components/app/Shell";
import { ReserveCard } from "@/components/ReserveCard";
import { Badge, Skeleton } from "@/components/ui/Marks";
import { CopyButton } from "@/components/ui/Address";
import { cx } from "@/lib/cx";
import { addressExplorerUrl, chains } from "@/lib/chain";
import { supportedAssets } from "@/lib/assets";
import { statusLabel, statusTone, type ReserveReport } from "@/lib/reserves";
import { useReserves } from "@/lib/useReserves";

export default function ReservesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Reserves />
    </Suspense>
  );
}

function Reserves() {
  const params = useSearchParams();
  const { reports, pending, refresh } = useReserves();
  const [selected, setSelected] = useState(params.get("asset") ?? supportedAssets[0].wrapped);

  const report = reports?.find((r) => r.asset.wrapped === selected) ?? null;

  return (
    <>
      <PageHeader
        kicker="Proof of Gravity"
        title="Don't trust the interface. Verify the backing."
      >
        Collateral is read from the vault on the source chain; supply from the gToken on{" "}
        {chains.robinhood.name}; both at pinned blocks. The ratio is computed here, in the
        open, never stored.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pending
          ? supportedAssets.map((a) => <Skeleton key={a.symbol} className="h-72" />)
          : reports?.map((r) => <ReserveCard key={r.asset.symbol} report={r} />)}
      </div>

      <div className="mt-6">
        <Panel
          title="Reserve inspector"
          action={
            <button onClick={() => refresh()} className="inline-flex items-center gap-1 hover:text-ink">
              re-read
              <RefreshCw size={12} />
            </button>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            {supportedAssets.map((a) => (
              <button
                key={a.wrapped}
                onClick={() => setSelected(a.wrapped)}
                className={cx(
                  "rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em]",
                  selected === a.wrapped
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink-muted hover:text-ink",
                )}
              >
                {a.wrapped}
              </button>
            ))}
            <span className="ml-auto">
              {report ? (
                <Badge tone={statusTone[report.status]}>{statusLabel[report.status]}</Badge>
              ) : null}
            </span>
          </div>

          {report ? <Inspector report={report} /> : <Skeleton className="mt-5 h-64" />}
        </Panel>
      </div>
    </>
  );
}

function Inspector({ report }: { report: ReserveReport }) {
  const [open, setOpen] = useState(true);
  const { asset } = report;

  const rows: { label: string; value: string | null; href?: string }[] = [
    {
      label: "Source token address",
      value: asset.source,
      href: `${chains.ethereum.explorer}/token/${asset.source}`,
    },
    {
      label: "Vault",
      value: asset.vault || null,
      href: asset.vault ? `${chains.ethereum.explorer}/address/${asset.vault}` : undefined,
    },
    {
      label: "token.balanceOf(vault)",
      value: report.collateralBalance?.toString() ?? null,
    },
    { label: "vault.totalLocked()", value: report.vaultLedger?.toString() ?? null },
    {
      label: "Destination gToken",
      value: asset.token || null,
      href: asset.token ? addressExplorerUrl(asset.token) : undefined,
    },
    { label: "gToken.totalSupply()", value: report.wrappedSupply?.toString() ?? null },
    { label: "Source block", value: report.sourceBlock?.toString() ?? null },
    { label: "Destination block", value: report.destinationBlock?.toString() ?? null },
    { label: "Source timestamp", value: report.sourceTimestamp?.toString() ?? null },
    {
      label: "Destination timestamp",
      value: report.destinationTimestamp?.toString() ?? null,
    },
  ];

  return (
    <>
      <dl className="mt-5 divide-y divide-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5 sm:grid-cols-[220px_1fr_auto]"
          >
            <dt className="font-mono text-[11px] text-ink-muted">{row.label}</dt>
            <dd className="min-w-0 truncate font-mono text-xs text-ink">
              {row.value ?? (
                <span className="uppercase tracking-[0.12em] text-ink-muted">
                  Not deployed
                </span>
              )}
            </dd>
            <dd className="flex items-center gap-1">
              {row.value ? <CopyButton value={row.value} label="Copy" /> : null}
              {row.href ? (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-sm border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:text-ink"
                >
                  Explorer
                  <ExternalLink size={12} />
                </a>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 rounded-sm border border-line">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink"
        >
          Raw reads
          <ChevronDown
            size={14}
            className={cx("transition-transform", open && "rotate-180")}
          />
        </button>
        {open ? (
          <div className="border-t border-line">
            {report.reads.length === 0 ? (
              <div className="px-4 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                No reads — contracts not deployed for this asset.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {report.reads.map((read, i) => (
                  <li key={i} className="px-4 py-3 font-mono text-[11px]">
                    <div className="flex flex-wrap items-center gap-2 text-ink-muted">
                      <span className="uppercase tracking-[0.14em]">{read.chain}</span>
                      <span>· {read.label}</span>
                      <span>· block #{read.block.toString()}</span>
                    </div>
                    <div className="mt-1 break-all text-ink">
                      {read.contract}.{read.method} = {read.value}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <InspectorLink
          label="Open vault"
          href={asset.vault ? `${chains.ethereum.explorer}/address/${asset.vault}` : undefined}
        />
        <InspectorLink
          label="Open gToken"
          href={asset.token ? addressExplorerUrl(asset.token) : undefined}
        />
        <span className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          {report.status === "NOT_DEPLOYED"
            ? "Backing claim withheld until deployed"
            : "Read directly from both chains"}
        </span>
      </div>
    </>
  );
}

function InspectorLink({ label, href }: { label: string; href?: string }) {
  const cls =
    "inline-flex items-center justify-center gap-2 rounded-sm border font-mono uppercase tracking-[0.12em] transition-all duration-150 bg-white text-ink border-line h-8 px-3 text-[11px]";
  if (!href) {
    return (
      <button disabled className={cx(cls, "cursor-not-allowed opacity-40")}>
        {label}
      </button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cx(cls, "hover:border-ink/40")}>
      {label}
    </a>
  );
}
