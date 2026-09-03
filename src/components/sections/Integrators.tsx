import { Button } from "../ui/Button";
import { truncate } from "@/lib/format";
import { SectionHeader } from "../ui/Marks";
import { Reveal } from "../ui/Reveal";
import { contractRegistry, registryConfigured, registryTotal } from "@/lib/contracts";

const snippet = `// Verify a reserve yourself — same reads the interface performs
const collateral = await eth.readContract({
  address: USDC, abi: erc20Abi,
  functionName: "balanceOf", args: [GRAV_VAULT_USDC],
});
const supply = await robinhood.readContract({
  address: gUSDC, abi: erc20Abi, functionName: "totalSupply",
});
const backingBps = collateral * 10_000n / supply; // ≥ 10_000 → FULLY BACKED`;

/** 08 — the same reads, handed over so nobody has to take our word for it. */
export function Integrators() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
        <Reveal>
          <SectionHeader index="08" kicker="Integrators" title="Verify, don't assume.">
            Everything the interface knows is readable by anyone: asset registry, contract
            addresses, ABIs, and a reserve engine you can run yourself.
          </SectionHeader>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="rounded-md border border-line bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                  Contract registry
                </span>
                <span className="font-mono text-[11px] text-ink-muted">
                  {registryConfigured} / {registryTotal} configured
                </span>
              </div>
              <ul className="mt-4 divide-y divide-line">
                {contractRegistry.slice(0, 6).map((entry, i) => (
                  <li
                    key={`${entry.name}-${i}`}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span className="text-ink">{entry.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                      {entry.address ? truncate(entry.address) : "Not deployed"}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                href="/docs/contracts"
                variant="secondary"
                size="sm"
                className="mt-5"
              >
                All contracts &amp; ABIs
              </Button>
            </div>
          </Reveal>

          <Reveal>
            <pre className="h-full overflow-x-auto rounded-md border border-ink bg-ink p-6 font-mono text-[12px] leading-relaxed text-sky-light">
              {snippet}
            </pre>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
