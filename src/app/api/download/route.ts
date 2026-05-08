import { NextRequest, NextResponse } from "next/server";
import { downloadFrom0G, isOgConfigured } from "@/lib/og-storage";
import { createReadStream } from "fs";
import { stat, unlink } from "fs/promises";

// Validate hex string (0x prefix, 64 hex chars for bytes32)
const ROOT_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rootHash: string = body.rootHash;
    const encryptionKey: string | undefined = body.encryptionKey;

    if (!rootHash || !ROOT_HASH_RE.test(rootHash)) {
      return NextResponse.json(
        { error: "Invalid rootHash format" },
        { status: 400 },
      );
    }

    if (encryptionKey && !/^0x[0-9a-fA-F]{64}$/.test(encryptionKey)) {
      return NextResponse.json(
        { error: "Invalid encryptionKey format" },
        { status: 400 },
      );
    }

    if (!isOgConfigured()) {
      return NextResponse.json(
        { error: "0G not configured" },
        { status: 501 },
      );
    }

    const { filePath, mime } = await downloadFrom0G(rootHash, encryptionKey);
    const fileStat = await stat(filePath);

    const stream = createReadStream(filePath);
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: string | Buffer) => {
          controller.enqueue(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
        });
        stream.on("end", () => {
          controller.close();
          unlink(filePath).catch(() => {});
        });
        stream.on("error", (err) => {
          controller.error(err);
          unlink(filePath).catch(() => {});
        });
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": "attachment; filename=document",
        "Content-Length": String(fileStat.size),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 },
    );
  }
}
