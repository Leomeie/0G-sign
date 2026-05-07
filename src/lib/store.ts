const STORAGE_KEY = "og-sign-documents";

import type { DocRecord } from "@/types";

export function getAllDocs(): DocRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DocRecord[];
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function deleteDoc(id: string): void {
  const docs = getAllDocs().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
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