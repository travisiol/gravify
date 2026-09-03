"use client";

import { Wallet } from "lucide-react";
import { Button } from "./ui/Button";
import { truncate } from "@/lib/format";
import { useWallet } from "@/lib/useWallet";

export function WalletConnect({ compact = false }: { compact?: boolean }) {
  const { account, busy, connect } = useWallet();
  const size = compact ? "md" : "lg";

  if (account) {
    return (
      <Button variant="secondary" size={size} disabled>
        <Wallet size={14} /> {truncate(account)}
      </Button>
    );
  }

  return (
    <Button variant="secondary" size={size} onClick={connect} disabled={busy}>
      <Wallet size={14} /> {busy ? "Connecting" : "Connect"}
    </Button>
  );
}
