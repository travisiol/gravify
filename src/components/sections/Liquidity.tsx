import { LiquidityTable } from "../LiquidityTable";
import { SectionHeader } from "../ui/Marks";
import { Reveal } from "../ui/Reveal";

/** 07 — pools enumerated from the factory and read at one block. */
export function Liquidity() {
  return (
    <section className="border-b border-line bg-sky-light/40">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
        <Reveal>
          <SectionHeader index="07" kicker="Liquidity" title="Backed on-chain.">
            Pools are enumerated from the configured router&apos;s factory and read at one
            block. TVL comes from reserves quoted in USDG through the on-chain WETH/USDG
            pool; volume needs an indexer and is omitted.
          </SectionHeader>
        </Reveal>

        <Reveal>
          <LiquidityTable limit={6} />
        </Reveal>
      </div>
    </section>
  );
}
