export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse">
      <div className="h-8 w-40 rounded bg-zinc-800" />
      <div className="mt-6 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 w-full rounded-xl bg-zinc-800/50" />
        ))}
      </div>
    </div>
  );
}
