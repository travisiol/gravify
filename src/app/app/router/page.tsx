"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Blank, Callout, Fact, PageHeader, Panel } from "@/components/app/Shell";
import { Button } from "@/components/ui/Button";
import { chains, SWAP_ROUTER } from "@/lib/chain";
import { bridgeConfigured } from "@/lib/contracts";
import { supportedAssets } from "@/lib/assets";
import { site } from "@/lib/site";

/**
 * The bridge leg and the swap leg, side by side. The page's job is to be
 * explicit that this is two transactions on two chains, never one.
 */
export default function RouterPage() {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(2);
  const [amount, setAmount] = useState("");

  const source = supportedAssets[sourceIndex];
  const target = supportedAssets[targetIndex];

  const legs = [
    { title: source.symbol, sub: chains.ethereum.name },
    { title: `${site.name} Bridge`, sub: "lock + message" },
    { title: source.wrapped, sub: chains.robinhood.name },
    { title: "DEX pool", sub: SWAP_ROUTER ? "configured router" : "router not configured" },
    { title: target.wrapped, sub: chains.robinhood.name },
  ];

  return (
    <>
      <PageHeader kicker="Gravity Router" title="Plan the path">
        From a source asset on {chains.ethereum.name} to a target gToken on{" "}
        {chains.robinhood.name}: the bridge leg and the swap leg, each quoted from live
        contracts and each requiring its own signature.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Panel title="Gravity Router · execution path">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <label className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                Source asset · {chains.ethereum.name}
              </span>
              <div className="flex gap-2">
                <select
                  value={sourceIndex}
                  onChange={(e) => setSourceIndex(Number(e.target.value))}
                  className="h-10 rounded-sm border border-line bg-white px-3 font-mono text-sm"
                >
                  {supportedAssets.map((a, i) => (
                    <option key={a.symbol} value={i}>
                      {a.symbol}
                    </option>
                  ))}
                </select>
                <input
                  inputMode="decimal"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 w-full min-w-0 flex-1 rounded-sm border border-line bg-white px-3 text-right font-mono text-base tabular-nums outline-none focus:border-ink"
                />
              </div>
            </label>

            <ArrowRight
              size={16}
              className="hidden self-end text-ink/50 sm:mb-3 sm:block"
            />

            <label className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                Target · {chains.robinhood.name}
              </span>
              <select
                value={targetIndex}
                onChange={(e) => setTargetIndex(Number(e.target.value))}
                className="h-10 rounded-sm border border-line bg-white px-3 font-mono text-sm"
              >
                {supportedAssets.map((a, i) => (
                  <option key={a.wrapped} value={i}>
                    {a.wrapped}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            {legs.map((leg, i) => (
              <div key={leg.title + i} className="flex flex-1 items-center gap-2">
                <div className="flex-1 rounded-sm border border-line bg-sky-panel/60 px-3 py-2">
                  <div className="font-mono text-xs text-ink">{leg.title}</div>
                  <div className="font-mono text-[10px] text-ink-muted">{leg.sub}</div>
                </div>
                {i < legs.length - 1 ? (
                  <ArrowRight size={16} className="hidden shrink-0 text-ink/40 sm:block" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-xs text-ink-muted">
              {amount
                ? bridgeConfigured
                  ? "Quoting each stage from live contracts…"
                  : "The bridge leg cannot be quoted until GravBridge is deployed on both chains."
                : "Enter an amount to quote each stage from live contracts."}
            </p>
          </div>
        </Panel>

        <Panel title="Summary">
          <dl className="flex flex-col gap-2 font-mono text-[11px]">
            <Fact label="Required transactions">
              <Blank />
            </Fact>
            <Fact label="Atomic">No — two chains, two signatures</Fact>
            <Fact label="Bridge fee">
              <Blank />
            </Fact>
            <Fact label="Swap fee">
              <Blank />
            </Fact>
            <Fact label="Expected output">
              <Blank />
            </Fact>
            <Fact label="Minimum output">
              <Blank />
            </Fact>
            <Fact label="Estimated stages">
              <Blank />
            </Fact>
          </dl>

          <div className="mt-4">
            <Callout title="How execution works">
              Stage 1 is signed on {chains.ethereum.name} and completes when the messenger
              delivers the mint on {chains.robinhood.name}. Stage 2 is signed on{" "}
              {chains.robinhood.name} after the gToken arrives. {site.name} does not
              front-run or pre-mint either leg.
            </Callout>
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="secondary" href="/app/bridge">
              Go to Bridge
            </Button>
            <Button size="sm" variant="secondary" href="/app/swap">
              Go to Swap
            </Button>
          </div>
        </Panel>
      </div>
    </>
  );
}
