export type SupportedAsset = {
  /** Canonical Ethereum symbol. */
  symbol: string;
  /** Symbol of the representation minted on Robinhood Chain. */
  wrapped: string;
  name: string;
  icon: string;
  /** Decimals of the canonical source token. */
  decimals: number;
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
    decimals: 6,
    source: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_USDC ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_USDC ?? "",
  },
  {
    symbol: "USDT",
    wrapped: "gUSDT",
    name: "Tether USD",
    icon: "/assets/usdt.svg",
    decimals: 6,
    source: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_USDT ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_USDT ?? "",
  },
  {
    symbol: "WBTC",
    wrapped: "gWBTC",
    name: "Wrapped Bitcoin",
    icon: "/assets/wbtc.svg",
    decimals: 8,
    source: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_WBTC ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_WBTC ?? "",
  },
  {
    symbol: "PAXG",
    wrapped: "gPAXG",
    name: "Pax Gold",
    icon: "/assets/paxg.svg",
    decimals: 18,
    source: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_PAXG ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_PAXG ?? "",
  },
  {
    symbol: "XAUT",
    wrapped: "gXAUT",
    name: "Tether Gold",
    icon: "/assets/xaut.svg",
    decimals: 6,
    source: "0x68749665FF8D2d112Fa859AA293F07A622782F38",
    vault: process.env.NEXT_PUBLIC_GRAV_VAULT_XAUT ?? "",
    token: process.env.NEXT_PUBLIC_GRAV_TOKEN_XAUT ?? "",
  },
];

export const deployedAssetCount = supportedAssets.filter(
  (a) => a.vault && a.token,
).length;

export function assetByWrapped(wrapped: string) {
  return supportedAssets.find(
    (a) => a.wrapped.toLowerCase() === wrapped.toLowerCase(),
  );
}

export function assetBySymbol(symbol: string) {
  return supportedAssets.find(
    (a) => a.symbol.toLowerCase() === symbol.toLowerCase(),
  );
}
