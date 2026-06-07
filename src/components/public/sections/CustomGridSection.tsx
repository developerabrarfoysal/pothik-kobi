type CustomGridSectionProps = {
  title?: string | null;
  config: Record<string, unknown>;
};

export function CustomGridSection({ title, config }: CustomGridSectionProps) {
  const items = (config.items as { title: string; content: string }[]) || [];
  if (!items.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {title && <h2 className="mb-10 text-center font-serif text-3xl font-bold">{title}</h2>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-serif text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-muted">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
