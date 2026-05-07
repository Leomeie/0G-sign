"use client";

export default function DocumentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center animate-fade-in">
      <h2 className="text-lg font-semibold text-zinc-100">
        Failed to load documents
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        {error.message || "An unexpected error occurred"}
      </p>
      <button onClick={reset} className="btn-gradient mt-6 px-6 py-2 text-sm">
        Try again
      </button>
    </div>
  );
}
