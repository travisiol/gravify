"use client";

import { ArrowDown } from "lucide-react";
import { useState } from "react";
import { Blank, Callout, Fact, PageHeader, Panel } from "@/components/app/Shell";
import { Address } from "@/components/ui/Address";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { chains } from "@/lib/chain";
import { bridgeConfigured, bridgeMissing } from "@/lib/contracts";
import { supportedAssets } from "@/lib/assets";
import { site } from "@/lib/site";
import { useWallet } from "@/lib/useWallet";

type Direction = "wrap" | "unwrap";

const stages = [
  "Wallet confirmation",
  "Source transaction submitted",
  "Transaction confirmed",
  "Cross-chain message pending",
  "Destination action detected",
  "Complete",
];

/**
 * Lock on one chain, mint on the other. Nothing here can be signed until the
 * bridge exists, and the page says exactly what is missing.
 */
export default function BridgePage() {
  const [direction, setDirection] = useState<Direction>("wrap");
  const [symbol, setSymbol] = useState(supportedAssets[0].symbol);
  const [amount, setAmount] = useState("");
  const { account, connect } = useWallet();

  const asset = supportedAssets.find((a) => a.symbol === symbol)!;
  const wrapping = direction === "wrap";
  const from = wrapping
    ? { chain: chains.ethereum.name, symbol: asset.symbol }
    : { chain: chains.robinhood.name, symbol: asset.wrapped };
  const to = wrapping
    ? { chain: chains.robinhood.name, symbol: asset.wrapped }
    : { chain: chains.ethereum.name, symbol: asset.symbol };

  return (
    <>
      <PageHeader kicker="Bridge" title="Wrap · Unwrap">
        Lock on the source chain and mint the {site.name} representation on{" "}
        {chains.robinhood.name}, or burn and unlock. Every state below is read from
        receipts, events and contract views.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Panel
          title={
            wrapping
              ? `Wrap · lock on source, mint on ${chains.robinhood.name}`
              : `Unwrap · burn on ${chains.robinhood.name}, unlock on source`
          }
          action={
            <div className="inline-flex rounded-sm border border-line bg-sky-panel p-0.5">
              {(["wrap", "unwrap"] as Direction[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={cx(
                    "rounded-[6px] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                    direction === d ? "bg-ink text-white" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          }
        >
          {!bridgeConfigured ? (
            <Callout title="Bridge not configured">
              <p>
                Transactions are disabled until GravBridge is deployed on both chains and a
                provider is selected. Missing:
              </p>
              <ul className="mt-2 flex flex-col gap-1 font-mono text-[11px]">
                {bridgeMissing.map((key) => (
                  <li key={key}>· {key}</li>
                ))}
              </ul>
            </Callout>
          ) : null}

          <div className="mt-5 grid gap-3">
            <div className="min-w-0 rounded-sm border border-line bg-sky-panel/60 p-4">
              <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                <span>From</span>
                <span>{from.chain}</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="h-10 rounded-sm border border-line bg-white px-3 font-mono text-sm text-ink"
                >
                  {supportedAssets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {wrapping ? a.symbol : a.wrapped}
                    </option>
                  ))}
                </select>
                <input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 w-full min-w-0 flex-1 rounded-sm border border-line bg-white px-3 text-right font-mono text-lg tabular-nums text-ink outline-none focus:border-ink"
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ink-muted">
                <span>Wallet balance: {account ? "—" : "connect wallet"}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink">
                <ArrowDown size={14} />
              </span>
            </div>

            <div className="min-w-0 rounded-sm border border-line bg-sky-panel/60 p-4">
              <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                <span>To</span>
                <span>{to.chain}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-ink">{to.symbol}</span>
                <span className="font-mono text-lg tabular-nums text-ink">
                  {amount || "0.00"}
                </span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-ink-muted">
                1 {from.symbol} represents a claim on 1 {to.symbol}. Confirmed on the
                Reserves page, not assumed here.
              </div>
            </div>
          </div>

          <dl className="mt-5 grid gap-y-2 border-t border-line pt-4 font-mono text-[11px] sm:grid-cols-2">
            <Fact label="Source asset" className="pr-4">
              {from.symbol} · {from.chain}
            </Fact>
            <Fact label="Destination asset" className="pr-4">
              {to.symbol} · {to.chain}
            </Fact>
            <Fact label="Amount" className="pr-4">
              {amount || <Blank />}
            </Fact>
            <Fact label={`${site.name} fee`} className="pr-4">
              <Blank />
            </Fact>
            <Fact label="Messaging fee (native)" className="pr-4">
              <Blank />
            </Fact>
            <Fact label="Estimated gas" className="pr-4">
              <Blank />
            </Fact>
            <Fact label="Minimum received" className="pr-4">
              <Blank />
            </Fact>
            <Fact label="Vault" className="pr-4">
              <Address
                address={asset.vault || undefined}
                href={
                  asset.vault
                    ? `${chains.ethereum.explorer}/address/${asset.vault}`
                    : undefined
                }
              />
            </Fact>
          </dl>

          <div className="mt-5 flex flex-col gap-2">
            {!account ? <Callout>Connect a wallet to continue.</Callout> : null}
            <Button
              size="lg"
              disabled={!bridgeConfigured || !account}
              onClick={account ? undefined : connect}
            >
              {wrapping ? "Deposit & bridge" : "Burn & unlock"}
            </Button>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              Actions stay disabled until contracts, routes and messenger are verified
              on-chain.
            </p>
          </div>
        </Panel>

        <Panel title="Transaction lifecycle">
          <ol className="flex flex-col">
            {stages.map((stage, i) => (
              <li key={stage} className="flex items-start gap-3 py-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] border-line text-ink-muted">
                  {i + 1}
                </span>
                <span className="text-sm text-ink-muted">{stage}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            Each stage derives from a receipt, an event, or a contract view. There are no
            timers.
          </p>
        </Panel>
      </div>
    </>
  );
}
