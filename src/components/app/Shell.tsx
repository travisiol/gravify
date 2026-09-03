import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Badge, type Tone } from "../ui/Marks";

/** The heading every app page opens with. */
export function PageHeader({
  kicker,
  title,
  children,
  aside,
}: {
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          {kicker}
        </div>
        <h1 className="mt-2 text-3xl font-bold uppercase leading-none tracking-tightest text-ink md:text-4xl">
          {title}
        </h1>
        {children ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/75">{children}</p>
        ) : null}
      </div>
      {aside}
    </div>
  );
}

/** A bordered card with a mono label across its top edge. */
export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName = "p-5",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cx("min-w-0 rounded-md border border-line bg-white", className)}>
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-5 py-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          {title}
        </div>
        {action ? <div className="font-mono text-[11px] text-ink-muted">{action}</div> : null}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

const calloutTones: Record<Tone, string> = {
  ok: "border-[#1F7A4D]/30 bg-[#E6F5EC] text-[#1F7A4D]",
  warn: "border-[#9A6B00]/30 bg-[#FFF4D6] text-[#7A5400]",
  off: "border-line bg-sky-panel text-ink-muted",
  bad: "border-[#B3261E]/30 bg-[#FCE9E7] text-[#B3261E]",
  neutral: "border-line bg-white text-ink",
};

/** An inline notice. Used wherever the interface has to admit a limitation. */
export function Callout({
  tone = "off",
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("rounded-sm border p-4 text-sm", calloutTones[tone])}>
      {title ? (
        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em]">{title}</div>
      ) : null}
      <div className="text-[13px] leading-relaxed text-ink/80">{children}</div>
    </div>
  );
}

/** One line of a status list: label, detail, and a badge on the right. */
export function StatusRow({
  label,
  detail,
  tone,
  state,
}: {
  label: string;
  detail?: ReactNode;
  tone: Tone;
  state: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-4 py-3">
      <div>
        <dt className="text-sm text-ink">{label}</dt>
        {detail ? (
          <dd className="mt-0.5 break-words font-mono text-[11px] text-ink-muted">{detail}</dd>
        ) : null}
      </div>
      <dd>
        <Badge tone={tone}>{state}</Badge>
      </dd>
    </div>
  );
}

/** A key/value line inside a quote or summary block. */
export function Fact({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-center justify-between gap-3", className)}>
      <dt className="uppercase tracking-[0.12em] text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-ink">{children}</dd>
    </div>
  );
}

/** An em dash that reads as "we have not read this", not as zero. */
export function Blank() {
  return <span className="text-ink-muted">—</span>;
}
