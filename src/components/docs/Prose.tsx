import type { ReactNode } from "react";

/** A documentation heading that clears the sticky navbar when linked to. */
export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-16 scroll-mt-28 text-2xl font-bold uppercase tracking-tightest text-ink first:mt-0 md:text-3xl"
    >
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-ink/80">{children}</p>
  );
}

export function Ul({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-4 max-w-3xl list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/80">
      {children}
    </ul>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <span className="font-mono">{children}</span>;
}

export function Block({ children }: { children: string }) {
  return (
    <pre className="mt-4 max-w-3xl overflow-x-auto rounded-md border border-ink bg-ink p-5 font-mono text-[12px] leading-relaxed text-sky-light">
      {children}
    </pre>
  );
}
