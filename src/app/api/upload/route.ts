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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const encrypt = formData.get("encrypt") === "true";

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
      console.log("[upload] 0G Storage mode");
      const tmpDir = os.tmpdir();
      const tmpPath = path.join(tmpDir, `ogsign-upload-${Date.now()}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(tmpPath, buffer);

      try {
        const result = await uploadTo0G(tmpPath, encrypt);
        return NextResponse.json({
          rootHash: result.rootHash,
          txHash: result.txHash,
          encryptionKey: result.encryptionKey,
          fileName: file.name,
          fileType: file.type,
          storage: "0g",
        });
      } catch (uploadErr) {
        throw uploadErr;
      } finally {
        try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
      }
    }

    // Fallback: base64 localStorage
    console.log("[upload] fallback mode (0G not configured)");
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
    console.error("[upload] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}