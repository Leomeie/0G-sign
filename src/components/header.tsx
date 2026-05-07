"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "@wagmi/core";
import { useToast } from "@/components/toast";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { connect, isPending: connectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { show: toast } = useToast();

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const handleConnect = () => {
    connect(
      { connector: injected() },
      {
        onSuccess() {
          toast("Wallet connected", "success");
        },
        onError(err) {
          toast(
            "Connection failed: " + (err.message || "Unknown error"),
            "error",
          );
        },
      },
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-glass-border bg-base/95">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-100"
        >
          0G Sign
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/create" className="hover:text-zinc-100">
            Create
          </Link>
          <Link href="/documents" className="hover:text-zinc-100">
            Documents
          </Link>
          <Link href="/verify" className="hover:text-zinc-100">
            Verify
          </Link>
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="btn-glass px-4 py-2 text-sm"
            >
              {shortAddr}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connectPending}
              className="btn-gradient px-4 py-2 text-sm"
            >
              {connectPending ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
