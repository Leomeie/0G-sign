"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { injected } from "@wagmi/core";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { ogChain, supportedChainIds } from "@/lib/wagmi";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { connect, isPending: connectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const chainId = useChainId();
  const { show: toast } = useToast();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t } = useI18n();

  const NAV_LINKS = [
    { href: "/create", label: t("navCreate") },
    { href: "/documents", label: t("navDocuments") },
    { href: "/verify", label: t("navVerify") },
  ];

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
    <header suppressHydrationWarning className="sticky top-0 z-40 border-b border-glass-border bg-base/80 backdrop-blur-xl">
      {/* Wrong chain banner */}
      {wrongChain && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center text-xs text-yellow-400">
          {t("wrongNetwork")} —{" "}
          <button
            onClick={handleSwitchChain}
            disabled={switchPending}
            className="underline hover:text-yellow-200 disabled:opacity-50"
          >
            {switchPending
              ? t("switching")
              : `${t("switchTo")} ${ogChain.name}`}
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
          className="hidden sm:flex items-center gap-5 text-sm text-zinc-400"
        >
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            aria-label={lang === "en" ? "Switch to Chinese" : "Switch to English"}
            className="relative flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15] transition-all duration-200"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            {lang === "en" ? "EN" : "中"}
          </button>

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
              {connectPending ? t("connecting") : t("connectWallet")}
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
            {/* Mobile language switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
              className="flex items-center gap-2 py-2 text-left hover:text-zinc-100 transition-colors"
            >
              <svg aria-hidden="true" className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              {lang === "en" ? "中文" : "English"}
            </button>

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
                  {connectPending ? t("connecting") : t("connectWallet")}
                </button>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
