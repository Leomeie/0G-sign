export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Use globalThis to persist across hot-module reloads in dev.
// In serverless (Vercel etc.) each cold start resets this — acceptable
// for our use case since 0G uploads are infrequent and rate-limited
// upstream anyway. A production deployment should swap this for Redis.
const g = globalThis as unknown as { __ogSignTimestamps?: number[] };
if (!g.__ogSignTimestamps) g.__ogSignTimestamps = [];
const requestTimestamps = g.__ogSignTimestamps;

export async function rateLimit(
  maxPerMinute = 30,
  minInterval = 2100,
): Promise<void> {
  const now = Date.now();
  const cutoff = now - 60_000;

  // Purge entries older than the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < cutoff) {
    requestTimestamps.shift();
  }

  // If at capacity, wait until the oldest entry expires
  if (requestTimestamps.length >= maxPerMinute) {
    const waitTime = requestTimestamps[0] + 60_000 - now + 100;
    if (waitTime > 0) {
      await sleep(waitTime);
    }
    requestTimestamps.shift();
  }

  // Enforce minimum interval between requests
  if (requestTimestamps.length > 0) {
    const last = requestTimestamps[requestTimestamps.length - 1];
    const elapsed = now - last;
    if (elapsed < minInterval) {
      await sleep(minInterval - elapsed);
    }
  }

  requestTimestamps.push(Date.now());
}
