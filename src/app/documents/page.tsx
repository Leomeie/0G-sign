"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { getMyDocs } from "@/lib/store";
import type { DocRecord } from "@/types";

export default function DocumentsPage() {
  const { address } = useAccount();
  const [docs, setDocs] = useState<DocRecord[]>([]);

  useEffect(() => {
    if (address) setDocs(getMyDocs(address));
  }, [address]);

  if (!address) {
    return (
      <div className="py-16 text-center text-zinc-400 animate-fade-in">
        Connect your wallet to view documents.
      </div>
    );
  }

  const created = docs.filter(
    (d) => d.creator.toLowerCase() === address.toLowerCase(),
  );
  const toSign = docs.filter(
    (d) =>
      d.creator.toLowerCase() !== address.toLowerCase() &&
      d.signers.some((s) => s.toLowerCase() === address.toLowerCase()),
  );

  const statusBadge = (doc: DocRecord) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500/15 text-green-400",
      partial: "bg-yellow-500/15 text-yellow-400",
      pending: "bg-zinc-500/15 text-zinc-400",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[doc.status]}`}
      >
        {doc.status}
      </span>
    );
  };

  const renderList = (items: DocRecord[], label: string) => (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-zinc-100">{label}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No documents.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((doc, i) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="glass-card flex items-center justify-between px-4 py-3 animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  {doc.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {doc.signers.length} signer
                  {doc.signers.length > 1 ? "s" : ""}
                  {" · "}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              {statusBadge(doc)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <h1 className="text-2xl font-bold text-zinc-100">Documents</h1>
      {renderList(toSign, "To Sign")}
      {renderList(created, "Created by Me")}
      {docs.length === 0 && (
        <p className="mt-8 text-center text-zinc-500">
          No documents yet.{" "}
          <Link href="/create" className="text-blue-400 hover:underline">
            Create one
          </Link>
        </p>
      )}
    </div>
  );
}
