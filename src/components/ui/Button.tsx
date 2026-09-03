import Link from "next/link";
import { cx } from "@/lib/cx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm border font-mono uppercase tracking-[0.12em] transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-blue border-ink",
  secondary: "bg-white text-ink border-line hover:border-ink/40",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px]",
  md: "h-10 px-4 text-xs",
  lg: "h-12 px-6 text-sm",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  href?: string;
} & Omit<ComponentProps<"button">, "children" | "className">;

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...rest
}: Props) {
  const cls = cx(base, variants[variant], sizes[size], className);

  // A link with nowhere to go is a disabled button, not a dead anchor.
  if (href && !rest.disabled) {
    const external = href.startsWith("http");
    if (external) {
      return (
        <a className={cls} href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
