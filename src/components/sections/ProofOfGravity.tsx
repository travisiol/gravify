"use client";

import { ArrowRight } from "lucide-react";
import { ReserveCard } from "../ReserveCard";
import { Button } from "../ui/Button";
import { Rings, SectionHeader, Skeleton } from "../ui/Marks";
import { Lift, Reveal } from "../ui/Reveal";
import { supportedAssets } from "@/lib/assets";
import { useReserves } from "@/lib/useReserves";

/**
 * 04 — every gToken against the collateral its vault holds. When contracts
 * are not deployed, that is what the card says.
 */
export function ProofOfGravity() {
  const { reports, pending } = useReserves();

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
          {pending
            ? supportedAssets.map((a) => <Skeleton key={a.symbol} className="h-48" />)
            : reports?.slice(0, 3).map((report, i) => (
                <Reveal key={report.asset.symbol} delay={0.06 * i}>
                  <Lift>
                    <ReserveCard report={report} compact />
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
