# 0G Sign

Decentralized document signing platform built on [0G Storage](https://0g.ai). Upload documents with AES-256 encryption, collect EIP-712 wallet signatures, and verify authenticity on-chain.

## Features

- **0G Storage** — Documents stored on decentralized 0G network with content-addressed root hashes
- **AES-256 Encryption** — Client-side encryption before upload, keys never leave the browser
- **EIP-712 Signatures** — Typed data signing for clear, human-readable wallet confirmations
- **Client-Side Signing** — Users sign with their own wallet, no server private key required
- **On-Chain Verification** — Verify document integrity and signer authenticity via root hash
- **Dark Glass UI** — Modern dark theme with glass-morphism effects and gradient accents

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Web3 | wagmi v2, viem, ethers v6 |
| Storage | 0G Storage SDK (`@0gfoundation/0g-storage-ts-sdk`) |
| Signing | EIP-712 typed data |
| Styling | Tailwind CSS 3 |
| Build | Turbopack |

## Architecture

```
Browser                          0G Network
┌──────────────┐                ┌──────────────────┐
│  wagmi/viem  │──connect──────▶│  MetaMask / Wallet│
│              │                └──────────────────┘
│  MemData +   │──upload────────▶  0G Indexer
│  AES-256     │   (client-signed)   │
│              │                      ▼
│  EIP-712     │◀──rootHash────  0G Storage (decentralized)
│  sign/verify │
└──────────────┘
```

**Upload flow:** File → AES-256 encrypt → `MemData` → Merkle tree → Indexer upload (user's wallet signs) → root hash returned

**Verify flow:** Root hash → EIP-712 signature + address → recover signer → match against claimed signer

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment config
cp .env.example .env.local

# Start dev server (uses Turbopack)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_OG_CHAIN_ID` | No | Chain ID (default: `16661` mainnet) |
| `NEXT_PUBLIC_OG_RPC_URL` | No | 0G RPC endpoint |
| `NEXT_PUBLIC_OG_INDEXER_URL` | No | 0G Storage indexer |
| `NEXT_PUBLIC_OG_EXPLORER_URL` | No | Block explorer base URL |

All `NEXT_PUBLIC_*` variables have mainnet defaults — no configuration needed for standard use.

### Optional: Server-Side Fallback

If you want the API route (`/api/upload`) to upload to 0G without wallet connection:

| Variable | Description |
|----------|-------------|
| `OG_PRIVATE_KEY` | Private key for server-side signing |
| `OG_INDEXER_URL` | 0G Storage indexer |
| `OG_RPC_URL` | 0G RPC endpoint |

Without `OG_PRIVATE_KEY`, uploads fall back to browser localStorage mode.

## Deploy to Netlify

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com) → **Add new site** → **Import from Git**
3. Select the repository — Netlify auto-detects `netlify.toml`
4. Deploy — no environment variables needed

The `netlify.toml` includes all public config. API routes are automatically converted to Netlify Functions.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── create/page.tsx       # Document creation form
│   ├── documents/            # Document list and detail views
│   └── verify/page.tsx       # Signature verification
├── components/
│   ├── document-upload.tsx   # Drag-and-drop file upload
│   ├── sign-button.tsx       # EIP-712 signing action
│   ├── signature-list.tsx    # Signature status display
│   └── ...
└── lib/
    ├── wagmi.ts              # Chain config and wallet setup
    ├── eip712.ts             # EIP-712 domain and types
    ├── og-storage.ts         # Server-side 0G upload/download
    ├── og-upload-browser.ts  # Client-side 0G upload (MemData)
    └── encryption.ts         # AES-256 key generation
```

## License

MIT
