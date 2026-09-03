import { Logo, SectionHeader } from "../ui/Marks";
import { Lift, Reveal } from "../ui/Reveal";

const contracts = [
  {
    name: "GravVault",
    points: [
      "Single-asset custody",
      "BRIDGE_ROLE-only deposit and withdraw",
      "Rolling withdrawal limit",
      "Pausable · ReentrancyGuard · SafeERC20",
    ],
  },
  {
    name: "GravToken",
    points: [
      "ERC-20 with source decimals",
      "Mint and burn only through BRIDGE_ROLE",
      "No public mint function",
      "Pausable transfers",
    ],
  },
  {
    name: "GravBridge",
    points: [
      "Messenger-agnostic transport",
      "Inbound only from the configured messenger",
      "Nonce replay protection",
      "Route registry per asset",
    ],
  },
  {
    name: "Messenger",
    points: [
      "IGravMessenger boundary",
      "LayerZero OApp or native messenger pluggable",
      "Not deployed yet — bridge stays inert",
      "Fee quoted by the messenger itself",
    ],
  },
];

/** 09 — four small contracts, and what each one is and is not allowed to do. */
export function Security() {
  return (
    <section className="border-b border-line bg-sky-light/40">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
        <Reveal>
          <SectionHeader index="09" kicker="Security" title="Contract architecture.">
            Role separation, pause switches, rate limits and reentrancy protection across
            four small contracts. The bridge does not invent a messaging protocol; it plugs
            into one.
          </SectionHeader>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {contracts.map((contract, i) => (
            <Reveal key={contract.name} delay={0.05 * i}>
              <Lift className="h-full">
                <div className="flex h-full flex-col rounded-md border border-line bg-white p-5">
                  <div className="flex items-center gap-2">
                    <Logo className="h-4 w-4 text-sky" />
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink">
                      {contract.name}
                    </span>
                  </div>
                  <ul className="mt-4 flex flex-col gap-2">
                    {contract.points.map((point) => (
                      <li key={point} className="flex gap-2 text-sm text-ink/80">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/50" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Lift>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          Contracts are experimental until independently audited. · Foundry test suite: 43
          tests incl. 3 invariants.
        </p>
      </div>
    </section>
  );
}
