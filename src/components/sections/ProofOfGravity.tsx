import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge, Rings, SectionHeader } from "../ui/Marks";
import { Lift, Reveal } from "../ui/Reveal";
import { chains } from "@/lib/chain";
import { supportedAssets, type SupportedAsset } from "@/lib/assets";

/**
 * 04 — every gToken against the collateral its vault holds. Nothing is
 * deployed yet, so every card says so instead of showing a number.
 */
export function ProofOfGravity() {
  return (
    <section id="reserves" className="relative overflow-hidden border-b border-line">
      <Rings
        count={6}
        core
        className="pointer-events-none absolute -right-[20%] top-1/2 h-[900px] w-[900px] -translate-y-1/2 opacity-60"
      />
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-8">
        <Reveal>
          <SectionHeader
            index="04"
            kicker="Proof of Gravity"
            title="Every unit should have a home."
          >
            Each gToken is compared against the collateral its vault actually holds, read
            from both chains at a pinned block. When contracts are not deployed, that is
            what you see.
          </SectionHeader>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {supportedAssets.slice(0, 3).map((asset, i) => (
            <Reveal key={asset.symbol} delay={0.06 * i}>
              <Lift>
                <ReserveCard asset={asset} />
              </Lift>
            </Reveal>
          ))}
        </div>

        <div className="mt-8">
          <Button href="/app/reserves" variant="secondary">
            Open Proof of Gravity <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </section>
  );
}

function ReserveCard({ asset }: { asset: SupportedAsset }) {
  const deployed = Boolean(asset.vault && asset.token);

  return (
    <div className="flex h-full flex-col rounded-md border bg-white p-5 border-line">
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
        <Badge tone="off">{deployed ? "Unverified" : "Awaiting deployment"}</Badge>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4">
        <Figure label="Collateral" />
        <Figure label="Supply" />
        <Figure label="Backing" />
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link
          href={`/app/reserves?asset=${asset.wrapped}`}
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline"
        >
          Inspect →
        </Link>
      </div>
    </div>
  );
}

function Figure({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm tabular-nums text-ink">
        {value ?? <span className="text-ink-muted">—</span>}
      </dd>
    </div>
  );
}
