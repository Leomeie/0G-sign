"use client";

import { useAccount, useChainId, useSignTypedData } from "wagmi";
import { getTypedData } from "@/lib/eip712";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import type { DocRecord } from "@/types";

interface Props {
  doc: DocRecord;
  onSigned: (signature: `0x${string}`, timestamp: number) => void;
}

export default function SignButton({ doc, onSigned }: Props) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signTypedData, isPending, error } = useSignTypedData();
  const { show: toast } = useToast();
  const { t } = useI18n();

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
      <div className="rounded-xl bg-green-500/8 border border-green-500/15 px-4 py-3 text-sm text-green-400/90 animate-fade-in flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t("youHaveSigned")}
      </div>
    );
  }

  const handleSign = () => {
    const typedData = getTypedData(doc.rootHash, address, chainId);
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
        className={`btn-gradient w-full px-6 py-3 text-sm ${isPending ? "btn-gradient-loading" : ""}`}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("signing")}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            {t("signDocument")}
          </span>
        )}
      </button>
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error.message}
        </div>
      )}
    </div>
  );
}
