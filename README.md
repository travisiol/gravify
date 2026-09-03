# GRAVIFY

**Capital has gravity.** The liquidity gravity layer for Robinhood Chain — pull assets
in, verify the backing, put capital to work.

A rebuild of the gravfi.xyz landing page, renamed to GRAVIFY. Layout, copy, palette,
type scale, animation timings and the on-chain reads are reproduced 1:1; only the brand
strings changed.

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

## What is actually live

| Surface | Source |
| --- | --- |
| Block heights (both chains) | `eth_getBlockByNumber` on Ethereum + Robinhood Chain, every 12s |
| $GRAV symbol / decimals / supply | ERC-20 reads on the token contract, every 60s |
| Liquidity table | Router → factory → `allPairs`, reserves + token metadata read at one pinned block, every 30s |
| Reserves, assets, registry | Static: nothing is deployed, so every row says so |

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
2. **`site.xHandle` / `site.xUrl`** — `@GravifyRH` is a placeholder. The whole point of
   the token section is that the address matches in both places; register the account or
   point these at the real one.
3. **`site.url`** — `https://www.gravify.xyz`, used for OG image URLs and canonical links.
4. **`NEXT_PUBLIC_SWAP_ROUTER`** — defaults to the router the original site uses. Swap it
   for yours, or leave it unset and the interface will read "router not configured".

Per-asset vaults and gTokens are read from env (`NEXT_PUBLIC_GRAV_VAULT_*`,
`NEXT_PUBLIC_GRAV_TOKEN_*`). An asset only shows as live once **both** are set — that
gate drives the "0 / 5" counter, the "not deployed" badges and the reserve cards.

## Structure

```
src/
  app/            layout, page, favicon + OG image (generated, no binary assets)
  components/
    CityCanvas    the hero: a 3D street drawn in 2D canvas, ~600 lines of arithmetic
    Hero          headline, ticker, live finance facts
    ProtocolStrip five live numbers under the fold
    TokenCard     $GRAV, read from the contract
    sections/     02–09 plus the closing call to action
  lib/
    chain         chain defs, viem clients, router/canonical token addresses
    liquidity     the pool scanner
    assets        the asset + contract registry
    useChainStatus block heads and token facts
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

The nav and footer link to `/app/*` and `/docs/*`, matching the reference. Those routes
do not exist here — this is the landing page only.
