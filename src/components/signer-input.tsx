"use client";

import { useState } from "react";
import { isAddress } from "viem";

interface Props {
  signers: string[];
  onChange: (signers: string[]) => void;
}

export default function SignerInput({ signers, onChange }: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

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
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        Signers (wallet addresses)
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
          placeholder="0x..."
          className="glass-input flex-1 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="btn-glass px-4 py-2 text-sm"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {signers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {signers.map((addr) => (
            <span
              key={addr}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 animate-fade-in"
            >
              {addr.slice(0, 6)}...{addr.slice(-4)}
              <button
                type="button"
                onClick={() => remove(addr)}
                aria-label={`Remove signer ${addr.slice(0, 6)}...${addr.slice(-4)}`}
                className="ml-1 text-zinc-500 hover:text-red-400"
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
