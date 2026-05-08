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
          toast("Connection failed: " + (err.message || "Unknown error"), "error");
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
    <header suppressHydrationWarning className="sticky top-0 z-40 border-b border-white/[0.04] bg-[#0a0a0f]/80 backdrop-blur-2xl">
      {/* Wrong chain banner */}
      {wrongChain && (
        <div className="bg-amber-500/8 border-b border-amber-500/15 px-4 py-2 text-center text-xs text-amber-400/90">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            {t("wrongNetwork")} —{" "}
            <button
              onClick={handleSwitchChain}
              disabled={switchPending}
              className="font-medium underline underline-offset-2 decoration-amber-400/40 hover:decoration-amber-400 hover:text-amber-300 disabled:opacity-50 transition-all"
            >
              {switchPending ? t("switching") : `${t("switchTo")} ${ogChain.name}`}
            </button>
          </span>
        </div>
      )}

      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-100 group">
          <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            0G
          </div>
          Sign
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-1 text-sm text-zinc-400">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            aria-label={lang === "en" ? "Switch to Chinese" : "Switch to English"}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all duration-200"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            {lang === "en" ? "EN" : "中"}
          </button>

          <div className="w-px h-4 bg-white/[0.06] mx-1" />

          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`relative px-3 py-1.5 rounded-lg transition-all duration-200 ${
                pathname === href
                  ? "text-zinc-100 bg-white/[0.06]"
                  : "hover:text-zinc-100 hover:bg-white/[0.03]"
              }`}
            >
              {label}
              {pathname === href && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
              )}
            </Link>
          ))}

          <div className="w-px h-4 bg-white/[0.06] mx-1" />

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12] hover:bg-white/[0.06] transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {shortAddr}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connectPending}
              className="btn-gradient px-4 py-1.5 text-sm"
            >
              {connectPending ? (
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("connecting")}
                </span>
              ) : t("connectWallet")}
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
          <span className={`block h-0.5 w-5 bg-zinc-400 rounded-full transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-zinc-400 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-zinc-400 rounded-full transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav aria-label="Mobile navigation" className="sm:hidden border-t border-white/[0.04] bg-[#0a0a0f]/95 backdrop-blur-2xl px-4 py-4 animate-fade-in">
          <div className="flex flex-col gap-1 text-sm text-zinc-400">
            {/* Mobile language switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
              className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-left hover:text-zinc-100 hover:bg-white/[0.04] transition-all"
            >
              <svg aria-hidden="true" className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                className={`py-2.5 px-3 rounded-lg transition-all ${
                  pathname === href ? "text-zinc-100 bg-white/[0.06]" : "hover:text-zinc-100 hover:bg-white/[0.03]"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="mt-2 pt-2 border-t border-white/[0.04]">
              {isConnected ? (
                <button
                  onClick={() => { disconnect(); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full py-2.5 px-3 rounded-lg text-left hover:bg-white/[0.04] transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {shortAddr}
                </button>
              ) : (
                <button
                  onClick={() => { handleConnect(); setMenuOpen(false); }}
                  disabled={connectPending}
                  className="btn-gradient w-full px-4 py-2.5 text-sm"
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
