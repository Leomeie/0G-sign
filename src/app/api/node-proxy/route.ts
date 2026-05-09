import { NextRequest, NextResponse } from "next/server";

// Whitelist: only proxy to 0G storage nodes (port 5678)
function isAllowedTarget(url: string): boolean {
  try {
    const u = new URL(url);
    return u.port === "5678" && u.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const target = request.headers.get("x-proxy-target");
    if (!target || !isAllowedTarget(target)) {
      return NextResponse.json(
        { error: "Invalid or missing proxy target" },
        { status: 400 },
      );
    }

    const body = await request.text();

    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(60_000),
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Proxy error: " + (e instanceof Error ? e.message : String(e)) },
      { status: 502 },
    );
  }
}
