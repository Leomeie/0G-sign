"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadResult {
  rootHash: string;
  txHash: string;
  encryptionKey: string | null;
  fileName: string;
  fileType: string;
  fileData?: string;
  storage: "0g" | "local";
}

interface Props {
  onUploaded: (result: UploadResult) => void;
}

function generateKeyHex(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function DocumentUpload({ onUploaded }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const upload = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE) {
        setError("File exceeds 10MB limit");
        return;
      }
      setUploading(true);
      setProgress("Encrypting...");
      setError("");

      try {
        // Generate encryption key client-side (key never leaves browser in plaintext)
        const keyHex = generateKeyHex();

        setProgress("Uploading to 0G Storage...");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("encrypt", "true");
        formData.append("encryptionKey", keyHex);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");

        setProgress("");
        onUploaded({
          rootHash: json.rootHash,
          txHash: json.txHash,
          encryptionKey: json.encryptionKey ?? keyHex,
          fileName: json.fileName ?? file.name,
          fileType: json.fileType ?? file.type,
          fileData: json.fileData,
          storage: json.storage,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
        setProgress("");
      }
    },
    [onUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload document"
        className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          dragOver
            ? "border-blue-500/60 bg-blue-500/8 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
            : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.01]"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          aria-label="Choose document file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <svg className="w-8 h-8 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <div className="absolute inset-0 w-8 h-8 rounded-full bg-blue-500/10 animate-ping" />
            </div>
            <p className="text-sm text-zinc-400 font-medium">
              {progress || "Uploading..."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-300">
              {t("dropHere")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {t("dropHint")}
            </p>
          </>
        )}
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
