"use client";

import { Callout, PageHeader } from "@/components/app/Shell";
import { Skeleton } from "@/components/ui/Marks";
import { useWallet } from "@/lib/useWallet";
import { useHistory } from "@/lib/useHistory";
import { Address } from "@/components/ui/Address";
import { addressExplorerUrl, chains } from "@/lib/chain";
import { Badge } from "@/components/ui/Marks";

const columns = ["Event", "Asset", "Amount", "Chain", "Block", "Transaction"];

/**
 * Reconstructed from contract events for the connected wallet. Nothing is
 * cached server-side, so an empty table means the chain had nothing to show.
 */
export default function HistoryPage() {
  const { account } = useWallet();
  const { entries, pending, unavailable } = useHistory(account);

  return (
    <>
      <PageHeader kicker="Activity" title="Transaction history">
        Wraps, unwraps and swaps reconstructed from contract events for the connected
        wallet. Bridge completion is verified against the far bridge&apos;s processed
        nonces.
      </PageHeader>

      {!account ? (
        <Callout>
          Connect a wallet to load its wrap, unwrap and swap activity from chain events.
        </Callout>
      ) : unavailable ? (
        <Callout title="No event source">
          History needs the gToken contracts to exist before there are transfer events to
          read. Nothing is deployed yet, so there is nothing to reconstruct.
        </Callout>
      ) : pending ? (
        <Skeleton className="h-48" />
      ) : entries.length === 0 ? (
        <Callout>No wrap, unwrap or swap events for this wallet.</Callout>
      ) : (
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
                {entries.map((entry) => (
                  <tr
                    key={`${entry.hash}-${entry.logIndex}`}
                    className="border-b border-line/70 last:border-0"
                  >
                    <td className="py-3 pr-4 align-middle">
                      <Badge tone={entry.kind === "MINT" ? "ok" : "off"}>{entry.label}</Badge>
                    </td>
                    <td className="py-3 pr-4 align-middle font-semibold text-ink">
                      {entry.symbol}
                    </td>
                    <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
                      {entry.amount}
                    </td>
                    <td className="py-3 pr-4 align-middle">{chains.robinhood.name}</td>
                    <td className="py-3 pr-4 align-middle font-mono text-xs tabular-nums">
                      #{entry.block.toString()}
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <Address
                        address={entry.hash}
                        href={`${addressExplorerUrl(entry.hash).replace("/address/", "/tx/")}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
