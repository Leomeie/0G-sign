"use client";

import { useState, useRef, useCallback } from "react";
import {
  hasWalletProvider,
  uploadFromBrowser,
} from "@/lib/og-upload-browser";

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

export default function DocumentUpload({ onUploaded }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE) {
        setError("File exceeds 10MB limit");
        return;
      }
      setUploading(true);
      setProgress("Preparing upload...");
      setError("");

      try {
        if (hasWalletProvider()) {
          // Client-side: upload directly to 0G with user's wallet
          setProgress("Connecting wallet...");
          const result = await uploadFromBrowser(file, true, setProgress);
          setProgress("");
          onUploaded({
            ...result,
            fileName: file.name,
            fileType: file.type,
            storage: "0g",
          });
        } else {
          // Fallback: server-side API (localStorage mode)
          setProgress("Uploading (local fallback)...");
          const formData = new FormData();
          formData.append("file", file);
          formData.append("encrypt", "true");
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Upload failed");
          setProgress("");
          onUploaded(json);
        }
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
        aria-label="Upload document — drop a file here or click to browse"
        className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          dragOver
            ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.25)]"
            : "border-zinc-700 hover:border-zinc-600"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
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
            <svg aria-hidden="true" className="w-6 h-6 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-zinc-400">
              {progress || "Uploading..."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-lg font-medium text-zinc-300">
              Drop your document here
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              PDF, PNG, JPG, DOCX — max 10MB — AES-256 encrypted
            </p>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
