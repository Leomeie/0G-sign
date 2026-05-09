import { ZgFile, Indexer } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import { generateAes256Key, hexToBytes } from "./encryption";
import fs from "fs";
import path from "path";
import os from "os";

const INDEXER_URL =
  process.env.OG_INDEXER_URL ||
  "https://indexer-storage-testnet-turbo.0g.ai";
const RPC_URL =
  process.env.OG_RPC_URL ||
  "https://evmrpc-testnet.0g.ai";

// Singletons — reused across requests in the same serverless instance
let indexer: Indexer | null = null;
let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | ethers.HDNodeWallet | null = null;

function getIndexer(): Indexer {
  if (!indexer) indexer = new Indexer(INDEXER_URL);
  return indexer;
}

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) provider = new ethers.JsonRpcProvider(RPC_URL);
  return provider;
}

function getSigner(): ethers.Wallet | ethers.HDNodeWallet {
  if (!signer) {
    const key = process.env.OG_PRIVATE_KEY;
    if (key) {
      signer = new ethers.Wallet(key, getProvider());
    } else {
      // Auto-generate a dedicated server wallet for uploads
      const wallet = ethers.Wallet.createRandom();
      signer = wallet.connect(getProvider());
      console.log("=== 0G Upload Wallet (auto-generated) ===");
      console.log("Address:", signer.address);
      console.log("Private key:", wallet.privateKey);
      console.log("Fund at: https://faucet.0g.ai");
      console.log("Or set OG_PRIVATE_KEY env var for persistence");
      console.log("==========================================");
    }
  }
  return signer;
}

export interface UploadResult {
  rootHash: string;
  txHash: string;
  encryptionKey: string | null;
}

export async function uploadTo0G(
  filePath: string,
  encrypt: boolean = true,
  clientKeyHex?: string | null
): Promise<UploadResult> {
  const s = getSigner();
  const idx = getIndexer();
  const zgFile = await ZgFile.fromFilePath(filePath);

  try {
    await zgFile.merkleTree();

    let encryptionKey: Uint8Array | null = null;
    let returnKeyHex: string | null = null;

    if (clientKeyHex) {
      const clean = clientKeyHex.startsWith("0x")
        ? clientKeyHex.slice(2)
        : clientKeyHex;
      encryptionKey = new Uint8Array(
        clean.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
      );
      returnKeyHex = clientKeyHex;
    } else if (encrypt) {
      encryptionKey = generateAes256Key();
      returnKeyHex = "0x" + Buffer.from(encryptionKey).toString("hex");
    }

    const uploadOpts = encryptionKey
      ? { encryption: { type: "aes256" as const, key: encryptionKey } }
      : undefined;

    const [result, err] = await idx.upload(
      zgFile as any,
      RPC_URL,
      s as any,
      uploadOpts as any
    );

    if (err) throw err;

    if ("rootHash" in result) {
      return {
        rootHash: result.rootHash,
        txHash: result.txHash,
        encryptionKey: returnKeyHex,
      };
    }
    return {
      rootHash: result.rootHashes[0],
      txHash: result.txHashes[0],
      encryptionKey: returnKeyHex,
    };
  } finally {
    await zgFile.close();
  }
}

export async function downloadFrom0G(
  rootHash: string,
  encryptionKeyHex?: string
): Promise<{ filePath: string; mime: string }> {
  const idx = getIndexer();
  const tmpDir = os.tmpdir();
  const outputPath = path.join(tmpDir, `ogsign-${rootHash.slice(2, 10)}`);

  const downloadOpts = encryptionKeyHex
    ? { decryption: { symmetricKey: hexToBytes(encryptionKeyHex) } }
    : undefined;

  const [blob, err] = await idx.downloadToBlob(
    rootHash,
    downloadOpts as any
  );

  if (err) throw err;
  if (!blob) throw new Error("Empty blob from 0G");

  const buffer = await blob.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  const mime = blob.type || "application/octet-stream";
  return { filePath: outputPath, mime };
}

export function isOgConfigured(): boolean {
  // Always return true — we auto-generate a wallet if OG_PRIVATE_KEY is not set
  return true;
}
