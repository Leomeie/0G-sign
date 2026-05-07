import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        404
      </h1>
      <p className="mt-4 text-zinc-400">Page not found</p>
      <Link href="/" className="mt-6 btn-glass px-6 py-2 text-sm">
        Back to Home
      </Link>
    </div>
  );
}
