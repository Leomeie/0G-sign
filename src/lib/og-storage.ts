import { ZgFile, Indexer } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import { generateAes256Key, hexToBytes } from "./encryption";
import fs from "fs";
import path from "path";
import os from "os";

const INDEXER_URL =
  process.env.OG_INDEXER_URL ||
  "https://indexer-storage-turbo.0g.ai";
const RPC_URL =
  process.env.OG_RPC_URL ||
  "https://evmrpc.0g.ai";

let indexer: Indexer | null = null;

function getIndexer(): Indexer {
  if (!indexer) indexer = new Indexer(INDEXER_URL);
  return indexer;
}

function getSigner(): ethers.Wallet {
  const key = process.env.OG_PRIVATE_KEY;
  if (!key) throw new Error("OG_PRIVATE_KEY not set in .env.local");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(key, provider);
}

export interface UploadResult {
  rootHash: string;
  txHash: string;
  encryptionKey: string | null;
}

export async function uploadTo0G(
  filePath: string,
  encrypt: boolean = true
): Promise<UploadResult> {
  const signer = getSigner();
  const idx = getIndexer();
  const zgFile = await ZgFile.fromFilePath(filePath);

  try {
    // merkleTree() must be called before upload — populates internal state
    await zgFile.merkleTree();

    const encryptionKey = encrypt ? generateAes256Key() : null;
    const uploadOpts = encryptionKey
      ? { encryption: { type: "aes256" as const, key: encryptionKey } }
      : undefined;

    const [result, err] = await idx.upload(
      zgFile as any,
      RPC_URL,
      signer as any,
      uploadOpts as any
    );

    if (err) {
      console.error("[0g-upload] error:", err.message || err);
      throw err;
    }

    if ("rootHash" in result) {
      return {
        rootHash: result.rootHash,
        txHash: result.txHash,
        encryptionKey: encryptionKey
          ? "0x" + Buffer.from(encryptionKey).toString("hex")
          : null,
      };
    }
    return {
      rootHash: result.rootHashes[0],
      txHash: result.txHashes[0],
      encryptionKey: encryptionKey
        ? "0x" + Buffer.from(encryptionKey).toString("hex")
        : null,
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
  return !!process.env.OG_PRIVATE_KEY;
}