export const site = {
  /** Uppercase wordmark used in the nav, hero eyebrow and footer. */
  wordmark: "GRAVIFY",
  /** Cased brand name used inside sentences. */
  name: "Gravify",
  secondary: "The liquidity gravity layer for Robinhood Chain.",
  tagline: "Pull assets in. Verify the backing. Put capital to work.",
  description:
    "The liquidity gravity layer for Robinhood Chain. Pull assets in. Verify the backing. Put capital to work.",
  url: "https://www.gravify.xyz",
  xHandle: "@GravifyRH",
  xUrl: "https://x.com/GravifyRH",
} as const;

/**
 * $GRAV — the address the interface treats as canonical.
 * Published here and on the X account; it is official only when it matches both.
 */
export const GRAV_TOKEN = (process.env.NEXT_PUBLIC_GRAV_TOKEN_ADDRESS ??
  "0xcb7f25C0513c658B1510838D8Bd63d56BD8Ba2CA") as `0x${string}`;
