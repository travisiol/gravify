"use client";

import type { ReactNode } from "react";
import { Address } from "./ui/Address";
import { Badge, Skeleton } from "./ui/Marks";
import { cx } from "@/lib/cx";
import { tokenExplorerUrl } from "@/lib/chain";
import { GRAV_TOKEN, site } from "@/lib/site";
import { useTokenFacts } from "@/lib/useChainStatus";

/**
 * $GRAV, read from the contract. The point of this card is the address:
 * it is only official when it matches the one on the X account.
 */
export function TokenCard({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const facts = useTokenFacts();

  return (
    <div
      className={cx("rounded-md border border-line bg-white", compact ? "p-4" : "p-5", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink font-mono text-[11px] font-semibold text-white">
            G
          </span>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              $GRAV token · Robinhood Chain
            </div>
            <div className="text-sm font-semibold text-ink">{site.name} Token</div>
          </div>
        </div>
        {facts.loading ? (
          <Skeleton className="h-5 w-24" />
        ) : (
          <Badge tone={facts.live ? "ok" : "bad"}>
            {facts.live ? "Live on-chain" : "Unreachable"}
          </Badge>
        )}
      </div>

      <dl
        className={`mt-4 grid gap-x-4 gap-y-2 font-mono text-[11px] ${
          compact ? "grid-cols-1" : "sm:grid-cols-2"
        }`}
      >
        <Row label="Contract" wide={!compact}>
          <Address
            address={GRAV_TOKEN}
            href={tokenExplorerUrl(GRAV_TOKEN)}
            full={!compact}
          />
        </Row>
        <Row label="Symbol">{facts.symbol ?? "—"}</Row>
        <Row label="Decimals">{facts.decimals ?? "—"}</Row>
        <Row label="Total supply">{facts.totalSupply ?? "—"}</Row>
      </dl>

      <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
        Values above are read from the contract every minute. Only this address is
        official.
      </p>
    </div>
  );
}

function Row({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cx("flex items-center justify-between gap-3", wide && "sm:col-span-2")}
    >
      <dt className="uppercase tracking-[0.12em] text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-all text-right text-ink">{children}</dd>
    </div>
  );
}
