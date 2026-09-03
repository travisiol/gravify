import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Logo, Rings } from "../ui/Marks";
import { Reveal } from "../ui/Reveal";
import { site } from "@/lib/site";

/** The last thing on the page: the ask, and the state of the backing. */
export function Closing() {
  return (
    <section className="relative overflow-hidden">
      <Rings
        count={9}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 opacity-50"
      />
      <div className="relative mx-auto flex max-w-[1400px] flex-col items-center px-5 py-32 text-center md:px-8">
        <Reveal>
          <Logo className="mx-auto mb-10 h-14 w-14 text-white drop-shadow-[0_10px_30px_rgba(7,26,43,0.2)]" />
          <h2 className="text-[13vw] font-bold uppercase leading-[0.86] tracking-tightest text-ink md:text-[7vw]">
            Put capital
            <br />
            in motion.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/app" size="lg">
              Enter {site.name} <ArrowRight size={14} />
            </Button>
            <Button href="/docs" size="lg" variant="secondary">
              Read the docs
            </Button>
          </div>
          <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            Backing: <span className="text-ink-muted">—</span> until deployed · No
            simulated data
          </div>
        </Reveal>
      </div>
    </section>
  );
}
