"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CityCanvas } from "./CityCanvas";
import { ChainPill } from "./ChainPill";
import { Button } from "./ui/Button";
import { XIcon } from "./ui/Marks";
import { chains, SWAP_ROUTER } from "@/lib/chain";
import { MESSENGER_DESTINATION } from "@/lib/contracts";
import { site } from "@/lib/site";

const HEADLINE = ["CAPITAL", "HAS", "GRAVITY."];

export function Hero() {
  const still = useReducedMotion();

  return (
    <section className="relative -mt-16 h-[100svh] min-h-[640px] overflow-hidden">
      <CityCanvas className="absolute inset-0" />

      {/* Wash the city back so the headline always wins. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky/95 via-sky/70 to-transparent md:via-sky/55 md:to-[62%]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-sky/90 via-sky/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sky/80 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-40 pt-32 md:px-8 md:pb-28">
        <div className="max-w-3xl">
          <motion.div
            initial={!still && { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-ink/80"
          >
            <span className="h-px w-8 bg-ink/50" />
            {site.wordmark} · {site.secondary}
          </motion.div>

          <h1 className="font-sans text-[17vw] font-bold uppercase leading-[0.84] tracking-tightest text-ink sm:text-[11vw] lg:text-[7.4vw]">
            {HEADLINE.map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={!still && { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + 0.12 * i,
                  ease: [0.2, 0.7, 0.2, 1],
                }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={!still && { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-8 max-w-md"
          >
            <p className="text-lg leading-snug text-ink">
              Pull assets into {chains.robinhood.name}.
              <br />
              Verify the backing.
              <br />
              Put capital to work.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/app" size="lg">
                Enter {site.name} <ArrowRight size={14} />
              </Button>
              <Button href="/app/reserves" size="lg" variant="secondary">
                View reserves
              </Button>
            </div>
            <a
              href={site.xUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/80 hover:text-ink"
            >
              <XIcon /> {site.xHandle}
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={!still && { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute inset-x-0 bottom-0"
      >
        <div className="mx-auto max-w-[1400px] px-5 pb-5 md:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-white/40 bg-ink/85 px-5 py-3 text-white backdrop-blur">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 md:inline">
              Live finance facts
            </span>
            <ChainPill />
            <span className="hidden md:contents">
              <Fact
                label="Bridge"
                value={
                  MESSENGER_DESTINATION
                    ? "GravRelayMessenger · trusted relayer"
                    : "messenger not configured"
                }
              />
              <Fact
                label="Swap"
                value={SWAP_ROUTER ? "router configured" : "router not configured"}
              />
            </span>
            <Fact label="Data" value="no simulated numbers" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
      <span className="text-white/55">{label} · </span>
      <span className="text-white">{value}</span>
    </span>
  );
}
