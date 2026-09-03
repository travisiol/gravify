# GRAVITO

**Capital has gravity.** The liquidity gravity layer for Robinhood Chain — pull assets
in, verify the backing, put capital to work.

A rebuild of gravfi.xyz — every page, not just the landing — renamed to GRAVITO.
Layout, copy, palette, type scale, animation timings and the on-chain reads are
reproduced 1:1; only the brand strings changed.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

The page reads live data on load — no fixtures, no simulated numbers. If the RPCs are
unreachable the interface says so rather than inventing a figure.

## Pages

Thirteen routes, matching the original exactly.

| Route | What it is |
| --- | --- |
| `/` | The landing page: hero flythrough, live protocol strip, nine sections |
| `/app` | Finance status — every switch, and whether it is actually on |
| `/app/bridge` | Wrap and unwrap, with the transaction lifecycle |
| `/app/swap` | Router-quoted swaps and the route inspector |
| `/app/router` | Gravity Router: the bridge leg and the swap leg as one plan |
| `/app/reserves` | Proof of Gravity plus the per-asset read inspector |
| `/app/assets` | The registry as a table of live figures |
| `/app/assets/[symbol]` | One asset: backing, contracts, and where to act on it |
| `/app/liquidity` | The full pool explorer |
| `/app/history` | A wallet's wraps, unwraps and swaps, from chain logs |
| `/app/deploy` | The 14-step operator checklist, with live gas prices |
| `/docs` | The finance documentation |
| `/docs/contracts` | The contract registry and its ABIs |

The marketing pages (`/`, `/docs/*`) carry the navbar and footer; everything under
`/app` uses its own shell — chain-status bar, section rail, no marketing chrome.

## What is actually live

| Surface | Source |
| --- | --- |
| Block heights (both chains) | `eth_getBlockByNumber` on Ethereum + Robinhood Chain, every 12s |
| $GRAV symbol / decimals / supply | ERC-20 reads on the token contract, every 60s |
| Liquidity table | Router → factory → `allPairs`, reserves + token metadata read at one pinned block, every 30s |
| Swap quotes | `getAmountsOut` on the router, direct pair then two-hop via WETH; impact from pool reserves |
| Reserve reports | `balanceOf(vault)` + `totalLocked()` against `totalSupply()`, pinned per chain, every 30s |
| History | gToken `Transfer` logs for the connected wallet — a mint from zero is a wrap |
| Deploy gas estimate | `eth_gasPrice` on both chains |

Verified against the source: the landing page's server-rendered markup is element-for-element
identical to gravfi.xyz — 583 tags, same classes, same order. The only difference in the whole
tree is the hamburger icon, which lucide-react draws with `<path>` in this version and `<line>`
in the one the original shipped. Same geometry, same pixels.

The liquidity engine reads the oldest 40 and newest 40 pairs the factory has ever
created, plus any gToken pool and the canonical WETH/USDG pool, all pinned to a single
block so the table is one consistent view. TVL is quoted in USDG; volume is omitted
because it needs an indexer.

## Values you must replace before this goes live

Four strings still point at the original project. They are all in
[`src/lib/site.ts`](src/lib/site.ts) and [`.env.example`](.env.example):

1. **`GRAV_TOKEN`** — currently `0xcb7f25C0…8Ba2CA`, which is **not your contract**. It is
   there so the token card demonstrates a live read. Deploy your own $GRAV and set
   `NEXT_PUBLIC_GRAV_TOKEN_ADDRESS`. Publishing someone else's address as "the official
   $GRAV" is exactly the failure the card exists to prevent.
2. **`site.xHandle` / `site.xUrl`** — `@GravitoRH` is a placeholder. The whole point of
   the token section is that the address matches in both places; register the account or
   point these at the real one.
3. **`site.url`** — `https://www.gravito.xyz`, used for OG image URLs and canonical links.
4. **`NEXT_PUBLIC_SWAP_ROUTER`** — defaults to the router the original site uses. Swap it
   for yours, or leave it unset and the interface will read "router not configured".

Per-asset vaults and gTokens are read from env (`NEXT_PUBLIC_GRAV_VAULT_*`,
`NEXT_PUBLIC_GRAV_TOKEN_*`). An asset only shows as live once **both** are set — that
gate drives the "0 / 5" counter, the "not deployed" badges and the reserve cards.

## Structure

```
src/
  app/            layout, favicon + OG image (generated, no binary assets)
    (site)/       landing + docs, wrapped in the marketing chrome
    app/          the application shell and its nine pages
  components/
    CityCanvas    the hero: a 3D street drawn in 2D canvas, ~600 lines of arithmetic
    Hero          headline, ticker, live finance facts
    ProtocolStrip five live numbers under the fold
    ReserveCard   one asset's backing, compact on the landing, full in the app
    LiquidityTable the pool table, trimmed on the landing, complete in the explorer
    TokenCard     $GRAV, read from the contract
    app/          the shell primitives: rail, panels, callouts, status rows
    sections/     02–09 plus the closing call to action
  lib/
    chain         chain defs, viem clients, router/canonical token addresses
    reserves      the Proof of Gravity engine
    liquidity     the pool scanner
    swap          route discovery and quoting
    history       wallet activity from transfer logs
    contracts     the 15-slot contract registry
    assets        the asset registry
    deployPlan    the 14 steps that bring one asset up
    format        truncation and fixed-decimal amounts
```

### The hero

No WebGL, no models, no image assets. `CityCanvas` projects quads by hand, sorts them
far-to-near, and fades everything into the horizon. Buildings, windows, trees, lamps,
cars and pedestrians are all generated from one integer hash, so the same street shows up
on every load. The camera drifts forward at 2.6 m/s and leans toward the cursor. It stops
when the hero scrolls out of view and never starts under `prefers-reduced-motion`.

## Design tokens

| Token | Value | Used for |
| --- | --- | --- |
| `--sky` | `#79c8f5` | page ground |
| `--sky-light` | `#a9ddf7` | alternating section bands |
| `--panel` | `#eaf7ff` | chips, inset panels |
| `--ink` | `#071a2b` | all text, primary buttons |
| `--navy` | `#0b2842` | button hover |
| `--muted` | `#557083` | labels, secondary copy |
| `--line` | `rgba(7,26,43,0.15)` | every border |

Type is Geist and Geist Mono. Headings are uppercase at `-0.04em` and `leading-[0.95]`;
every label is mono, uppercase, wide-tracked.

## Not built

The pages are complete; the contracts behind them are not. Bridge, swap and deploy
prepare and describe transactions but nothing can be signed until the addresses in
`.env.local` point at real deployments — which is exactly how the original behaves.
