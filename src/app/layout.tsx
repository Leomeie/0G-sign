import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: {
    default: "0G Sign — Decentralized Document Signing",
    template: "%s | 0G Sign",
  },
  description:
    "Upload, encrypt, and sign documents on 0G Storage with your wallet. EIP-712 signatures, AES-256 encryption, on-chain verification.",
  keywords: [
    "0G",
    "document signing",
    "decentralized",
    "EIP-712",
    "blockchain",
    "web3",
    "encryption",
  ],
  metadataBase: new URL("https://0gsign.netlify.app"),
  openGraph: {
    title: "0G Sign — Decentralized Document Signing",
    description:
      "Upload, encrypt, and sign documents on 0G Storage with your wallet.",
    type: "website",
    siteName: "0G Sign",
  },
  twitter: {
    card: "summary_large_image",
    title: "0G Sign — Decentralized Document Signing",
    description:
      "Upload, encrypt, and sign documents on 0G Storage with your wallet.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen bg-base text-zinc-300 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          Skip to content
        </a>
        <ToastProvider>
          <Providers>
            <main id="main-content" className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
              {children}
            </main>
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
