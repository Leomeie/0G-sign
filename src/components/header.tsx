"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { injected } from "@wagmi/core";
import { useToast } from "@/components/toast";
import { ogChain, supportedChainIds } from "@/lib/wagmi";

const NAV_LINKS = [
  { href: "/create", label: "Create" },
  { href: "/documents", label: "Documents" },
  { href: "/verify", label: "Verify" },
];

export default function Header() {
  const { address, isConnected } = useAccount();
  const { connect, isPending: connectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const chainId = useChainId();
  const { show: toast } = useToast();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const wrongChain = isConnected && !supportedChainIds.includes(chainId);

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

  const handleSwitchChain = () => {
    switchChain(
      { chainId: ogChain.id },
      {
        onError(err) {
          toast("Chain switch failed: " + (err.message || ""), "error");
        },
      },
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-glass-border bg-base/80 backdrop-blur-xl">
      {/* Wrong chain banner */}
      {wrongChain && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center text-xs text-yellow-400">
          Wrong network —{" "}
          <button
            onClick={handleSwitchChain}
            disabled={switchPending}
            className="underline hover:text-yellow-200 disabled:opacity-50"
          >
            {switchPending
              ? "Switching..."
              : `Switch to ${ogChain.name}`}
          </button>
        </div>
      )}

      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-100"
        >
          0G Sign
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden sm:flex items-center gap-6 text-sm text-zinc-400"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`relative py-1 hover:text-zinc-100 transition-colors ${
                pathname === href
                  ? "text-zinc-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500 after:rounded-full"
                  : ""
              }`}
            >
              {label}
            </Link>
          ))}
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="btn-glass px-4 py-1.5 text-sm"
            >
              {shortAddr}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connectPending}
              className="btn-gradient px-4 py-1.5 text-sm"
            >
              {connectPending ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
        >
          <span
            className={`block h-0.5 w-5 bg-zinc-400 transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-zinc-400 transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-zinc-400 transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="sm:hidden border-t border-glass-border bg-base/95 px-4 py-4 animate-fade-in"
        >
          <div className="flex flex-col gap-3 text-sm text-zinc-400">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                aria-current={pathname === href ? "page" : undefined}
                className={`py-2 ${
                  pathname === href ? "text-zinc-100" : "hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-glass-border">
              {isConnected ? (
                <button
                  onClick={() => {
                    disconnect();
                    setMenuOpen(false);
                  }}
                  className="btn-glass w-full px-4 py-2 text-sm"
                >
                  {shortAddr}
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleConnect();
                    setMenuOpen(false);
                  }}
                  disabled={connectPending}
                  className="btn-gradient w-full px-4 py-2 text-sm"
                >
                  {connectPending ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
