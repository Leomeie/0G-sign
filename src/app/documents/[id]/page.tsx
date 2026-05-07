"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { getDoc, saveDoc, deleteDoc } from "@/lib/store";
import SignButton from "@/components/sign-button";
import SignatureList from "@/components/signature-list";
import ShareButton from "@/components/share-button";
import { useToast } from "@/components/toast";
import type { DocRecord } from "@/types";

function EncryptionKeyCard({ encryptionKey }: { encryptionKey: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = encryptionKey.slice(0, 6) + "..." + encryptionKey.slice(-4);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(encryptionKey);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = encryptionKey;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
      <p className="text-xs font-medium text-yellow-400 mb-1">
        Encryption Key (save this!)
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs font-mono text-yellow-300/80 break-all flex-1">
          {visible ? encryptionKey : masked}
        </p>
        <button
          onClick={() => setVisible(!visible)}
          className="shrink-0 text-xs text-yellow-400 underline hover:text-yellow-200"
        >
          {visible ? "Hide" : "Show"}
        </button>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded border border-yellow-500/30 px-2 py-1 text-xs text-yellow-400 hover:bg-yellow-500/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-yellow-400/60 mt-1">
        Required to decrypt. Lost key = unrecoverable data.
      </p>
    </div>
  );
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const router = useRouter();
  const { show: toast } = useToast();
  const [doc, setDoc] = useState<DocRecord | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const downloadingRef = useRef(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const found = getDoc(id);
    setDoc(found);
    if (!found) return;

    let loadedLocal = false;
    try {
      const raw = localStorage.getItem("og-sign-files");
      if (raw) {
        const files: Record<string, string> = JSON.parse(raw);
        const base64 = files[found.id];
        if (base64) {
          const mime =
            found.fileType ||
            (base64.startsWith("iVBOR") ? "image/png" : "application/pdf");
          setFileUrl("data:" + mime + ";base64," + base64);
          loadedLocal = true;
        }
      }
    } catch {
      setError("Cannot load file preview");
    }

    if (!loadedLocal && found.storage === "0g") {
      loadFrom0G(found);
    }
  }, [id]);

  const loadFrom0G = async (d: DocRecord) => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;
    setDownloading(true);
    try {
      let key: string | undefined;
      try {
        const raw = localStorage.getItem("og-sign-keys");
        if (raw) {
          const keys: Record<string, string> = JSON.parse(raw);
          key = keys[d.rootHash];
        }
      } catch {
        /* ignore */
      }

      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rootHash: d.rootHash,
          encryptionKey: key || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Download from 0G failed");
      }

      const blob = await res.blob();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setFileUrl(url);
    } catch (e) {
      console.error("[detail] 0G download error:", e);
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      downloadingRef.current = false;
      setDownloading(false);
    }
  };

  const handleSigned = useCallback(
    (signature: `0x${string}`, timestamp: number) => {
      if (!doc || !address) return;
      const updated: DocRecord = {
        ...doc,
        signatures: [
          ...doc.signatures.filter(
            (s) => s.address.toLowerCase() !== address.toLowerCase(),
          ),
          { address, signature, timestamp },
        ],
      };
      updated.status =
        updated.signatures.length >= updated.signers.length
          ? "completed"
          : "partial";
      saveDoc(updated);
      setDoc(updated);
      toast("Document signed successfully", "success");
    },
    [doc, address, toast],
  );

  const handleDelete = () => {
    if (
      !doc ||
      !window.confirm(
        "Delete this document? The encryption key will be lost permanently.",
      )
    )
      return;
    setDeleting(true);
    deleteDoc(doc.id);
    toast("Document deleted", "info");
    router.push("/documents");
  };

  const handleDownload = () => {
    if (!fileUrl || !doc) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = doc.fileName || doc.title.replace(/[^a-zA-Z0-9]/g, "_");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast("Download started", "success");
  };

  const handleExportProof = () => {
    if (!doc) return;
    const proof = {
      title: doc.title,
      rootHash: doc.rootHash,
      creator: doc.creator,
      signers: doc.signers,
      signatures: doc.signers.map((addr) => {
        const sig = doc.signatures.find(
          (entry) => entry.address.toLowerCase() === addr.toLowerCase(),
        );
        return {
          address: addr,
          signature: sig?.signature || null,
          timestamp: sig?.timestamp || null,
        };
      }),
      storage: doc.storage,
      createdAt: doc.createdAt,
      status: doc.status,
    };
    const blob = new Blob([JSON.stringify(proof, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}-proof.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Proof exported", "success");
  };

  if (!doc) {
    return (
      <div className="py-16 text-center text-zinc-400 animate-fade-in">
        Document not found.
      </div>
    );
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/documents/${doc.id}`
      : "";

  const isCreator =
    address && doc.creator.toLowerCase() === address.toLowerCase();

  const statusColors: Record<string, string> = {
    completed: "bg-green-500/15 text-green-400",
    partial: "bg-yellow-500/15 text-yellow-400",
    pending: "bg-zinc-500/15 text-zinc-400",
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{doc.title}</h1>
          {doc.description && (
            <p className="mt-1 text-sm text-zinc-400">{doc.description}</p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[doc.status]}`}
        >
          {doc.status}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>Created {new Date(doc.createdAt).toLocaleDateString()}</span>
        <span>Root: {doc.rootHash.slice(0, 16)}...</span>
        <span>
          Storage: {doc.storage === "0g" ? "0G Storage" : "Local"}
          {doc.encryptionKey ? " (AES-256)" : ""}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ShareButton url={shareUrl} />
        {fileUrl && (
          <button
            onClick={handleDownload}
            className="btn-glass px-4 py-2 text-sm"
          >
            Download
          </button>
        )}
        <button
          onClick={handleExportProof}
          className="btn-glass px-4 py-2 text-sm"
        >
          Export Proof
        </button>
        {doc.storage === "0g" && !fileUrl && !downloading && (
          <button
            onClick={() => loadFrom0G(doc)}
            className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10"
          >
            Load from 0G
          </button>
        )}
        {downloading && (
          <span className="text-sm text-zinc-400 animate-pulse">
            Loading from 0G...
          </span>
        )}
        {isCreator && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {fileUrl && (
        <div className="mt-6 glass-card p-4">
          {doc.fileType?.startsWith("image/") ? (
            <img
              src={fileUrl}
              alt={doc.title}
              className="max-h-96 w-full rounded object-contain"
            />
          ) : (
            <iframe
              sandbox=""
              src={fileUrl + "#toolbar=0"}
              className="h-96 w-full rounded"
              title={doc.title}
            />
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {doc.encryptionKey && isCreator && (
        <EncryptionKeyCard encryptionKey={doc.encryptionKey} />
      )}

      <div className="mt-6 glass-card p-6">
        <SignatureList doc={doc} currentAddress={address} />
      </div>

      <div className="mt-4">
        <SignButton doc={doc} onSigned={handleSigned} />
      </div>

      {!address && (
        <p className="mt-4 text-sm text-zinc-500">
          Connect your wallet to sign.
        </p>
      )}
    </div>
  );
}
