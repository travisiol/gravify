import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { SectionHeader } from "../ui/Marks";
import { Reveal } from "../ui/Reveal";
import { chains, SWAP_ROUTER } from "@/lib/chain";
import { site } from "@/lib/site";

const legs = [
  { title: "USDC", sub: chains.ethereum.name },
  { title: `${site.name} Bridge`, sub: "lock → message" },
  { title: "gUSDC", sub: chains.robinhood.name },
  { title: "DEX pool", sub: SWAP_ROUTER ? "router configured" : "router not configured" },
  { title: "gWBTC", sub: chains.robinhood.name },
];

/** 06 — the two legs of a route, shown as two, because that is what they are. */
export function GravityRouter() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
        <Reveal>
          <SectionHeader index="06" kicker="Gravity Router" title="Route capital.">
            Pick a source asset and a target gToken; the router quotes the bridge leg and
            the swap leg from live contracts. It never claims atomicity: two chains means
            two transactions, and it shows both.
          </SectionHeader>
        </Reveal>

        <Reveal>
          <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
            {legs.map((leg, i) => (
              <div key={leg.title} className="flex flex-1 items-center gap-3">
                <div className="flex-1 rounded-md border border-line bg-white p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-base font-semibold text-ink">{leg.title}</div>
                  <div className="font-mono text-[11px] text-ink-muted">{leg.sub}</div>
                </div>
                {i < legs.length - 1 ? (
                  <ArrowRight
                    size={16}
                    className="hidden shrink-0 text-ink/50 md:block"
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="/app/router">Open Gravity Router</Button>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              Two transactions · not atomic · every fee quoted on-chain
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
