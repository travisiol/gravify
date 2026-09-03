"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, Panel, StatusRow } from "@/components/app/Shell";
import { Badge } from "@/components/ui/Marks";
import { chains, SWAP_ROUTER } from "@/lib/chain";
import { bridgeMissing, MESSENGER_DESTINATION } from "@/lib/contracts";
import { supportedAssets, deployedAssetCount } from "@/lib/assets";
import { GRAV_TOKEN, site } from "@/lib/site";
import { formatBlock, useChainStatus } from "@/lib/useChainStatus";
import { useWallet } from "@/lib/useWallet";
import { truncate } from "@/lib/format";

const shortcuts = [
  { href: "/app/bridge", label: "Bridge", body: "Wrap and unwrap through GravBridge." },
  { href: "/app/swap", label: "Swap", body: "Route gTokens through the configured router." },
  {
    href: "/app/reserves",
    label: "Reserves",
    body: "Proof of Gravity — verify backing per asset.",
  },
  {
    href: "/app/router",
    label: "Gravity Router",
    body: "Plan a bridge + swap path with live quotes.",
  },
];

/** Every switch in the system, and whether it is actually on. */
export default function StatusPage() {
  const { robinhood, ethereum } = useChainStatus();

  return (
    <>
      <PageHeader kicker={`${site.wordmark} · finance status`} title="Development state">
        Every switch here reflects configuration and chain reads. A component that is not
        deployed is shown as such — never substituted with sample data.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`${site.name} Finance · development network`}>
          <dl className="divide-y divide-line">
            <StatusRow
              label="Environment"
              detail={`${chains.ethereum.name} (${chains.ethereum.id}) → ${chains.robinhood.name} (${chains.robinhood.id})`}
              tone="ok"
              state="mainnet"
            />
            <StatusRow
              label="Bridge contracts"
              detail={bridgeMissing[0] ?? "configured"}
              tone={bridgeMissing.length ? "off" : "ok"}
              state={bridgeMissing.length ? "Not deployed" : "Deployed"}
            />
            <StatusRow
              label="Messenger"
              detail={`No LayerZero endpoint exists on ${chains.robinhood.name} (verified); GravRelayMessenger is the available transport.`}
              tone={MESSENGER_DESTINATION ? "ok" : "off"}
              state={MESSENGER_DESTINATION ? "Deployed" : "Not deployed"}
            />
            <StatusRow
              label="Reserve contracts"
              detail={`${supportedAssets.length} assets in registry`}
              tone={deployedAssetCount ? "ok" : "off"}
              state={deployedAssetCount ? `${deployedAssetCount} deployed` : "Not deployed"}
            />
            <StatusRow
              label="Swap router"
              tone={SWAP_ROUTER ? "ok" : "off"}
              state={SWAP_ROUTER ? "Configured · uniswap-v2" : "Not configured"}
            />
            <StatusRow
              label="$GRAV token"
              detail={GRAV_TOKEN}
              tone="ok"
              state="Configured"
            />
            <StatusRow
              label="WalletConnect"
              detail="Injected wallets (EIP-6963) only."
              tone="off"
              state="Not configured"
            />
            <StatusRow
              label={`RPC · ${chains.ethereum.name}`}
              tone={ethereum ? "ok" : "off"}
              state={
                ethereum ? `Connected · ${formatBlock(ethereum.number)}` : "Connecting"
              }
            />
            <StatusRow
              label={`RPC · ${chains.robinhood.name}`}
              tone={robinhood ? "ok" : "off"}
              state={
                robinhood ? `Connected · ${formatBlock(robinhood.number)}` : "Connecting"
              }
            />
            <WalletStatus />
          </dl>
        </Panel>

        <Panel title="Activation checklist">
          <p className="text-sm leading-relaxed text-ink/75">
            Real components switch on as configuration lands. Nothing below is simulated
            while missing.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <Check
              label="Bridge"
              tone={bridgeMissing.length ? "off" : "ok"}
              state={bridgeMissing.length ? `${bridgeMissing.length} missing` : "Ready"}
            >
              {bridgeMissing.length ? (
                <ul className="mt-2 flex flex-col gap-1">
                  {bridgeMissing.map((key) => (
                    <li key={key} className="break-all font-mono text-[11px] text-ink-muted">
                      · {key}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-relaxed text-ink/70">
                  Bridge contracts and messenger are configured on both chains.
                </p>
              )}
            </Check>

            <Check
              label="Swap router"
              tone={SWAP_ROUTER ? "ok" : "off"}
              state={SWAP_ROUTER ? "Ready" : "Not configured"}
            >
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                {SWAP_ROUTER
                  ? "Router configured; quotes come from the router and pair contracts."
                  : "Set NEXT_PUBLIC_SWAP_ROUTER to enable quotes."}
              </p>
            </Check>

            <Check label="Proof of Gravity" tone="ok" state="Ready">
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                Reserve engine is always on. It reports AWAITING DEPLOYMENT per asset until
                a vault and gToken address are configured.
              </p>
            </Check>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-md border border-line bg-white p-5 transition-colors hover:bg-sky-panel"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                {s.label}
              </span>
              <ArrowRight
                size={14}
                className="text-ink-muted transition-transform group-hover:translate-x-0.5"
              />
            </div>
            <p className="mt-2 text-sm text-ink/70">{s.body}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

function WalletStatus() {
  const { account } = useWallet();
  return (
    <StatusRow
      label="Wallet"
      detail={account ? truncate(account, 6) : "Injected wallets via EIP-6963"}
      tone={account ? "ok" : "off"}
      state={account ? "Connected" : "Not connected"}
    />
  );
}

function Check({
  label,
  tone,
  state,
  children,
}: {
  label: string;
  tone: "ok" | "off";
  state: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-line p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
          {label}
        </span>
        <Badge tone={tone}>{state}</Badge>
      </div>
      {children}
    </div>
  );
}
