"use client";

import { useEffect, useMemo, useState } from "react";
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

  const addr = address?.toLowerCase() ?? "";
  const created = useMemo(
    () => docs.filter((d) => d.creator.toLowerCase() === addr),
    [docs, addr],
  );
  const toSign = useMemo(
    () =>
      docs.filter(
        (d) =>
          d.creator.toLowerCase() !== addr &&
          d.signers.some((s) => s.toLowerCase() === addr),
      ),
    [docs, addr],
  );

  if (!address) {
    return (
      <div className="flex flex-col items-center py-16 text-center animate-fade-in">
        <svg aria-hidden="true" className="w-12 h-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <p className="text-zinc-400">Connect your wallet to view documents.</p>
      </div>
    );
  }

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
        <div className="mt-12 flex flex-col items-center text-center animate-fade-in">
          <svg aria-hidden="true" className="w-16 h-16 text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-zinc-400 mb-4">No documents yet.</p>
          <Link href="/create" className="btn-gradient px-6 py-2 text-sm">
            Create your first document
          </Link>
        </div>
      )}
    </div>
  );
}
