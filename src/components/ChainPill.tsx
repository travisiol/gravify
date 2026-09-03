"use client";

import { Badge } from "./ui/Marks";
import { chains } from "@/lib/chain";
import { formatBlock, useChainStatus } from "@/lib/useChainStatus";

/** Robinhood Chain's head, or the honest truth that we haven't reached it yet. */
export function ChainPill() {
  const { robinhood } = useChainStatus();
  return (
    <Badge tone={robinhood ? "ok" : "off"}>
      {chains.robinhood.name} ·{" "}
      {robinhood ? formatBlock(robinhood.number) : "connecting"}
    </Badge>
  );
}
