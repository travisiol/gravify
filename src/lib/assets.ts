export type SupportedAsset = {
  /** Canonical Ethereum symbol. */
  symbol: string;
  /** Symbol of the representation minted on Robinhood Chain. */
  wrapped: string;
  name: string;
  icon: string;
  /** Canonical Ethereum contract. */
  source: `0x${string}`;
  /** Vault holding the collateral. Empty until deployed. */
  vault: string;
  /** gToken contract on Robinhood Chain. Empty until deployed. */
  token: string;
};

export const supportedAssets: SupportedAsset[] = [
  {
    symbol: "USDC",
    wrapped: "gUSDC",
    name: "USD Coin",
    icon: "/assets/usdc.svg",
    source: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_USDC ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_USDC ?? "",
  },
  {
    symbol: "USDT",
    wrapped: "gUSDT",
    name: "Tether USD",
    icon: "/assets/usdt.svg",
    source: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_USDT ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_USDT ?? "",
  },
  {
    symbol: "WBTC",
    wrapped: "gWBTC",
    name: "Wrapped Bitcoin",
    icon: "/assets/wbtc.svg",
    source: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_WBTC ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_WBTC ?? "",
  },
  {
    symbol: "PAXG",
    wrapped: "gPAXG",
    name: "Pax Gold",
    icon: "/assets/paxg.svg",
    source: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_PAXG ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_PAXG ?? "",
  },
  {
    symbol: "XAUT",
    wrapped: "gXAUT",
    name: "Tether Gold",
    icon: "/assets/xaut.svg",
    source: "0x68749665FF8D2d112Fa859AA293F07A622782F38",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_XAUT ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_XAUT ?? "",
  },
];

export const deployedAssetCount = supportedAssets.filter(
  (a) => a.vault && a.token,
).length;

/** Contracts the interface reads, in the order the registry lists them. */
export const contractRegistry = [
  { name: "GravRelayMessenger", address: "" },
  { name: "GravRelayMessenger", address: "" },
  { name: "GravBridge", address: "" },
  { name: "GravBridge", address: "" },
  { name: "GravVault · USDC", address: "" },
  { name: "GravToken · gUSDC", address: "" },
];

/** Registry slots in total: messenger + bridge per chain, then vault + token per asset. */
export const registryTotal = 4 + supportedAssets.length * 2 + 1;
export const registryConfigured = 1;
