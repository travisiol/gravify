import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { site } from "@/lib/site";

/** The Gravito mark: two chevrons falling toward the same point. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="230 245 620 545"
      className={className}
      role="img"
      aria-label={site.name}
      fill="currentColor"
    >
      <polygon points="473,270 608,270 684,347 502,347 306,540 256,490" />
      <polygon points="541,432 773,432 826,489 541,768 372,603 423,551 539,667 703,503 577,503 534,548 479,494" />
    </svg>
  );
}

export function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export type Tone = "ok" | "warn" | "off" | "bad" | "neutral";

const tones: Record<Tone, string> = {
  ok: "border-[#1F7A4D]/30 bg-[#E6F5EC] text-[#1F7A4D]",
  warn: "border-[#9A6B00]/30 bg-[#FFF4D6] text-[#7A5400]",
  off: "border-line bg-sky-panel text-ink-muted",
  bad: "border-[#B3261E]/30 bg-[#FCE9E7] text-[#B3261E]",
  neutral: "border-line bg-white text-ink",
};

const dots: Record<Tone, string> = {
  ok: "bg-[#1F7A4D]",
  warn: "bg-[#9A6B00]",
  off: "bg-ink-muted/50",
  bad: "bg-[#B3261E]",
  neutral: "bg-ink-muted/50",
};

/** Status chip. The dot carries the state; the shell stays quiet. */
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-ink/10 ${className}`} />;
}

/**
 * Every section opens the same way: a numbered kicker and a short flat
 * headline on the left, the qualification on the right.
 */
export function SectionHeader({
  index,
  kicker,
  title,
  children,
}: {
  index: string;
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          <span>{index}</span>
          <span>{kicker}</span>
        </div>
        <h2 className="text-3xl font-semibold uppercase leading-[0.95] tracking-tightest text-ink md:text-5xl">
          {title}
        </h2>
      </div>
      {children ? (
        <div className="max-w-md text-sm leading-relaxed text-ink-muted">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** The concentric gravity well behind the reserve and closing sections. */
export function Rings({
  count,
  className,
  core = false,
}: {
  count: number;
  className: string;
  /** Draw the mass at the centre the rings fall toward. */
  core?: boolean;
}) {
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx="500"
          cy="500"
          r={60 + ((i + 1) / count) * 440}
          fill="none"
          stroke="rgba(7,26,43,0.14)"
          strokeWidth={i % 2 === 0 ? 1 : 0.6}
          strokeDasharray={i % 3 === 2 ? "3 9" : undefined}
        />
      ))}
      {core ? <circle cx="500" cy="500" r="22" fill="rgba(255,255,255,0.9)" /> : null}
    </svg>
  );
}
