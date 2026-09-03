import Link from "next/link";
import { TokenCard } from "./TokenCard";
import { Logo, XIcon } from "./ui/Marks";
import { chains } from "@/lib/chain";
import { site } from "@/lib/site";

const finance = [
  { href: "/app/bridge", label: "Bridge" },
  { href: "/app/swap", label: "Swap" },
  { href: "/app/reserves", label: "Reserves" },
  { href: "/app/assets", label: "Assets" },
  { href: "/app/liquidity", label: "Liquidity" },
  { href: "/app/history", label: "History" },
];

const developers = [
  { href: "/docs", label: "Documentation" },
  { href: "/docs/contracts", label: "Contracts" },
  { href: "/app", label: "Finance status" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-sky-light/60">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-white">
                <Logo className="h-5 w-5" />
              </span>
              <span className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-ink">
                {site.wordmark}
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/75">
              {site.secondary}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/75">
              {site.tagline}
            </p>
            <a
              href={site.xUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-sm border border-line bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink hover:border-ink/40"
            >
              <XIcon /> {site.xHandle}
            </a>
            <TokenCard compact className="mt-5 max-w-sm" />
          </div>

          <FooterColumn title="Finance" links={finance} />
          <FooterColumn title="Developers" links={developers} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted md:flex-row md:items-center md:justify-between">
          <span>Contracts are experimental until independently audited.</span>
          <span>
            mainnet · {chains.ethereum.name} {chains.ethereum.id} → {chains.robinhood.name}{" "}
            {chains.robinhood.id}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        {title}
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-ink/80 hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
