<div align="center">

# ⚡ 0G Sign

### Decentralized Document Signing on 0G Storage

**Upload · Sign · Verify — Trustless, Encrypted, Permanent**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![0G Storage](https://img.shields.io/badge/0G-Storage-blue)](https://0g.ai)
[![EIP-712](https://img.shields.io/badge/EIP--712-Signing-purple)](https://eips.ethereum.org/EIPS/eip-712)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

*No middlemen. No subscriptions. Just your wallet and decentralized storage.*

</div>

---

## 🎯 What is 0G Sign?

0G Sign is a **decentralized document signing platform** built on [0G Storage](https://0g.ai). It enables users to upload documents with **AES-256 client-side encryption**, collect **EIP-712 wallet signatures**, and verify authenticity — all stored permanently on the decentralized 0G network.

> *"Sign documents, not subscriptions."*

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Encrypted Upload
Documents are encrypted with **AES-256** on the client side before upload. Encryption keys never leave your browser — only you and authorized signers can decrypt.

### ✍️ Wallet Signing
Sign with **EIP-712 typed data** — zero gas fees, cryptographically verifiable. Each signer receives a clear, human-readable confirmation in their wallet.

### 🌐 Permanent Storage
Files are stored on the **decentralized 0G Network** with content-addressed root hashes. No single point of failure, no subscription fees.

</td>
<td width="50%">

### 🔗 Shareable Links
Create a signing request and share the link. Counterparties open it, connect their wallet, and sign — no account required.

### ✅ On-Chain Verification
Verify document integrity and signer authenticity via root hash. Export cryptographic proof as JSON for auditing.

### 🎨 Dark Glass UI
Modern dark theme with **glassmorphism effects**, gradient accents, animated background orbs, and a step-by-step tutorial right on the homepage.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Framework** | Next.js 15 (App Router) | Server-side rendering, API routes, Turbopack |
| **Web3** | wagmi v2 · viem · ethers v6 | Wallet connection, chain switching, signing |
| **Storage** | 0G Storage SDK | Decentralized upload/download with Merkle trees |
| **Signing** | EIP-712 typed data | Human-readable wallet confirmations |
| **Encryption** | AES-256-GCM | Client-side file encryption |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **Language** | TypeScript 5 | Type safety across the stack |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Client)                   │
│                                                         │
│  ┌───────────┐    ┌───────────┐    ┌───────────────┐   │
│  │  wagmi /  │    │ AES-256   │    │   EIP-712     │   │
│  │  viem     │───▶│ Encrypt   │───▶│   Sign /      │   │
│  │           │    │           │    │   Verify      │   │
│  └─────┬─────┘    └─────┬─────┘    └───────┬───────┘   │
│        │                │                   │           │
└────────┼────────────────┼───────────────────┼───────────┘
         │                │                   │
         ▼                ▼                   ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│   MetaMask  │   │   0G Indexer │   │  Signature   │
│   Wallet    │   │   (Upload)   │   │  Recovery    │
└─────────────┘   └──────┬───────┘   └──────────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   0G Storage     │
                │  (Decentralized) │
                │  Content-Addressed│
                │  Root Hash       │
                └──────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) (recommended) or npm
- [MetaMask](https://metamask.io) browser extension

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Leomeie/0G-sign.git
cd 0G-sign

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local

# 4. Start development server (Turbopack)
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ⚙️ Environment Variables

### Required (Public)

| Variable | Default | Description |
|:---------|:--------|:------------|
| `NEXT_PUBLIC_OG_CHAIN_ID` | `16661` | 0G Network Chain ID |
| `NEXT_PUBLIC_OG_RPC_URL` | *(built-in)* | 0G RPC endpoint |
| `NEXT_PUBLIC_OG_INDEXER_URL` | *(built-in)* | 0G Storage indexer |
| `NEXT_PUBLIC_OG_EXPLORER_URL` | *(built-in)* | Block explorer base URL |

> 💡 All public variables have mainnet defaults — **no configuration needed** for standard use.

### Optional: Server-Side Upload

| Variable | Description |
|:---------|:------------|
| `OG_PRIVATE_KEY` | Private key for server-side 0G signing |
| `OG_INDEXER_URL` | 0G Storage indexer (server) |
| `OG_RPC_URL` | 0G RPC endpoint (server) |

Without `OG_PRIVATE_KEY`, uploads automatically fall back to **browser localStorage mode**.

---

## 📖 How It Works

### Step 1: Create a Signing Request

1. Connect your MetaMask wallet
2. Fill in the document title and optional description
3. Upload your file (PDF, PNG, JPG, DOCX — max 10MB)
4. Add signer wallet addresses and click **Add**
5. Click **Create Signing Request**

> 🔒 Your file is encrypted with AES-256 before upload. The encryption key is saved locally.

### Step 2: Share the Link

1. After creation, you'll be redirected to the document detail page
2. Click **Copy Link** to copy the signing URL
3. Send the link to your counterparty via any channel

### Step 3: Counterparty Signs

1. Open the shared link
2. Connect MetaMask wallet
3. Click **Sign Document** → confirm in wallet popup

> ⚠️ **Important:** The signer must switch MetaMask to the **0G Network** (Chain ID: `16602` for testnet) or signing will fail.

---

## 🌐 Network Support

| Network | Chain ID | Status |
|:--------|:---------|:-------|
| 0G Mainnet | `16661` | ✅ Supported |
| 0G Testnet | `16602` | ✅ Supported |

The app auto-detects which network the connected wallet is on and adjusts accordingly.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                # 🏠 Landing page with tutorial guide
│   ├── layout.tsx              # Root layout with providers
│   ├── globals.css             # 🎨 Glass-morphism theme & animations
│   ├── create/
│   │   └── page.tsx            # 📝 Document creation form
│   ├── documents/
│   │   ├── page.tsx            # 📋 Document list (to sign / created)
│   │   └── [id]/page.tsx       # 📄 Document detail & signing
│   ├── verify/
│   │   └── page.tsx            # ✅ Signature verification
│   └── api/
│       └── upload/route.ts     # 🔄 Server-side 0G upload
│
├── components/
│   ├── header.tsx              # 🧭 Navigation with wallet + i18n
│   ├── document-upload.tsx     # 📤 Drag-and-drop file upload
│   ├── sign-button.tsx         # ✍️ EIP-712 signing action
│   ├── signature-list.tsx      # 📊 Signature status display
│   ├── signer-input.tsx        # 👥 Wallet address input
│   ├── share-button.tsx        # 🔗 Copy link button
│   ├── confirm-dialog.tsx      # ⚠️ Confirmation modal
│   └── toast.tsx               # 🔔 Notification system
│
└── lib/
    ├── wagmi.ts                # ⛓️ Chain config & wallet setup
    ├── eip712.ts               # 📋 EIP-712 domain & typed data
    ├── og-storage.ts           # 🗄️ Server-side 0G upload/download
    ├── og-upload-browser.ts    # 🌐 Client-side 0G upload (MemData)
    ├── encryption.ts           # 🔐 AES-256 key generation
    ├── i18n.tsx                # 🌏 Internationalization (EN/ZH)
    └── store.ts                # 💾 localStorage persistence
```

---

## 🎨 Design System

The app uses a custom **dark glass-morphism** theme with:

| Element | Style |
|:--------|:------|
| **Background** | Deep black (#0a0a0f) with subtle grid |
| **Cards** | Frosted glass with gradient borders on hover |
| **Buttons** | Gradient blue→violet with conic animation |
| **Inputs** | Glass effect with blue focus glow |
| **Animations** | Floating orbs, scan lines, pulse effects |
| **Typography** | Inter font family, zinc color scale |

---

## 🌏 Internationalization

0G Sign supports **English** and **中文** (Chinese) with automatic detection:

- Language switcher in the navigation bar (globe icon)
- Language preference saved to localStorage
- All UI text translated including errors and status messages

---

## 🚢 Deploy to Netlify

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com) → **Add new site** → **Import from Git**
3. Select the repository — Netlify auto-detects `netlify.toml`
4. Deploy — no environment variables needed

> The `netlify.toml` includes all public config. API routes are automatically converted to **Netlify Functions**.

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for Web3 teams** · Open source · No monthly fees

[![GitHub Stars](https://img.shields.io/github/stars/Leomeie/0G-sign?style=social)](https://github.com/Leomeie/0G-sign)

</div>
