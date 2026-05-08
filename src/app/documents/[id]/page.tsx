"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";
import { getDoc, saveDoc, deleteDoc } from "@/lib/store";
import ShareButton from "@/components/share-button";
import ConfirmDialog from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import type { DocRecord, SignatureProof } from "@/types";

const SignButton = dynamic(() => import("@/components/sign-button"), {
  ssr: false,
  loading: () => (
    <div className="btn-gradient w-full px-6 py-3 text-sm text-center opacity-50">
      Loading...
    </div>
  ),
});

const SignatureList = dynamic(() => import("@/components/signature-list"), {
  ssr: false,
});

function CopyableValue({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: number;
}) {
  const [copied, setCopied] = useState(false);
  const display = truncate
    ? value.slice(0, truncate) + "..."
    : value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1">
      {label}: {display}
      <button
        onClick={handleCopy}
        aria-live="polite"
        aria-label={`Copy ${label}`}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {copied ? (
          <svg aria-hidden="true" className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </span>
  );
}

function EncryptionKeyCard({ encryptionKey, t }: { encryptionKey: string; t: (key: any) => string }) {
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
        {t("encryptionKey")}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs font-mono text-yellow-300/80 break-all flex-1">
          {visible ? encryptionKey : masked}
        </p>
        <button
          onClick={() => setVisible(!visible)}
          aria-label={visible ? t("hide") : t("show")}
          className="shrink-0 text-xs text-yellow-400 underline hover:text-yellow-200"
        >
          {visible ? t("hide") : t("show")}
        </button>
        <button
          onClick={handleCopy}
          aria-live="polite"
          aria-label={t("copy")}
          className="shrink-0 rounded border border-yellow-500/30 px-2 py-1 text-xs text-yellow-400 hover:bg-yellow-500/10"
        >
          {copied ? t("copiedLabel") : t("copy")}
        </button>
      </div>
      <p className="text-xs text-yellow-400/60 mt-1">
        {t("keyWarning")}
      </p>
    </div>
  );
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const router = useRouter();
  const { show: toast } = useToast();
  const { t } = useI18n();
  const [doc, setDoc] = useState<DocRecord | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const downloadingRef = useRef(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/documents/${id}`);
  }, [id]);

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

  const confirmDelete = () => {
    if (!doc) return;
    setDeleting(true);
    deleteDoc(doc.id);
    toast("Document deleted", "info");
    setTimeout(() => router.push("/documents"), 400);
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
    const proof: SignatureProof = {
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
      <div className="flex flex-col items-center py-16 text-center animate-fade-in">
        <svg aria-hidden="true" className="w-12 h-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-zinc-400">{t("docNotFound")}</p>
        <Link href="/documents" className="btn-glass mt-4 px-6 py-2 text-sm">
          {t("backToDocs")}
        </Link>
      </div>
    );
  }

  const isCreator =
    address && doc.creator.toLowerCase() === address.toLowerCase();

  const statusColors: Record<string, string> = {
    completed: "bg-green-500/15 text-green-400",
    partial: "bg-yellow-500/15 text-yellow-400",
    pending: "bg-zinc-500/15 text-zinc-400",
  };

  return (
    <>
      <div suppressHydrationWarning className="mx-auto max-w-2xl animate-fade-in-up">
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
          <span>
            {t("created")} {new Date(doc.createdAt).toLocaleDateString()}
          </span>
          <CopyableValue label={t("root")} value={doc.rootHash} truncate={16} />
          <span>
            {t("storageLabel")} {doc.storage === "0g" ? "0G Storage" : t("local")}
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
              {t("download")}
            </button>
          )}
          <button
            onClick={handleExportProof}
            className="btn-glass px-4 py-2 text-sm"
          >
            {t("exportProof")}
          </button>
          {doc.storage === "0g" && !fileUrl && !downloading && (
            <button
              onClick={() => loadFrom0G(doc)}
              className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10"
            >
              {t("loadFrom0g")}
            </button>
          )}
          {downloading && (
            <span className="flex items-center gap-2 text-sm text-zinc-400">
              <svg aria-hidden="true" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("loadingFrom0g")}
            </span>
          )}
          {isCreator && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              aria-busy={deleting}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              {deleting ? t("deleting") : t("delete")}
            </button>
          )}
        </div>

        {fileUrl && (
          <div className="mt-6 glass-card p-4">
            {doc.fileType?.startsWith("image/") ? (
              <Image
                src={fileUrl}
                alt={doc.title}
                width={800}
                height={384}
                className="max-h-96 w-full rounded object-contain"
                unoptimized
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
          <EncryptionKeyCard encryptionKey={doc.encryptionKey} t={t} />
        )}

        <div className="mt-6 glass-card p-6">
          <SignatureList doc={doc} currentAddress={address} />
        </div>

        <div className="mt-4">
          <SignButton doc={doc} onSigned={handleSigned} />
        </div>

        {!address && (
          <p className="mt-4 text-sm text-zinc-500 text-center">
            {t("connectToSign")}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={t("deleteTitle")}
        description={t("deleteDesc")}
        confirmLabel={t("deleteConfirm")}
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          confirmDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
