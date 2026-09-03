import { createPublicClient, defineChain, http, type PublicClient } from "viem";
import { mainnet } from "viem/chains";

export const robinhood = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
  blockExplorers: {
    default: {
      name: "Robinhood Explorer",
      url: "https://explorer.mainnet.chain.robinhood.com",
    },
  },
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
  },
});

export const chains = {
  ethereum: {
    id: mainnet.id,
    name: "Ethereum",
    explorer: "https://etherscan.io",
  },
  robinhood: {
    id: robinhood.id,
    name: robinhood.name,
    explorer: robinhood.blockExplorers.default.url,
  },
} as const;

export const ethClient: PublicClient = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum-rpc.publicnode.com"),
});

export const robinhoodClient: PublicClient = createPublicClient({
  chain: robinhood,
  transport: http(robinhood.rpcUrls.default.http[0]),
});

export function tokenExplorerUrl(address: string) {
  return `${chains.robinhood.explorer}/token/${address}`;
}

export function addressExplorerUrl(address: string) {
  return `${chains.robinhood.explorer}/address/${address}`;
}

/** Uniswap-V2 style router used to quote the swap leg and enumerate pools. */
export const SWAP_ROUTER = (process.env.NEXT_PUBLIC_SWAP_ROUTER ??
  "0x89e5db8b5aa49aa85ac63f691524311aeb649eba") as `0x${string}`;

/** Tokens the pool scanner can price against. */
export const CANONICAL_TOKENS = [
  {
    address: "0x0bd7d308f8e1639fab988df18a8011f41eacad73" as `0x${string}`,
    symbol: "WETH",
    decimals: 18,
    stable: false,
  },
  {
    address: "0x5fc5360d0400a0fd4f2af552add042d716f1d168" as `0x${string}`,
    symbol: "USDG",
    decimals: 6,
    stable: true,
  },
];

/** The pool that gives WETH a price in USDG. */
export const WETH_USDG_POOL =
  "0x8803c117ccae7b5146297876c2a25df135141c4d" as `0x${string}`;
