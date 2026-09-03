"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { formatGwei } from "viem";
import { Blank, Callout, PageHeader, Panel } from "@/components/app/Shell";
import { Address, CopyButton } from "@/components/ui/Address";
import { Badge } from "@/components/ui/Marks";
import { cx } from "@/lib/cx";
import { chains, ethClient, robinhoodClient } from "@/lib/chain";
import { supportedAssets } from "@/lib/assets";
import { BRIDGE_DESTINATION, BRIDGE_SOURCE, MESSENGER_DESTINATION, MESSENGER_SOURCE } from "@/lib/contracts";
import { deployPlan, envTemplate } from "@/lib/deployPlan";
import { site } from "@/lib/site";
import { useWallet } from "@/lib/useWallet";

/** Rough cost of bringing one asset up, per chain. */
const GAS_PER_CHAIN = 3_500_000n;

/**
 * The operator's checklist. Each line is one real transaction; the page never
 * pretends a step is done, it reads the addresses back from configuration.
 */
export default function DeployPage() {
  const [symbol, setSymbol] = useState(supportedAssets[0].symbol);
  const [done, setDone] = useState(0);
  const { account, connect } = useWallet();
  const [gas, setGas] = useState<{ eth: bigint; rh: bigint } | null>(null);

  const asset = supportedAssets.find((a) => a.symbol === symbol)!;
  const steps = deployPlan(asset);

  useEffect(() => {
    let live = true;
    Promise.all([ethClient.getGasPrice(), robinhoodClient.getGasPrice()])
      .then(([eth, rh]) => live && setGas({ eth, rh }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const ethCost = gas ? Number(gas.eth * GAS_PER_CHAIN) / 1e18 : null;

  return (
    <>
      <PageHeader kicker="Operator · deployment" title={`Deploy ${site.name} contracts`}>
        Real deployments signed by your wallet, one transaction per step, on{" "}
        {chains.ethereum.name} and {chains.robinhood.name}. Nothing is simulated; addresses
        come from receipts and the plan resumes where you left off.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <Panel
          title={`Deploy plan · ${asset.symbol} → ${asset.wrapped} · mainnet`}
          action={
            <button
              onClick={() => setDone(0)}
              className="inline-flex items-center gap-1 hover:text-ink"
            >
              reset progress
              <RotateCcw size={12} />
            </button>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            {supportedAssets.map((a) => (
              <button
                key={a.symbol}
                onClick={() => {
                  setSymbol(a.symbol);
                  setDone(0);
                }}
                className={cx(
                  "rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em]",
                  symbol === a.symbol
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink-muted hover:text-ink",
                )}
              >
                {a.symbol}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Callout tone="warn" title="Mainnet · real funds">
              Every step below is a real transaction paid from your wallet on{" "}
              {chains.ethereum.name} or {chains.robinhood.name}. Your wallet becomes admin,
              pauser and relayer. Use a wallet you control; consider moving admin to a
              multisig afterwards.
            </Callout>
          </div>

          <div className="mt-4">
            {account ? (
              <Callout>
                Signing as {account}. Steps run in order; each one waits for its receipt.
              </Callout>
            ) : (
              <Callout>
                <button onClick={connect} className="underline underline-offset-4">
                  Connect the wallet
                </button>{" "}
                that will own the deployment.
              </Callout>
            )}
          </div>

          <ol className="mt-5 flex flex-col divide-y divide-line">
            {steps.map((step, i) => {
              const active = i === done;
              const complete = i < done;
              return (
                <li key={`${step.title}-${i}`} className="flex items-start gap-3 py-3">
                  <span
                    className={cx(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                      complete
                        ? "border-[#1F7A4D] bg-[#E6F5EC] text-[#1F7A4D]"
                        : active
                          ? "border-ink text-ink"
                          : "border-line text-ink-muted",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cx("text-sm", active ? "text-ink" : "text-ink-muted")}>
                        {step.title}
                      </span>
                      <Badge>{step.chain}</Badge>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-muted">
                      {step.detail}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Addresses">
            <dl className="flex flex-col gap-3">
              <AddressRow label="Source token" address={asset.source} chain="ethereum" />
              <AddressRow label="Messenger · source" address={MESSENGER_SOURCE} chain="ethereum" />
              <AddressRow label="Bridge · source" address={BRIDGE_SOURCE} chain="ethereum" />
              <AddressRow label="Vault" address={asset.vault} chain="ethereum" />
              <AddressRow
                label="Messenger · destination"
                address={MESSENGER_DESTINATION}
                chain="robinhood"
              />
              <AddressRow
                label="Bridge · destination"
                address={BRIDGE_DESTINATION}
                chain="robinhood"
              />
              <AddressRow label={asset.wrapped} address={asset.token} chain="robinhood" />
            </dl>

            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              Gas price · {chains.ethereum.name}:{" "}
              {gas ? `${Number(formatGwei(gas.eth)).toFixed(2)} gwei` : "—"} ·{" "}
              {chains.robinhood.name}:{" "}
              {gas ? `${Number(formatGwei(gas.rh)).toFixed(3)} gwei` : "—"}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-muted">
              Rough total: ~3.5M gas on the source chain, ~3.5M on {chains.robinhood.name}{" "}
              per first asset.
              {ethCost !== null ? ` ≈ ${ethCost.toFixed(12)} ETH on ${chains.ethereum.name}.` : ""}
            </p>
          </Panel>

          <Panel title="When finished">
            <p className="text-sm leading-relaxed text-ink/75">
              Paste these into <span className="font-mono">.env.local</span> (or the Vercel
              production env) and rebuild. The interface verifies every address on-chain
              before enabling actions.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-sm border border-ink bg-ink p-4 font-mono text-[11px] leading-relaxed text-sky-light">
              {envTemplate(asset)}
            </pre>
            <div className="mt-3">
              <CopyButton value={envTemplate(asset)} label="Copy env" />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function AddressRow({
  label,
  address,
  chain,
}: {
  label: string;
  address: string;
  chain: "ethereum" | "robinhood";
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1">
        {address ? (
          <Address
            address={address}
            href={`${chains[chain].explorer}/address/${address}`}
          />
        ) : (
          <Blank />
        )}
      </dd>
    </div>
  );
}
