export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-16">
      <div className="mx-auto h-12 max-w-2xl rounded-lg bg-primary/10" />
      <div className="mx-auto mt-4 h-6 max-w-xl rounded bg-muted/20" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border">
            <div className="aspect-[16/10] bg-primary/5" />
            <div className="space-y-3 p-5">
              <div className="h-5 rounded bg-muted/20" />
              <div className="h-4 rounded bg-muted/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
