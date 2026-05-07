import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "0G Sign - Decentralized Document Signing",
  description: "Upload, encrypt, and sign documents on 0G Storage with your wallet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base text-zinc-200 antialiased">
        <ToastProvider>
          <Providers>{children}</Providers>
        </ToastProvider>
      </body>
    </html>
  );
}