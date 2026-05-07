"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0f] text-zinc-200 antialiased">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="text-xl font-semibold text-zinc-100">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-2 text-white text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
