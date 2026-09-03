"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  BookOpen,
  Boxes,
  Coins,
  Droplets,
  History,
  Rocket,
  Route,
  ShieldCheck,
} from "lucide-react";
import { ChainPill } from "../ChainPill";
import { WalletConnect } from "../WalletConnect";
import { Wordmark } from "../Navbar";
import { cx } from "@/lib/cx";

const sections = [
  { href: "/app", label: "Status", Icon: Activity },
  { href: "/app/bridge", label: "Bridge", Icon: ArrowLeftRight },
  { href: "/app/swap", label: "Swap", Icon: Coins },
  { href: "/app/router", label: "Gravity Router", Icon: Route },
  { href: "/app/reserves", label: "Reserves", Icon: ShieldCheck },
  { href: "/app/assets", label: "Assets", Icon: Boxes },
  { href: "/app/liquidity", label: "Liquidity", Icon: Droplets },
  { href: "/app/history", label: "History", Icon: History },
  { href: "/app/deploy", label: "Deploy", Icon: Rocket },
  { href: "/docs", label: "Docs", Icon: BookOpen },
];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

export function AppTopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-sky/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Wordmark />
          </Link>
          <span className="hidden rounded-sm border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted md:inline">
            mainnet
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex">
            <ChainPill />
          </span>
          <WalletConnect compact />
        </div>
      </div>

      {/* On narrow screens the rail becomes a scrolling tab strip. */}
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 md:hidden">
        {sections.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "whitespace-nowrap px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em]",
              isActive(pathname, href)
                ? "text-ink underline underline-offset-8"
                : "text-ink-muted",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-16 flex flex-col gap-0.5 p-4">
      {sections.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={cx(
            "flex items-center gap-3 rounded-sm px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
            isActive(pathname, href)
              ? "bg-white text-ink"
              : "text-ink/70 hover:bg-white/50 hover:text-ink",
          )}
        >
          <Icon size={14} />
          {label}
        </Link>
      ))}
      <div className="mt-8 px-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-ink-muted">
        Contracts are experimental until independently audited.
      </div>
    </nav>
  );
}
