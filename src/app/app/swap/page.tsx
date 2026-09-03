"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Blank, Fact, PageHeader, Panel } from "@/components/app/Shell";
import { Address } from "@/components/ui/Address";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { addressExplorerUrl, CANONICAL_TOKENS, chains } from "@/lib/chain";
import { formatUnitsFixed } from "@/lib/format";
import { NoRouteError, quoteSwap, readToken, type Quote, type TokenInfo } from "@/lib/swap";
import { useWallet } from "@/lib/useWallet";

const SLIPPAGES = [10, 50, 100];
/** A quote older than this is stale; the original re-fetches before signing. */
const QUOTE_TTL = 30_000;

const known: TokenInfo[] = CANONICAL_TOKENS.map((t) => ({
  address: t.address,
  symbol: t.symbol,
  decimals: t.decimals,
}));

export default function SwapPage() {
  const [tokenIn, setTokenIn] = useState<TokenInfo | null>(known[0] ?? null);
  const [tokenOut, setTokenOut] = useState<TokenInfo | null>(known[1] ?? null);
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(50);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { account, connect } = useWallet();

  const amountIn = useMemo(() => {
    if (!tokenIn || !amount) return 0n;
    const [whole = "0", frac = ""] = amount.split(".");
    const padded = (frac + "0".repeat(tokenIn.decimals)).slice(0, tokenIn.decimals);
    try {
      return BigInt(whole || "0") * 10n ** BigInt(tokenIn.decimals) + BigInt(padded || "0");
    } catch {
      return 0n;
    }
  }, [amount, tokenIn]);

  const quotable = Boolean(tokenIn && tokenOut && amountIn > 0n);

  useEffect(() => {
    if (!quotable || !tokenIn || !tokenOut) return;
    let live = true;
    const run = () =>
      quoteSwap(tokenIn, tokenOut, amountIn, slippage)
        .then((q) => {
          if (!live) return;
          setQuote(q);
          setError(null);
        })
        .catch((e) => {
          if (!live) return;
          setQuote(null);
          setError(e instanceof NoRouteError ? e.message : String(e?.message ?? e));
        });
    run();
    const poll = setInterval(run, QUOTE_TTL);
    return () => {
      live = false;
      clearInterval(poll);
    };
  }, [tokenIn, tokenOut, amountIn, slippage, quotable]);

  const flip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  };

  return (
    <>
      <PageHeader kicker="Swap" title="Route capital">
        Swap through the configured on-chain router on {chains.robinhood.name}. Quotes,
        routes and price impact are read from the router and pool contracts; no quote is
        ever generated locally.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Panel title={`Swap · ${chains.robinhood.name}`}>
          <div className="mt-5 grid gap-3">
            <TokenField
              label="From"
              token={tokenIn}
              onToken={setTokenIn}
              value={amount}
              onValue={setAmount}
              balanceLabel={account ? "—" : "connect wallet"}
            />

            <div className="flex justify-center">
              <button
                onClick={flip}
                aria-label="Swap direction"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink hover:border-ink"
              >
                <ArrowDown size={14} />
              </button>
            </div>

            <TokenField
              label="To"
              token={tokenOut}
              onToken={setTokenOut}
              readOnlyValue={
                quotable && quote && tokenOut
                  ? formatUnitsFixed(quote.expectedOutput, tokenOut.decimals, 4)
                  : "0.00"
              }
            />
          </div>

          <dl className="mt-5 grid gap-y-2 border-t border-line pt-4 font-mono text-[11px] sm:grid-cols-2">
            <Fact label="Expected output" className="pr-4">
              {quotable && quote && tokenOut
                ? `${formatUnitsFixed(quote.expectedOutput, tokenOut.decimals, 6)} ${tokenOut.symbol}`
                : <Blank />}
            </Fact>
            <Fact label="Minimum output" className="pr-4">
              {quotable && quote && tokenOut
                ? `${formatUnitsFixed(quote.minimumOutput, tokenOut.decimals, 6)} ${tokenOut.symbol}`
                : <Blank />}
            </Fact>
            <Fact label="Price impact" className="pr-4">
              {quotable && quote ? `${(quote.priceImpactBps / 100).toFixed(2)}%` : <Blank />}
            </Fact>
            <Fact label="Liquidity source" className="pr-4">
              Uniswap V2 router
            </Fact>
            <Fact label="Route" className="pr-4">
              {quotable && quote ? routeLabel(quote, tokenIn, tokenOut) : <Blank />}
            </Fact>
            <Fact label="Quoted at block" className="pr-4">
              {quotable && quote ? `#${quote.blockNumber.toString()}` : <Blank />}
            </Fact>
            <Fact label="Slippage" className="pr-4">
              <span className="inline-flex gap-1">
                {SLIPPAGES.map((bps) => (
                  <button
                    key={bps}
                    onClick={() => setSlippage(bps)}
                    className={cx(
                      "rounded-sm border px-1.5",
                      slippage === bps ? "border-ink bg-ink text-white" : "border-line",
                    )}
                  >
                    {(bps / 100).toFixed(1)} %
                  </button>
                ))}
              </span>
            </Fact>
            <Fact label="Router" className="pr-4">
              {/* The router is named by the quote, not by configuration. */}
              <Address
                address={quotable && quote ? quote.routerAddress : undefined}
                href={
                  quotable && quote ? addressExplorerUrl(quote.routerAddress) : undefined
                }
              />
            </Fact>
          </dl>

          <div className="mt-5 flex flex-col gap-2">
            {quotable && error ? (
              <p className="rounded-sm border border-[#B3261E]/30 bg-[#FCE9E7] p-3 font-mono text-[11px] text-[#B3261E]">
                {error}
              </p>
            ) : null}
            <Button size="lg" onClick={account ? undefined : connect} disabled={!!account}>
              {account ? "Swap" : "Connect wallet to swap"}
            </Button>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              ERC-20 only (wrap ETH to WETH first). A quote older than 30 s is re-fetched
              before signing.
            </p>
          </div>
        </Panel>

        <Panel title="Route inspector">
          {!quotable || !quote ? (
            <p className="text-xs leading-relaxed text-ink-muted">
              Enter an amount to see the pools the router would use. Every hop shows the
              pool address, fee tier, reserves and the impact it contributes.
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-line">
              {quote.route.map((hop, i) => (
                <li key={hop.pair} className="py-3">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    <span>
                      Hop {i + 1} · {hop.tokenIn.symbol} → {hop.tokenOut.symbol}
                    </span>
                    <span>0.30%</span>
                  </div>
                  <div className="mt-1">
                    <Address address={hop.pair} href={addressExplorerUrl(hop.pair)} />
                  </div>
                  <dl className="mt-2 flex flex-col gap-1 font-mono text-[11px]">
                    <Fact label="Reserves">
                      {formatUnitsFixed(hop.reserveIn, hop.tokenIn.decimals, 4)}{" "}
                      {hop.tokenIn.symbol} /{" "}
                      {formatUnitsFixed(hop.reserveOut, hop.tokenOut.decimals, 4)}{" "}
                      {hop.tokenOut.symbol}
                    </Fact>
                    <Fact label="Through this pool">
                      {formatUnitsFixed(hop.amountIn, hop.tokenIn.decimals, 4)}{" "}
                      {hop.tokenIn.symbol} →{" "}
                      {formatUnitsFixed(hop.amountOut, hop.tokenOut.decimals, 4)}{" "}
                      {hop.tokenOut.symbol}
                    </Fact>
                    <Fact label="Impact">{(hop.impactBps / 100).toFixed(2)}%</Fact>
                  </dl>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </>
  );
}

function routeLabel(quote: Quote, tokenIn: TokenInfo | null, tokenOut: TokenInfo | null) {
  const names = quote.path.map((address) => {
    if (tokenIn && address.toLowerCase() === tokenIn.address.toLowerCase()) return tokenIn.symbol;
    if (tokenOut && address.toLowerCase() === tokenOut.address.toLowerCase()) return tokenOut.symbol;
    return CANONICAL_TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())?.symbol
      ?? `${address.slice(0, 6)}…`;
  });
  return names.join(" → ");
}

function TokenField({
  label,
  token,
  onToken,
  value,
  onValue,
  readOnlyValue,
  balanceLabel,
}: {
  label: string;
  token: TokenInfo | null;
  onToken: (t: TokenInfo | null) => void;
  value?: string;
  onValue?: (v: string) => void;
  readOnlyValue?: string;
  balanceLabel?: string;
}) {
  const [pasted, setPasted] = useState("");

  // A pasted address is resolved against the chain, not a token list.
  useEffect(() => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(pasted)) return;
    let live = true;
    readToken(pasted as `0x${string}`)
      .then((t) => live && onToken(t))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [pasted, onToken]);

  const options = token && !known.some((k) => k.address === token.address)
    ? [...known, token]
    : known;

  return (
    <div className="min-w-0 rounded-sm border border-line bg-sky-panel/60 p-4">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-2">
          <select
            value={token?.address ?? ""}
            onChange={(e) =>
              onToken(options.find((o) => o.address === e.target.value) ?? null)
            }
            className="h-10 w-full rounded-sm border border-line bg-white px-3 font-mono text-sm text-ink"
          >
            <option value="">Select token</option>
            {options.map((o) => (
              <option key={o.address} value={o.address}>
                {o.symbol}
              </option>
            ))}
          </select>
          <input
            placeholder="or paste an ERC-20 address"
            value={pasted}
            onChange={(e) => setPasted(e.target.value.trim())}
            className="h-8 w-full rounded-sm border border-line bg-white px-2 font-mono text-[11px] text-ink outline-none focus:border-ink"
          />
        </div>
        {onValue ? (
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={value}
            onChange={(e) => onValue(e.target.value)}
            className="h-10 w-full min-w-0 rounded-sm border border-line bg-white px-3 text-right font-mono text-lg tabular-nums text-ink outline-none focus:border-ink"
          />
        ) : (
          <span className="flex h-10 items-center justify-end font-mono text-lg tabular-nums text-ink">
            {readOnlyValue}
          </span>
        )}
      </div>
      {balanceLabel ? (
        <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-muted">
          <span>Balance: {balanceLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
