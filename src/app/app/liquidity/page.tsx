import { PageHeader } from "@/components/app/Shell";
import { LiquidityTable } from "@/components/LiquidityTable";

/** Every pool the factory has, not a curated selection. */
export default function LiquidityPage() {
  return (
    <>
      <PageHeader kicker="Liquidity explorer" title="Real pools only">
        Pairs are enumerated from the router&apos;s factory and read at one block. TVL is
        derived from reserves, quoted in USDG (WETH priced through the WETH/USDG pool at
        the same block); pools without WETH or USDG show none. Volume needs an indexer and
        is omitted.
      </PageHeader>
      <LiquidityTable />
    </>
  );
}
