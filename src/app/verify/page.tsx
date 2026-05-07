"use client";

import { useState } from "react";
import { recoverTypedDataAddress, isAddress, isHex } from "viem";
import { getTypedDataForVerify } from "@/lib/eip712";

export default function VerifyPage() {
  const [rootHash, setRootHash] = useState("");
  const [signer, setSigner] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [signature, setSignature] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    recoveredAddr: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleVerify = async () => {
    setError("");
    setResult(null);

    if (!rootHash || !signer || !timestamp || !signature) {
      setError("All fields are required");
      return;
    }
    if (!isAddress(signer)) {
      setError("Invalid signer address");
      return;
    }
    if (!isHex(signature) || signature.length !== 132) {
      setError("Invalid signature format (0x + 130 hex chars)");
      return;
    }
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts) || ts <= 0) {
      setError("Invalid timestamp");
      return;
    }

    setChecking(true);
    try {
      const typedData = getTypedDataForVerify(rootHash, signer, ts);
      const recovered = await recoverTypedDataAddress({
        ...typedData,
        signature: signature as `0x${string}`,
      });
      const valid = recovered.toLowerCase() === signer.toLowerCase();
      setResult({ valid, recoveredAddr: recovered });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl animate-fade-in-up">
      <h1 className="text-2xl font-bold text-zinc-100">Verify Signature</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Verify an EIP-712 document signature. No wallet needed.
      </p>

      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Root Hash
          </label>
          <input
            type="text"
            value={rootHash}
            onChange={(e) => setRootHash(e.target.value)}
            placeholder="0x..."
            className="glass-input w-full px-3 py-2 text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Claimed Signer Address
          </label>
          <input
            type="text"
            value={signer}
            onChange={(e) => setSigner(e.target.value)}
            placeholder="0x..."
            className="glass-input w-full px-3 py-2 text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Timestamp (Unix seconds)
          </label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="1700000000"
            className="glass-input w-full px-3 py-2 text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Signature
          </label>
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="0x..."
            rows={3}
            className="glass-input w-full px-3 py-2 text-xs font-mono"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={checking}
          className="btn-gradient w-full px-6 py-3 text-sm"
        >
          {checking ? "Verifying..." : "Verify"}
        </button>

        {result && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium ${
              result.valid
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {result.valid
              ? `Signature is valid. Recovered address: ${result.recoveredAddr}`
              : `Signature is INVALID. Recovered address (${result.recoveredAddr}) does not match claimed signer.`}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
