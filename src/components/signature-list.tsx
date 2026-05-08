"use client";

import { memo } from "react";
import type { DocRecord } from "@/types";

interface Props {
  doc: DocRecord;
  currentAddress?: string;
}

export default memo(function SignatureList({ doc, currentAddress }: Props) {
  return (
    <div className="space-y-2">
      {doc.signers.map((addr) => {
        const sig = doc.signatures.find(
          (s) => s.address.toLowerCase() === addr.toLowerCase(),
        );
        const isMe = currentAddress?.toLowerCase() === addr.toLowerCase();
        return (
          <div
            key={addr}
            className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 transition-colors ${
              sig
                ? "border-green-500/20 bg-green-500/8"
                : "border-white/[0.04] bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  sig ? "bg-green-400" : "bg-zinc-600"
                }`}
              />
              <span className="font-mono text-xs text-zinc-400 truncate">
                {addr.slice(0, 10)}...{addr.slice(-6)}
                {isMe && (
                  <span className="ml-1.5 text-zinc-500">(you)</span>
                )}
              </span>
            </div>
            {sig ? (
              <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-medium shrink-0 ml-2">
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
                {new Date(sig.timestamp * 1000).toLocaleDateString()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-zinc-500 text-xs shrink-0 ml-2">
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
                Pending
              </span>
            )}
          </div>
        );
      })}
      {doc.signers.length === 0 && (
        <p className="text-sm text-zinc-500">No signers.</p>
      )}
    </div>
  );
});
