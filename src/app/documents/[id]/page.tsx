"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { getDoc, saveDoc, deleteDoc } from "@/lib/store";
import ShareButton from "@/components/share-button";
import ConfirmDialog from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import SignButton from "@/components/sign-button";
import SignatureList from "@/components/signature-list";
import { useI18n } from "@/lib/i18n";
import type { DocRecord, SignatureProof } from "@/types";

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
  const display = truncate ? value.slice(0, truncate) + "..." : value;

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
          <svg
            aria-hidden="true"
            className="w-3 h-3 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </span>
  );
}

function EncryptionKeyCard({
  encryptionKey,
  t,
}: {
  encryptionKey: string;
  t: (key: any) => string;
}) {
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
    <div className="warning-card mt-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
          />
        </svg>
        <p className="text-xs font-semibold text-amber-400">
          {t("encryptionKey")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs font-mono text-amber-300/70 break-all flex-1">
          {visible ? encryptionKey : masked}
        </p>
        <button
          onClick={() => setVisible(!visible)}
          aria-label={visible ? t("hide") : t("show")}
          className="shrink-0 text-xs text-amber-400 underline hover:text-amber-200"
        >
          {visible ? t("hide") : t("show")}
        </button>
        <button
          onClick={handleCopy}
          aria-live="polite"
          aria-label={t("copy")}
          className="shrink-0 rounded-lg border border-amber-500/30 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          {copied ? t("copiedLabel") : t("copy")}
        </button>
      </div>
      <p className="text-xs text-amber-400/50 mt-1.5">{t("keyWarning")}</p>
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
          fileName: d.fileName,
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
        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-4">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-zinc-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <p className="text-zinc-400 mb-4">{t("docNotFound")}</p>
        <Link href="/documents" className="btn-glass px-6 py-2 text-sm">
          {t("backToDocs")}
        </Link>
      </div>
    );
  }

  const isCreator =
    address && doc.creator.toLowerCase() === address.toLowerCase();

  const statusConfig: Record<
    string,
    { bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    completed: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/20",
      icon: (
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    partial: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      icon: (
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    pending: {
      bg: "bg-zinc-500/10",
      text: "text-zinc-400",
      border: "border-zinc-500/20",
      icon: (
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const sc = statusConfig[doc.status] || statusConfig.pending;

  return (
    <>
      <div
        suppressHydrationWarning
        className="mx-auto max-w-2xl animate-fade-in-up"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">{doc.title}</h1>
              {doc.description && (
                <p className="mt-1 text-sm text-zinc-400">
                  {doc.description}
                </p>
              )}
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium border ${sc.bg} ${sc.text} ${sc.border}`}
          >
            {sc.icon}
            {doc.status}
          </span>
        </div>

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t("created")} {new Date(doc.createdAt).toLocaleDateString()}
          </span>
          <CopyableValue
            label={t("root")}
            value={doc.rootHash}
            truncate={16}
          />
          <span className="inline-flex items-center gap-1.5">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            {t("storageLabel")}{" "}
            {doc.storage === "0g" ? "0G Storage" : t("local")}
            {doc.encryptionKey ? " (AES-256)" : ""}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          <ShareButton url={shareUrl} />
          {fileUrl && (
            <button
              onClick={handleDownload}
              className="btn-glass inline-flex items-center gap-1.5 px-4 py-2 text-sm"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              {t("download")}
            </button>
          )}
          <button
            onClick={handleExportProof}
            className="btn-glass inline-flex items-center gap-1.5 px-4 py-2 text-sm"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            {t("exportProof")}
          </button>
          {doc.storage === "0g" && !fileUrl && !downloading && (
            <button
              onClick={() => loadFrom0G(doc)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              {t("loadFrom0g")}
            </button>
          )}
          {downloading && (
            <span className="flex items-center gap-2 text-sm text-zinc-400">
              <svg
                aria-hidden="true"
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t("loadingFrom0g")}
            </span>
          )}
          {isCreator && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              aria-busy={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              {deleting ? t("deleting") : t("delete")}
            </button>
          )}
        </div>

        {/* File preview */}
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
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Encryption key */}
        {doc.encryptionKey && isCreator && (
          <EncryptionKeyCard encryptionKey={doc.encryptionKey} t={t} />
        )}

        {/* Signatures */}
        <div className="mt-6 glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-4 h-4 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <h2 className="text-sm font-semibold text-zinc-200">
              Signatures ({doc.signatures.length}/{doc.signers.length})
            </h2>
          </div>
          <SignatureList doc={doc} currentAddress={address} />
        </div>

        {/* Sign button */}
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
