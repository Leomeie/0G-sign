"use client";

import { useAccount } from "wagmi";
import { useSignTypedData } from "wagmi";
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
      <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
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
        className="btn-gradient px-6 py-3 text-sm"
      >
        {isPending ? "Signing..." : "Sign Document"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
