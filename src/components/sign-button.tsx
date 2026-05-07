"use client";

import { useAccount, useSignTypedData } from "wagmi";
import { getTypedData } from "@/lib/eip712";
import { useToast } from "@/components/toast";
import type { DocRecord } from "@/types";

interface Props {
  doc: DocRecord;
  onSigned: (signature: `0x${string}`, timestamp: number) => void;
}

export default function SignButton({ doc, onSigned }: Props) {
  const { address } = useAccount();
  const { signTypedData, isPending, error } = useSignTypedData();
  const { show: toast } = useToast();

  if (!address) return null;

  const alreadySigned = doc.signatures.some(
    (s) => s.address.toLowerCase() === address.toLowerCase(),
  );
  const isSigner = doc.signers.some(
    (s) => s.toLowerCase() === address.toLowerCase(),
  );

  if (!isSigner) return null;
  if (alreadySigned) {
    return (
      <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 animate-fade-in">
        You have signed this document.
      </div>
    );
  }

  const handleSign = () => {
    const typedData = getTypedData(doc.rootHash, address);
    const ts = Number(typedData.message.timestamp);
    signTypedData(typedData, {
      onSuccess(data) {
        onSigned(data, ts);
      },
      onError(err) {
        toast("Signing failed: " + (err.message || "Rejected"), "error");
      },
    });
  };

  return (
    <div>
      <button
        onClick={handleSign}
        disabled={isPending}
        aria-busy={isPending}
        className={`btn-gradient px-6 py-3 text-sm ${isPending ? "btn-gradient-loading" : ""}`}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg aria-hidden="true" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing...
          </span>
        ) : (
          "Sign Document"
        )}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
