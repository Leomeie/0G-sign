"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-gray-500">{error.message || "An unexpected error occurred"}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-gray-900 px-6 py-2 text-white hover:bg-gray-800 text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}