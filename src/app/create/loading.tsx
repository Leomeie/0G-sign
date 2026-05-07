export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse">
      <div className="h-8 w-48 rounded bg-zinc-800" />
      <div className="mt-2 h-4 w-72 rounded bg-zinc-800/60" />
      <div className="mt-8 space-y-6">
        <div>
          <div className="h-4 w-28 rounded bg-zinc-800 mb-2" />
          <div className="h-10 w-full rounded-lg bg-zinc-800/50" />
        </div>
        <div>
          <div className="h-4 w-40 rounded bg-zinc-800 mb-2" />
          <div className="h-16 w-full rounded-lg bg-zinc-800/50" />
        </div>
        <div>
          <div className="h-4 w-28 rounded bg-zinc-800 mb-2" />
          <div className="h-32 w-full rounded-xl bg-zinc-800/50" />
        </div>
        <div>
          <div className="h-4 w-36 rounded bg-zinc-800 mb-2" />
          <div className="h-10 w-full rounded-lg bg-zinc-800/50" />
        </div>
        <div className="h-12 w-full rounded-lg bg-zinc-800/50" />
      </div>
    </div>
  );
}
