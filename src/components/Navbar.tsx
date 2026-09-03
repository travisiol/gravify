"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Logo, XIcon } from "./ui/Marks";
import { ChainPill } from "./ChainPill";
import { WalletConnect } from "./WalletConnect";
import { site } from "@/lib/site";

const links = [
  { href: "/#finance", label: "Finance" },
  { href: "/app/assets", label: "Assets" },
  { href: "/app/reserves", label: "Reserves" },
  { href: "/app/liquidity", label: "Liquidity" },
  { href: "/docs", label: "Docs" },
];

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center rounded-sm bg-sky text-white"
        style={{ width: 32, height: 32 }}
      >
        <Logo className="h-[62%] w-[62%]" />
      </span>
      <span className="font-sans text-[15px] font-bold uppercase tracking-[0.18em] text-ink">
        {site.name}
      </span>
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-sky/95 backdrop-blur"
          : "border-transparent bg-sky/0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8">
        <Link href="/" aria-label={`${site.name} home`}>
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/80 transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={site.xUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${site.name} on X`}
            className="hidden h-10 w-10 items-center justify-center rounded-sm border border-line bg-white text-ink hover:border-ink/40 xl:flex"
          >
            <XIcon />
          </a>
          <ChainPill />
          <WalletConnect compact />
          <Button href="/app" size="md">
            Launch App
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-sm p-2 text-ink lg:hidden"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-line bg-sky lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-sm px-2 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-ink/5"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-3 border-t border-line pt-4">
                <ChainPill />
                <WalletConnect compact />
                <Button href="/app">Launch App</Button>
                <a
                  href={site.xUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink"
                >
                  <XIcon /> {site.xHandle}
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
