import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl animate-fade-in bg-gradient-to-r from-zinc-100 via-blue-200 to-purple-300 bg-clip-text text-transparent">
        Sign documents, not subscriptions
      </h1>
      <p className="mt-4 max-w-lg text-lg text-zinc-400 animate-fade-in stagger-2">
        Upload a document. Add signers. Let them sign with their wallet.
        Everything encrypted and stored permanently on 0G Storage.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/create"
          className="btn-gradient px-6 py-3 text-sm animate-fade-in stagger-4"
        >
          Create Document
        </Link>
        <Link
          href="/verify"
          className="btn-glass px-6 py-3 text-sm animate-fade-in stagger-5"
        >
          Verify Signature
        </Link>
      </div>

      <div className="mt-20 grid gap-8 sm:grid-cols-3 text-left">
        <div className="glass-card p-6 animate-fade-in-up stagger-1">
          <h3 className="font-semibold text-zinc-100">Encrypted Upload</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Files are encrypted client-side before uploading to 0G decentralized
            storage. Only authorized parties can decrypt.
          </p>
        </div>
        <div className="glass-card p-6 animate-fade-in-up stagger-2">
          <h3 className="font-semibold text-zinc-100">Wallet Signing</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Sign with EIP-712 typed data — zero gas, cryptographically
            verifiable. Anyone can verify the signature&apos;s authenticity.
          </p>
        </div>
        <div className="glass-card p-6 animate-fade-in-up stagger-3">
          <h3 className="font-semibold text-zinc-100">Permanent Storage</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Documents live on 0G Storage, a decentralized storage network.
            No single point of failure. No subscription needed.
          </p>
        </div>
      </div>
      <p className="mt-16 text-sm text-zinc-500">
        Built for Web3 teams. No monthly fees. No centralized trust.
      </p>
    </div>
  );
}
