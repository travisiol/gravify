import { chains, SWAP_ROUTER } from "./chain";
import { supportedAssets } from "./assets";
import { site } from "./site";

export type ContractEntry = {
  name: string;
  role: string;
  chain: string;
  explorer: string;
  address: string;
};

/**
 * Every contract the interface knows about — including the ones that do not
 * exist yet. Listing the gaps is the point: a missing address is information.
 */
export const contractRegistry: ContractEntry[] = [
  {
    name: "GravRelayMessenger",
    role: "Trusted-relayer messenger on the source chain",
    chain: chains.ethereum.name,
    explorer: chains.ethereum.explorer,
    address: process.env.NEXT_PUBLIC_GRAV_MESSENGER_SOURCE ?? "",
  },
  {
    name: "GravRelayMessenger",
    role: `Trusted-relayer messenger on ${chains.robinhood.name}`,
    chain: chains.robinhood.name,
    explorer: chains.robinhood.explorer,
    address: process.env.NEXT_PUBLIC_GRAV_MESSENGER_DESTINATION ?? "",
  },
  {
    name: "GravBridge",
    role: "Bridge entry on the source chain (locks collateral via vaults)",
    chain: chains.ethereum.name,
    explorer: chains.ethereum.explorer,
    address: process.env.NEXT_PUBLIC_GRAV_BRIDGE_SOURCE ?? "",
  },
  {
    name: "GravBridge",
    role: `Bridge entry on ${chains.robinhood.name} (mints and burns gTokens)`,
    chain: chains.robinhood.name,
    explorer: chains.robinhood.explorer,
    address: process.env.NEXT_PUBLIC_GRAV_BRIDGE_DESTINATION ?? "",
  },
  ...supportedAssets.flatMap((asset): ContractEntry[] => [
    {
      name: `GravVault · ${asset.symbol}`,
      role: `Custody for ${asset.symbol} collateral`,
      chain: chains.ethereum.name,
      explorer: chains.ethereum.explorer,
      address: asset.vault,
    },
    {
      name: `GravToken · ${asset.wrapped}`,
      role: `${site.name} representation of ${asset.symbol}`,
      chain: chains.robinhood.name,
      explorer: chains.robinhood.explorer,
      address: asset.token,
    },
  ]),
  {
    name: "Swap router (Uniswap V2 interface)",
    role: "On-chain routing for gToken swaps",
    chain: chains.robinhood.name,
    explorer: chains.robinhood.explorer,
    address: SWAP_ROUTER,
  },
];

export const registryTotal = contractRegistry.length;
export const registryConfigured = contractRegistry.filter((c) => c.address).length;

/** The messenger, empty until one is deployed. */
export const MESSENGER_SOURCE = process.env.NEXT_PUBLIC_GRAV_MESSENGER_SOURCE ?? "";
export const MESSENGER_DESTINATION =
  process.env.NEXT_PUBLIC_GRAV_MESSENGER_DESTINATION ?? "";
export const BRIDGE_SOURCE = process.env.NEXT_PUBLIC_GRAV_BRIDGE_SOURCE ?? "";
export const BRIDGE_DESTINATION = process.env.NEXT_PUBLIC_GRAV_BRIDGE_DESTINATION ?? "";
export const BRIDGE_PROVIDER = process.env.NEXT_PUBLIC_BRIDGE_PROVIDER ?? "";

/** What the bridge is still waiting for, named exactly as the env vars are. */
export const bridgeMissing = [
  !BRIDGE_PROVIDER && "NEXT_PUBLIC_BRIDGE_PROVIDER (native | layerzero)",
  !BRIDGE_SOURCE && "NEXT_PUBLIC_GRAV_BRIDGE_SOURCE",
  !BRIDGE_DESTINATION && "NEXT_PUBLIC_GRAV_BRIDGE_DESTINATION",
].filter(Boolean) as string[];

export const bridgeConfigured = bridgeMissing.length === 0;
