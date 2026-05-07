"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { nanoid } from "nanoid";
import DocumentUpload from "@/components/document-upload";
import SignerInput from "@/components/signer-input";
import { saveDoc } from "@/lib/store";
import type { DocRecord, UploadResult } from "@/types";

export default function CreatePage() {
  const { address } = useAccount();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [signers, setSigners] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [creating, setCreating] = useState(false);

  const titleError = titleTouched && !title.trim() ? "Title is required" : "";

  if (!address) {
    return (
      <div className="py-16 text-center text-zinc-400 animate-fade-in">
        Connect your wallet to create a document.
      </div>
    );
  }

  const canCreate =
    title.trim() && uploadResult && signers.length > 0 && !creating;

  const handleCreate = () => {
    if (!canCreate || !uploadResult) return;
    setCreating(true);

    const doc: DocRecord = {
      id: nanoid(12),
      title: title.trim(),
      description: description.trim(),
      rootHash: uploadResult.rootHash,
      creator: address,
      signers,
      signatures: [],
      status: "pending",
      createdAt: Date.now(),
      encryptionKey: uploadResult.encryptionKey,
      storage: uploadResult.storage,
      fileName: uploadResult.fileName,
      fileType: uploadResult.fileType,
    };

    if (uploadResult.storage === "local" && uploadResult.fileData) {
      try {
        const existing = localStorage.getItem("og-sign-files");
        const files: Record<string, string> = existing
          ? JSON.parse(existing)
          : {};
        files[doc.id] = uploadResult.fileData;
        localStorage.setItem("og-sign-files", JSON.stringify(files));
      } catch {
        /* localStorage quota exceeded — non-fatal */
      }
    }

    if (uploadResult.encryptionKey) {
      try {
        const existing = localStorage.getItem("og-sign-keys");
        const keys: Record<string, string> = existing
          ? JSON.parse(existing)
          : {};
        keys[doc.rootHash] = uploadResult.encryptionKey;
        localStorage.setItem("og-sign-keys", JSON.stringify(keys));
      } catch {
        /* localStorage quota exceeded — non-fatal */
      }
    }

    saveDoc(doc);
    router.push(`/documents/${doc.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <h1 className="text-2xl font-bold text-zinc-100">Create Document</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Upload a document, add signers, and create a signing request.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            placeholder="e.g. Employment Agreement"
            aria-invalid={!!titleError}
            className={`glass-input w-full px-3 py-2 text-sm ${
              titleError ? "border-red-500/50 focus:border-red-500" : ""
            }`}
          />
          {titleError && (
            <p className="mt-1 text-xs text-red-400">{titleError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the document..."
            rows={2}
            className="glass-input w-full px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Document File
          </label>
          <DocumentUpload onUploaded={(result) => setUploadResult(result)} />
          {uploadResult && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-green-400">
                Uploaded: {uploadResult.fileName}
              </p>
              <p className="text-xs text-zinc-500">
                Storage:{" "}
                {uploadResult.storage === "0g"
                  ? "0G Storage (encrypted)"
                  : "Local fallback"}
              </p>
              {uploadResult.encryptionKey && (
                <p className="text-xs text-zinc-500">
                  Encryption: AES-256 — key saved
                </p>
              )}
            </div>
          )}
        </div>

        <SignerInput signers={signers} onChange={setSigners} />

        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className="btn-gradient w-full px-6 py-3 text-sm"
        >
          {creating ? "Creating..." : "Create Signing Request"}
        </button>
      </div>
    </div>
  );
}
