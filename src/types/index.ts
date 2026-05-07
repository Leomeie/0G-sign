export interface SignatureEntry {
  address: string;
  signature: `0x${string}`;
  timestamp: number;
}

export type DocStatus = "pending" | "partial" | "completed";

export interface DocRecord {
  id: string;
  title: string;
  description: string;
  rootHash: string;
  creator: string;
  signers: string[];
  signatures: SignatureEntry[];
  status: DocStatus;
  createdAt: number;
  encryptionKey: string | null;
  storage: "0g" | "local";
  fileName: string;
  fileType: string;
}

export interface UploadResult {
  rootHash: string;
  txHash: string;
  encryptionKey: string | null;
  fileName: string;
  fileType: string;
  fileData?: string;
  storage: "0g" | "local";
}

export interface SignatureProof {
  title: string;
  rootHash: string;
  creator: string;
  signers: string[];
  signatures: { address: string; signature: string | null; timestamp: number | null }[];
  encryptionKey: string | null;
  storage: "0g" | "local";
  createdAt: number;
  status: DocStatus;
}