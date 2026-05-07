export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse">
      <div className="h-8 w-36 rounded bg-zinc-800" />
      <div className="mt-2 h-4 w-64 rounded bg-zinc-800/60" />
      <div className="mt-8 space-y-6">
        <div>
          <div className="h-4 w-24 rounded bg-zinc-800 mb-2" />
          <div className="h-10 w-full rounded-lg bg-zinc-800/50" />
        </div>
        <div>
          <div className="h-4 w-32 rounded bg-zinc-800 mb-2" />
          <div className="h-10 w-full rounded-lg bg-zinc-800/50" />
        </div>
        <div className="h-12 w-full rounded-lg bg-zinc-800/50" />
      </div>
    </div>
  );
}
