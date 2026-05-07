import { NextRequest, NextResponse } from "next/server";
import { downloadFrom0G, isOgConfigured } from "@/lib/og-storage";
import fs from "fs";

// POST instead of GET to avoid encryption key in URL query params
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rootHash: string = body.rootHash;
    const encryptionKey: string | undefined = body.encryptionKey;

    if (!rootHash) {
      return NextResponse.json({ error: "Missing rootHash" }, { status: 400 });
    }

    if (!isOgConfigured()) {
      return NextResponse.json(
        { error: "0G not configured" },
        { status: 501 }
      );
    }

    console.log("[download] fetching", rootHash.slice(0, 16));
    const { filePath, mime } = await downloadFrom0G(rootHash, encryptionKey);

    const data = fs.readFileSync(filePath);
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }

    return new NextResponse(data, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": "attachment; filename=document",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[download] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}