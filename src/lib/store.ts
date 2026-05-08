const STORAGE_KEY = "og-sign-documents";

import type { DocRecord } from "@/types";

let docsCache: DocRecord[] | null = null;
let cacheRaw: string | null = null;

export function getAllDocs(): DocRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    docsCache = null;
    cacheRaw = null;
    return [];
  }
  if (raw === cacheRaw && docsCache) return docsCache;
  try {
    docsCache = JSON.parse(raw) as DocRecord[];
    cacheRaw = raw;
    return docsCache;
  } catch {
    return [];
  }
}

export function getDoc(id: string): DocRecord | null {
  return getAllDocs().find((d) => d.id === id) ?? null;
}

export function saveDoc(doc: DocRecord): void {
  const docs = getAllDocs().filter((d) => d.id !== doc.id);
  docs.push(doc);
  const serialized = JSON.stringify(docs);
  localStorage.setItem(STORAGE_KEY, serialized);
  docsCache = docs;
  cacheRaw = serialized;
}

export function deleteDoc(id: string): void {
  const docs = getAllDocs().filter((d) => d.id !== id);
  const serialized = JSON.stringify(docs);
  localStorage.setItem(STORAGE_KEY, serialized);
  docsCache = docs;
  cacheRaw = serialized;
  try {
    const raw = localStorage.getItem("og-sign-files");
    if (raw) {
      const files: Record<string, string> = JSON.parse(raw);
      delete files[id];
      localStorage.setItem("og-sign-files", JSON.stringify(files));
    }
  } catch { /* ignore */ }
}

export function getMyDocs(address: string): DocRecord[] {
  const addr = address.toLowerCase();
  return getAllDocs().filter(
    (d) => d.creator.toLowerCase() === addr || d.signers.some((s) => s.toLowerCase() === addr)
  );
}