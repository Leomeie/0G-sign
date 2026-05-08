"use client";

import { MemData, Indexer } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import { generateAes256Key } from "./encryption";
import { supportedChainIds, getNetworkForChain } from "./wagmi";

export interface BrowserUploadResult {
  rootHash: string;
  txHash: string;
  encryptionKey: string | null;
}

function getEthereum(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum ?? null;
}

export function hasWalletProvider(): boolean {
  return !!getEthereum();
}

export async function uploadFromBrowser(
  file: File,
  encrypt: boolean = true,
  onProgress?: (msg: string) => void,
): Promise<BrowserUploadResult> {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("No wallet provider found");

  onProgress?.("Reading file...");
  const buffer = new Uint8Array(await file.arrayBuffer());

  onProgress?.("Building Merkle tree...");
  const memData = new MemData(buffer);
  await memData.merkleTree();

  const encryptionKey = encrypt ? generateAes256Key() : null;
  const uploadOpts = encryptionKey
    ? { encryption: { type: "aes256" as const, key: encryptionKey } }
    : undefined;

  onProgress?.("Requesting wallet signature...");
  // Explicitly request accounts first to ensure wallet is authorized
  await ethereum.request({ method: "eth_requestAccounts" });

  const browserProvider = new ethers.BrowserProvider(ethereum);
  const signer = await browserProvider.getSigner();
  const chainId = Number((await browserProvider.getNetwork()).chainId);

  if (!supportedChainIds.includes(chainId)) {
    throw new Error(
      `Please switch your wallet to 0G Mainnet or 0G Testnet. Current chain: ${chainId}`,
    );
  }

  const net = getNetworkForChain(chainId);

  // Ensure signer has a provider for contract call() support
  // Some wallet environments don't properly attach the provider
  if (!signer.provider) {
    (signer as any).provider = browserProvider;
  }

  onProgress?.("Uploading to 0G Storage...");
  const indexer = new Indexer(net.indexerUrl);
  const [result, err] = await indexer.upload(
    memData as any,
    net.rpcUrl,
    signer as any,
    uploadOpts as any,
  );

  if (err) throw err;

  const rootHash =
    "rootHash" in result ? result.rootHash : result.rootHashes[0];
  const txHash =
    "txHash" in result ? result.txHash : result.txHashes[0];

  return {
    rootHash,
    txHash,
    encryptionKey: encryptionKey
      ? "0x" + Buffer.from(encryptionKey).toString("hex")
      : null,
  };
}
