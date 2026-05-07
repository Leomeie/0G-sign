import crypto from "crypto";

export function generateAes256Key(): Uint8Array {
  // crypto.getRandomValues works in browsers and Node 19+;
  // fall back to crypto.randomBytes for older Node versions.
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    return globalThis.crypto.getRandomValues(new Uint8Array(32));
  }
  return new Uint8Array(crypto.randomBytes(32));
}

export function generateAes256KeyHex(): string {
  return "0x" + Buffer.from(generateAes256Key()).toString("hex");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}
