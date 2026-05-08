"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { getMyDocs } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { DocRecord } from "@/types";

export default function DocumentsPage() {
  const { address } = useAccount();
  const { t } = useI18n();
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
        <p className="text-zinc-400">{t("connectToView")}</p>
      </div>
    );
  }

  const statusBadge = (doc: DocRecord) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500/10 text-green-400 border-green-500/20",
      partial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      pending: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    };
    return (
      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-medium border ${colors[doc.status]}`}>
        {doc.status}
      </span>
    );
  };

  const renderList = (items: DocRecord[], label: string, icon: React.ReactNode) => (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-base font-semibold text-zinc-200">{label}</h2>
        <span className="text-xs text-zinc-600">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 pl-8">{t("noDocuments")}</p>
      ) : (
        <div className="space-y-2">
          {items.map((doc, i) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="glass-card flex items-center justify-between px-4 py-3.5 animate-fade-in group"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:border-blue-500/20 transition-colors">
                  <svg className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {doc.signers.length} {t("signersLabel")}
                    <span className="mx-1.5 text-zinc-700">·</span>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {statusBadge(doc)}
                <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div suppressHydrationWarning className="mx-auto max-w-2xl animate-fade-in-up">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">{t("documentsTitle")}</h1>
      </div>

      {renderList(toSign, t("toSign"),
        <svg key="sign" className="w-4 h-4 text-amber-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )}
      {renderList(created, t("createdByMe"),
        <svg key="create" className="w-4 h-4 text-violet-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}

      {docs.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-4">
            <svg aria-hidden="true" className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-zinc-400 mb-4">{t("noDocuments")}</p>
          <Link href="/create" className="btn-gradient px-6 py-2 text-sm">
            {t("createFirst")}
          </Link>
        </div>
      )}
    </div>
  );
}
