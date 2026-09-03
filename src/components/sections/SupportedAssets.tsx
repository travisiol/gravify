import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge, SectionHeader } from "../ui/Marks";
import { Reveal } from "../ui/Reveal";
import { supportedAssets } from "@/lib/assets";

/** 05 — the registry. A row goes live only when both contracts exist. */
export function SupportedAssets() {
  return (
    <section className="border-b border-line bg-sky-light/40">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
        <Reveal>
          <SectionHeader index="05" kicker="Supported assets" title="Pull assets in.">
            Stablecoins, bitcoin and gold with canonical Ethereum contracts. A gToken
            appears only when its vault and token are deployed; nothing is listed as live
            before that.
          </SectionHeader>
        </Reveal>

        <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {supportedAssets.map((asset, i) => {
            const deployed = Boolean(asset.vault && asset.token);
            return (
              <Reveal key={asset.symbol} delay={0.05 * i}>
                <Link
                  href={`/app/assets/${asset.wrapped}`}
                  className="group flex h-full flex-col justify-between bg-white p-5 transition-colors hover:bg-sky-panel"
                >
                  <div className="flex items-center justify-between">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.icon} alt="" className="h-9 w-9" />
                    <ArrowUpRight
                      size={16}
                      className="text-ink-muted opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  <div className="mt-8">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                      {asset.symbol} → {asset.wrapped}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-ink">{asset.name}</div>
                    <div className="mt-3">
                      <Badge tone={deployed ? "ok" : "off"}>
                        {deployed ? "Live" : "Not deployed"}
                      </Badge>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
