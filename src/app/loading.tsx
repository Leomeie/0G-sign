export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-pulse">
      <div className="h-10 w-80 rounded-lg bg-zinc-800" />
      <div className="mt-4 h-5 w-64 rounded bg-zinc-800" />
      <div className="mt-8 flex gap-4">
        <div className="h-11 w-36 rounded-lg bg-zinc-800" />
        <div className="h-11 w-36 rounded-lg bg-zinc-800" />
      </div>
      <div className="mt-20 grid gap-8 sm:grid-cols-3 w-full max-w-3xl">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-zinc-800/50" />
        ))}
      </div>
    </div>
  );
}
