import { NextRequest, NextResponse } from "next/server";
import { uploadTo0G, isOgConfigured } from "@/lib/og-storage";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Simple in-memory rate limiter for serverless
const g = globalThis as unknown as { __ogUploadHits?: Map<string, number[]> };
if (!g.__ogUploadHits) g.__ogUploadHits = new Map();
const hits = g.__ogUploadHits;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60_000;
  const max = 10;
  const arr = hits.get(ip) ?? [];
  const recent = arr.filter((t) => now - t < window);
  if (recent.length >= max) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const encrypt = formData.get("encrypt") === "true";
    const clientKey = (formData.get("encryptionKey") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File > 10MB" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
    }

    if (isOgConfigured()) {
      const tmpDir = os.tmpdir();
      const tmpPath = path.join(tmpDir, `ogsign-upload-${Date.now()}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(tmpPath, buffer);

      try {
        const result = await uploadTo0G(tmpPath, encrypt, clientKey);
        return NextResponse.json({
          rootHash: result.rootHash,
          txHash: result.txHash,
          encryptionKey: result.encryptionKey,
          fileName: file.name,
          fileType: file.type,
          storage: "0g",
        });
      } finally {
        try {
          fs.unlinkSync(tmpPath);
        } catch {
          /* ignore */
        }
      }
    }

    // Fallback: base64 localStorage
    const arrBuf = await file.arrayBuffer();
    const base64 = Buffer.from(arrBuf).toString("base64");
    const hash = crypto.createHash("sha256").update(base64).digest("hex");

    return NextResponse.json({
      rootHash: `0x${hash}`,
      txHash: `0x${hash}`,
      encryptionKey: null,
      fileName: file.name,
      fileType: file.type,
      fileData: base64,
      storage: "local",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
