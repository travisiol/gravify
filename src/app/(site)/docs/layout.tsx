import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Docs · ${site.name}`,
};

const contents = [
  { href: "/docs#overview", label: "Overview" },
  { href: "/docs#architecture", label: "Architecture" },
  { href: "/docs#bridge", label: "Bridge" },
  { href: "/docs#reserves", label: "Proof of Gravity" },
  { href: "/docs#swap", label: "Swap & liquidity" },
  { href: "/docs#router", label: "Gravity Router" },
  { href: "/docs#configuration", label: "Configuration" },
  { href: "/docs#security", label: "Security" },
  { href: "/docs/contracts", label: "Contracts & ABIs" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-12 md:px-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Documentation
        </div>
        <nav className="mt-3 flex flex-col gap-1">
          {contents.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-2 py-1.5 text-sm text-ink/80 hover:bg-white/60 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
