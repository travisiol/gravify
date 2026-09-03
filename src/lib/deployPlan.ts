import { chains } from "./chain";
import { site } from "./site";
import type { SupportedAsset } from "./assets";

export type DeployStep = {
  title: string;
  chain: string;
  detail: string;
};

/**
 * The order the contracts have to come up in. Destination first, because the
 * source bridge cannot register a route until the gToken it points at exists.
 */
export function deployPlan(asset: SupportedAsset): DeployStep[] {
  const dst = chains.robinhood.name;
  const src = chains.ethereum.name;
  const g = asset.wrapped;

  return [
    {
      title: `Deploy GravRelayMessenger on ${dst}`,
      chain: dst,
      detail: `localEid ${chains.robinhood.id} · admin = your wallet`,
    },
    {
      title: `Deploy GravBridge on ${dst}`,
      chain: dst,
      detail: `messenger = destination messenger · remoteEid ${chains.ethereum.id}`,
    },
    {
      title: "messenger.setBridge(bridge)",
      chain: dst,
      detail: "The destination messenger only accepts sends from the destination bridge.",
    },
    {
      title: "messenger.grantRole(RELAYER_ROLE, wallet)",
      chain: dst,
      detail: "Lets this wallet deliver messages from the Bridge page or scripts/relayer.mjs.",
    },
    {
      title: `Deploy GravToken ${g}`,
      chain: dst,
      detail: `"${site.name} ${asset.name}" · ${asset.decimals} decimals · no public mint`,
    },
    {
      title: `${g}.grantRole(BRIDGE_ROLE, bridge)`,
      chain: dst,
      detail: "Only the bridge may mint or burn.",
    },
    {
      title: `bridge.setRoute(${g} → ${asset.symbol}, Token)`,
      chain: dst,
      detail: `Registers the unwrap route on ${dst}.`,
    },
    {
      title: `Deploy GravRelayMessenger on ${src}`,
      chain: src,
      detail: `localEid ${chains.ethereum.id} · admin = your wallet`,
    },
    {
      title: `Deploy GravBridge on ${src}`,
      chain: src,
      detail: `messenger = source messenger · remoteEid ${chains.robinhood.id}`,
    },
    {
      title: "messenger.setBridge(bridge)",
      chain: src,
      detail: "The source messenger only accepts sends from the source bridge.",
    },
    {
      title: "messenger.grantRole(RELAYER_ROLE, wallet)",
      chain: src,
      detail: "Needed to deliver unwraps back to the source chain.",
    },
    {
      title: `Deploy GravVault for ${asset.symbol}`,
      chain: src,
      detail: "Single-asset custody · BRIDGE_ROLE-only movements",
    },
    {
      title: "vault.grantRole(BRIDGE_ROLE, bridge)",
      chain: src,
      detail: "Only the bridge may deposit into or withdraw from the vault.",
    },
    {
      title: `bridge.setRoute(${asset.symbol} → ${g}, Vault)`,
      chain: src,
      detail: `Registers the wrap route on the source chain. After this the bridge is live for this asset.`,
    },
  ];
}

export function envTemplate(asset: SupportedAsset) {
  return [
    "NEXT_PUBLIC_BRIDGE_PROVIDER=native",
    "NEXT_PUBLIC_GRAV_MESSENGER_SOURCE=",
    "NEXT_PUBLIC_GRAV_MESSENGER_DESTINATION=",
    "NEXT_PUBLIC_GRAV_BRIDGE_SOURCE=",
    "NEXT_PUBLIC_GRAV_BRIDGE_DESTINATION=",
    `NEXT_PUBLIC_GRAV_VAULT_${asset.symbol}=`,
    `NEXT_PUBLIC_GRAV_TOKEN_${asset.symbol}=`,
  ].join("\n");
}
