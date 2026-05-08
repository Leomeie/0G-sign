import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "@wagmi/core";

// 0G Mainnet
export const ogMainnet = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "A0GI", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
  blockExplorers: {
    default: { name: "0G Explorer", url: "https://chainscan.0g.ai" },
  },
});

// 0G Testnet
export const ogTestnet = defineChain({
  id: 16602,
  name: "0G Testnet",
  nativeCurrency: { name: "0G", symbol: "A0GI", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc-testnet.0g.ai"] } },
  blockExplorers: {
    default: { name: "0G Testnet Explorer", url: "https://chainscan-testnet.0g.ai" },
  },
});

// Default chain: read from env, fallback to mainnet
const defaultChainId = Number(process.env.NEXT_PUBLIC_OG_CHAIN_ID) || 16661;
export const ogChain = defaultChainId === 16601 ? ogTestnet : ogMainnet;

// All supported chains
export const supportedChains = [ogMainnet, ogTestnet] as const;
export const supportedChainIds: number[] = supportedChains.map((c) => c.id);

// Per-chain network config for 0G Storage
export const networkConfig: Record<
  number,
  { rpcUrl: string; indexerUrl: string; explorerUrl: string }
> = {
  [ogMainnet.id]: {
    rpcUrl: "https://evmrpc.0g.ai",
    indexerUrl: "https://indexer-storage-turbo.0g.ai",
    explorerUrl: "https://chainscan.0g.ai",
  },
  [ogTestnet.id]: {
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    indexerUrl: "https://indexer-storage-testnet-turbo.0g.ai",
    explorerUrl: "https://chainscan-testnet.0g.ai",
  },
};

/** Returns the network config for the given chain ID, or mainnet as fallback. */
export function getNetworkForChain(chainId: number) {
  return networkConfig[chainId] ?? networkConfig[ogMainnet.id];
}

export const config = createConfig({
  chains: [ogMainnet, ogTestnet],
  connectors: [injected()],
  transports: {
    [ogMainnet.id]: http(),
    [ogTestnet.id]: http(),
  },
});
