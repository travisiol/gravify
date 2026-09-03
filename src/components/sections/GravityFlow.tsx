"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/Marks";
import { chains } from "@/lib/chain";
import { site } from "@/lib/site";

const steps = [
  {
    title: chains.ethereum.name,
    detail: "Source asset leaves the user's wallet.",
  },
  {
    title: `${site.name} Vault`,
    detail: "Collateral locked in a single-asset vault.",
  },
  {
    title: "Verification",
    detail: "The messenger delivers the lock proof; the bridge checks eid, nonce and route.",
  },
  {
    title: chains.robinhood.name,
    detail: "The gToken is minted to the recipient, 1:1 with the vault.",
  },
  {
    title: "DeFi Liquidity",
    detail: `The representation trades, pools, and routes on ${chains.robinhood.name}.`,
  },
];

const example = [
  "1,000 USDC",
  "Vault locked",
  "gUSDC minted",
  `Available on ${chains.robinhood.name}`,
];

/** 03 — the mechanism, walked through once, plainly labelled as a walkthrough. */
export function GravityFlow() {
  const still = useReducedMotion();

  return (
    <section id="finance" className="relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
        <Reveal>
          <SectionHeader index="03" kicker="Gravity flow" title="Liquidity has a destination.">
            Capital enters on {chains.ethereum.name}, is locked, verified, and lands on{" "}
            {chains.robinhood.name} as a {site.name} representation. The diagram is a
            walkthrough of the mechanism, not a live transaction.
          </SectionHeader>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <ol className="relative border-l border-ink/30 pl-8">
              {/* A unit of capital, falling down the rail on repeat. */}
              {!still && (
                <motion.span
                  aria-hidden
                  className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-ink"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              )}
              {steps.map((step, i) => (
                <li key={step.title} className="relative pb-10 last:pb-0">
                  <span className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-ink/30 bg-sky font-mono text-[10px] text-ink">
                    {i + 1}
                  </span>
                  <div className="text-xl font-semibold uppercase tracking-tight text-ink">
                    {step.title}
                  </div>
                  <div className="mt-1 max-w-sm text-sm text-ink/75">{step.detail}</div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-md border border-line bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                  Worked example
                </span>
                <span className="rounded-sm border border-line bg-sky-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  Illustration · not a transaction
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {example.map((line, i) => (
                  <div key={line} className="flex items-center gap-4">
                    <span className="font-mono text-[10px] text-ink-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <motion.div
                      className="flex-1 rounded-sm border border-line bg-sky-panel px-4 py-3 font-mono text-sm text-ink"
                      initial={!still && { opacity: 0.4 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.25 * i, duration: 0.4 }}
                    >
                      {line}
                    </motion.div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs leading-relaxed text-ink-muted">
                Real wraps happen in the application, produce on-chain events, and are
                tracked by contract state — see <span className="font-mono">/app/bridge</span>.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
