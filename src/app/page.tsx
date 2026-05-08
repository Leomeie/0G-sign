import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center py-20 text-center animate-fade-in-up overflow-hidden">
      {/* Animated background orbs */}
      <div className="bg-orb w-96 h-96 -top-48 -left-48 bg-blue-600" />
      <div className="bg-orb w-80 h-80 -bottom-40 -right-40 bg-violet-600" style={{ animationDelay: "-4s" }} />
      <div className="bg-orb w-64 h-64 top-1/3 right-1/4 bg-cyan-600" style={{ animationDelay: "-8s" }} />

      {/* Badge */}
      <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs text-zinc-400 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Powered by 0G Storage
      </div>

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent animate-gradient leading-tight">
        Sign documents,
        <br />
        not subscriptions
      </h1>

      <p className="mt-5 max-w-md text-base text-zinc-400 animate-fade-in stagger-2 leading-relaxed">
        Upload, sign, and verify documents with your wallet.
        Encrypted and stored permanently on 0G — no fees, no middlemen.
      </p>

      <div className="mt-8 flex gap-3 animate-fade-in stagger-3">
        <Link
          href="/create"
          className="btn-gradient px-6 py-2.5 text-sm"
        >
          Get Started
        </Link>
        <Link
          href="/verify"
          className="btn-glass px-6 py-2.5 text-sm"
        >
          Verify Signature
        </Link>
      </div>

      {/* Feature cards */}
      <div className="mt-24 grid gap-6 sm:grid-cols-3 text-left max-w-3xl w-full">
        <div className="glass-card p-5 animate-fade-in-up stagger-1 group">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/15 transition-colors">
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Encrypted Upload</h3>
          <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">
            AES-256 client-side encryption before upload. Only authorized parties can decrypt.
          </p>
        </div>

        <div className="glass-card p-5 animate-fade-in-up stagger-2 group">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/15 transition-colors">
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.986 2.048A7.464 7.464 0 004.5 10.5a7.464 7.464 0 01.83 3.87M12 12a3 3 0 100-6 3 3 0 000 6zm0 0v7.5m0-7.5a3 3 0 013 3v4.5m-3-4.5a3 3 0 00-3 3v4.5" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Wallet Signing</h3>
          <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">
            EIP-712 typed data — zero gas, cryptographically verifiable signatures.
          </p>
        </div>

        <div className="glass-card p-5 animate-fade-in-up stagger-3 group">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/15 transition-colors">
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Permanent Storage</h3>
          <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">
            Decentralized on 0G Network. No single point of failure, no subscriptions.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-16 text-xs text-zinc-600 animate-fade-in stagger-4">
        Built for Web3 teams. Open source. No monthly fees.
      </p>
    </div>
  );
}
