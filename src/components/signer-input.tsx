"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useI18n } from "@/lib/i18n";

interface Props {
  signers: string[];
  onChange: (signers: string[]) => void;
}

export default function SignerInput({ signers, onChange }: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const { t } = useI18n();

  const add = () => {
    const addr = input.trim();
    if (!addr) return;
    if (!isAddress(addr)) {
      setError("Invalid address");
      return;
    }
    if (signers.some((s) => s.toLowerCase() === addr.toLowerCase())) {
      setError("Address already added");
      return;
    }
    setError("");
    onChange([...signers, addr]);
    setInput("");
  };

  const remove = (addr: string) => {
    onChange(signers.filter((s) => s.toLowerCase() !== addr.toLowerCase()));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
        {t("signers")}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={t("signerPlaceholder")}
          className="glass-input flex-1 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="btn-glass px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("add")}
        </button>
      </div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
      {signers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {signers.map((addr) => (
            <span
              key={addr}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs text-zinc-300 animate-fade-in group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
              {addr.slice(0, 6)}...{addr.slice(-4)}
              <button
                type="button"
                onClick={() => remove(addr)}
                aria-label={`Remove signer ${addr.slice(0, 6)}...${addr.slice(-4)}`}
                className="ml-0.5 text-zinc-600 hover:text-red-400 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
