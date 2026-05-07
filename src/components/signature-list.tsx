import type { DocRecord } from "@/types";

interface Props {
  doc: DocRecord;
  currentAddress?: string;
}

export default function SignatureList({ doc, currentAddress }: Props) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-zinc-300 mb-2">Signatures</h3>
      {doc.signers.map((addr) => {
        const sig = doc.signatures.find(
          (s) => s.address.toLowerCase() === addr.toLowerCase(),
        );
        const isMe = currentAddress?.toLowerCase() === addr.toLowerCase();
        return (
          <div
            key={addr}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
              sig
                ? "border-green-500/20 bg-green-500/8"
                : "border-zinc-800 bg-zinc-900/50"
            }`}
          >
            <span className="font-mono text-xs text-zinc-400">
              {addr.slice(0, 10)}...{addr.slice(-6)}
              {isMe && (
                <span className="ml-1 text-zinc-500">(you)</span>
              )}
            </span>
            {sig ? (
              <span className="text-green-400 text-xs font-medium">
                Signed{" "}
                {new Date(sig.timestamp * 1000).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-zinc-500 text-xs">Pending</span>
            )}
          </div>
        );
      })}
      {doc.signers.length === 0 && (
        <p className="text-sm text-zinc-500">No signers.</p>
      )}
    </div>
  );
}
