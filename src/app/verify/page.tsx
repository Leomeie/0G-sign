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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const fieldErrors = {
    rootHash:
      touched.rootHash && !rootHash.startsWith("0x")
        ? "Must start with 0x"
        : "",
    signer:
      touched.signer && signer && !isAddress(signer)
        ? "Invalid address"
        : "",
    timestamp:
      touched.timestamp && timestamp && (isNaN(+timestamp) || +timestamp <= 0)
        ? "Must be a positive number"
        : "",
    signature:
      touched.signature &&
      signature &&
      (!isHex(signature) || signature.length !== 132)
        ? "Expected 0x + 130 hex chars"
        : "",
  };

  const handleVerify = async () => {
    setError("");
    setResult(null);

    setTouched({
      rootHash: true,
      signer: true,
      timestamp: true,
      signature: true,
    });

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

  const inputClass = (field: string) =>
    `glass-input w-full px-3 py-2 text-xs font-mono ${
      fieldErrors[field as keyof typeof fieldErrors]
        ? "border-red-500/50 focus:border-red-500"
        : ""
    }`;

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
            onBlur={() => markTouched("rootHash")}
            placeholder="0x..."
            aria-invalid={!!fieldErrors.rootHash}
            className={inputClass("rootHash")}
          />
          {fieldErrors.rootHash && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.rootHash}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Claimed Signer Address
          </label>
          <input
            type="text"
            value={signer}
            onChange={(e) => setSigner(e.target.value)}
            onBlur={() => markTouched("signer")}
            placeholder="0x..."
            aria-invalid={!!fieldErrors.signer}
            className={inputClass("signer")}
          />
          {fieldErrors.signer && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.signer}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Timestamp (Unix seconds)
          </label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            onBlur={() => markTouched("timestamp")}
            placeholder="1700000000"
            aria-invalid={!!fieldErrors.timestamp}
            className={inputClass("timestamp")}
          />
          {fieldErrors.timestamp && (
            <p className="mt-1 text-xs text-red-400">
              {fieldErrors.timestamp}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Signature
          </label>
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            onBlur={() => markTouched("signature")}
            placeholder="0x..."
            rows={3}
            aria-invalid={!!fieldErrors.signature}
            className={inputClass("signature")}
          />
          {fieldErrors.signature && (
            <p className="mt-1 text-xs text-red-400">
              {fieldErrors.signature}
            </p>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={checking}
          aria-busy={checking}
          className="btn-gradient w-full px-6 py-3 text-sm"
        >
          {checking ? (
            <span className="flex items-center justify-center gap-2">
              <svg aria-hidden="true" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify"
          )}
        </button>

        {result && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium animate-fade-in ${
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
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
