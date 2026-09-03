import { TokenCard } from "../TokenCard";
import { Reveal } from "../ui/Reveal";
import { XIcon } from "../ui/Marks";
import { site } from "@/lib/site";

/** 02 — the address, and the rule for deciding whether it is the real one. */
export function TokenSection() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-14 md:px-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            Token
          </div>
          <h2 className="mt-3 text-3xl font-semibold uppercase leading-[0.95] tracking-tightest text-ink md:text-5xl">
            $GRAV
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/75">
            The contract address is published here and on{" "}
            <a
              href={site.xUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-ink underline-offset-4 hover:underline"
            >
              <XIcon size={12} /> {site.xHandle}
            </a>{" "}
            only. Until it appears in both places there is no official $GRAV.
          </p>
        </Reveal>
        <Reveal>
          <TokenCard />
        </Reveal>
      </div>
    </section>
  );
}
