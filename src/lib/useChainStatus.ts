"use client";

import { useEffect, useState } from "react";
import { erc20Abi, formatUnits } from "viem";
import { ethClient, robinhoodClient } from "./chain";
import { GRAV_TOKEN } from "./site";

export type ChainHead = {
  number: bigint;
  timestamp: bigint;
} | null;

export type ChainStatus = {
  ready: boolean;
  robinhood: ChainHead;
  ethereum: ChainHead;
  /** Seconds since each head was mined, recomputed locally every second. */
  now: number;
};

const HEAD_INTERVAL = 12_000;

export function useChainStatus(): ChainStatus {
  const [robinhood, setRobinhood] = useState<ChainHead>(null);
  const [ethereum, setEthereum] = useState<ChainHead>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    let live = true;

    const read = async () => {
      const [rh, eth] = await Promise.allSettled([
        robinhoodClient.getBlock(),
        ethClient.getBlock(),
      ]);
      if (!live) return;
      if (rh.status === "fulfilled") {
        setRobinhood({ number: rh.value.number!, timestamp: rh.value.timestamp });
      }
      if (eth.status === "fulfilled") {
        setEthereum({ number: eth.value.number!, timestamp: eth.value.timestamp });
      }
      setReady(true);
    };

    read();
    const poll = setInterval(read, HEAD_INTERVAL);
    const tick = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => {
      live = false;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  return { ready, robinhood, ethereum, now };
}

export type TokenFacts = {
  loading: boolean;
  live: boolean;
  symbol: string | null;
  decimals: number | null;
  totalSupply: string | null;
};

const TOKEN_INTERVAL = 60_000;

/** Reads $GRAV straight from the contract — the same numbers anyone else can read. */
export function useTokenFacts(): TokenFacts {
  const [facts, setFacts] = useState<TokenFacts>({
    loading: true,
    live: false,
    symbol: null,
    decimals: null,
    totalSupply: null,
  });

  useEffect(() => {
    let live = true;

    const read = async () => {
      try {
        const [symbol, decimals, supply] = await Promise.all([
          robinhoodClient.readContract({
            address: GRAV_TOKEN,
            abi: erc20Abi,
            functionName: "symbol",
          }),
          robinhoodClient.readContract({
            address: GRAV_TOKEN,
            abi: erc20Abi,
            functionName: "decimals",
          }),
          robinhoodClient.readContract({
            address: GRAV_TOKEN,
            abi: erc20Abi,
            functionName: "totalSupply",
          }),
        ]);
        if (!live) return;
        setFacts({
          loading: false,
          live: true,
          symbol,
          decimals,
          totalSupply: Number(formatUnits(supply, decimals)).toLocaleString("en-US"),
        });
      } catch {
        if (!live) return;
        setFacts((f) => ({ ...f, loading: false, live: false }));
      }
    };

    read();
    const poll = setInterval(read, TOKEN_INTERVAL);
    return () => {
      live = false;
      clearInterval(poll);
    };
  }, []);

  return facts;
}

export function formatBlock(n: bigint | undefined | null) {
  return n == null ? "—" : `#${n.toLocaleString("en-US")}`;
}

export function formatAge(timestamp: bigint | undefined | null, now: number) {
  if (timestamp == null) return "—";
  const age = Math.max(0, now - Number(timestamp));
  if (age < 60) return `${age}s ago`;
  if (age < 3600) return `${Math.floor(age / 60)}m ago`;
  return `${Math.floor(age / 3600)}h ago`;
}
