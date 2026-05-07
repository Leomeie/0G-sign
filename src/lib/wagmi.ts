import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "@wagmi/core";

// Chain ID and RPC are read from env so we can switch networks
// without code changes. Defaults to 0G mainnet.
const chainId = Number(process.env.NEXT_PUBLIC_OG_CHAIN_ID) || 16661;
const rpcUrl =
  process.env.NEXT_PUBLIC_OG_RPC_URL || "https://evmrpc.0g.ai";
const explorerUrl =
  process.env.NEXT_PUBLIC_OG_EXPLORER_URL || "https://chainscan.0g.ai";
const chainName =
  process.env.NEXT_PUBLIC_OG_CHAIN_NAME || "0G Mainnet";

export const ogChain = defineChain({
  id: chainId,
  name: chainName,
  nativeCurrency: { name: "0G", symbol: "A0GI", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: {
    default: { name: "0G Explorer", url: explorerUrl },
  },
});

export const config = createConfig({
  chains: [ogChain],
  connectors: [injected()],
  transports: {
    [ogChain.id]: http(),
  },
});
