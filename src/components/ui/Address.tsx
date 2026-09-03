"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cx } from "@/lib/cx";
import { truncate } from "@/lib/format";



export function CopyButton({
  value,
  label = "",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* clipboard blocked — nothing useful to say */
        }
      }}
      className={cx(
        "inline-flex items-center gap-1 rounded-sm border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:border-ink/40 hover:text-ink",
        className,
      )}
      aria-label={label || `Copy ${value}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}

/** An address, or an honest "not deployed" when there isn't one yet. */
export function Address({
  address,
  href,
  chars = 4,
  full = false,
}: {
  address?: string;
  href?: string;
  chars?: number;
  full?: boolean;
}) {
  if (!address) {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        Not deployed
      </span>
    );
  }
  const shown = full ? address : truncate(address, chars);
  return (
    <span className="inline-flex items-center gap-2">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-ink underline-offset-4 hover:underline"
        >
          {shown}
          <ExternalLink size={11} className="text-ink-muted" />
        </a>
      ) : (
        <span className="font-mono text-xs text-ink">{shown}</span>
      )}
      <CopyButton value={address} className="px-1.5" />
    </span>
  );
}
