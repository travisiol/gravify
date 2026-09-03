"use client";

import { useCallback, useEffect, useState } from "react";

type Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: never[]) => void): void;
  removeListener?(event: string, handler: (...args: never[]) => void): void;
};

function injected(): Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { ethereum?: Provider }).ethereum;
}

/**
 * Talks to whatever EIP-1193 wallet the browser injects. Reads only —
 * nothing here signs, and no address ever leaves the page.
 */
export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const provider = injected();
    if (!provider) return;

    provider
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list?.length) setAccount(list[0]);
      })
      .catch(() => {});

    const onAccounts = (...args: never[]) => {
      const list = args[0] as unknown as string[];
      setAccount(list?.length ? list[0] : null);
    };
    provider.on?.("accountsChanged", onAccounts);
    return () => provider.removeListener?.("accountsChanged", onAccounts);
  }, []);

  const connect = useCallback(async () => {
    const provider = injected();
    if (!provider) {
      window.open(
        "https://ethereum.org/en/wallets/find-wallet/",
        "_blank",
        "noreferrer",
      );
      return;
    }
    setBusy(true);
    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (accounts?.length) setAccount(accounts[0]);
    } catch {
      /* the user dismissed the wallet prompt */
    } finally {
      setBusy(false);
    }
  }, []);

  return { account, busy, connect };
}
