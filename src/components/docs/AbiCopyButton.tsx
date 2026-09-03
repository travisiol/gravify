"use client";

import { CopyButton } from "../ui/Address";
import { abiFor } from "@/lib/abis";

/** Hands the caller the exact ABI this interface uses, as JSON. */
export function AbiCopyButton({ name }: { name: string }) {
  return <CopyButton value={JSON.stringify(abiFor(name), null, 2)} label="Copy ABI" />;
}
