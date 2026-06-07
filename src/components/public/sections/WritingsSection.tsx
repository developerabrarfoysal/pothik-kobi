import { WritingCard } from "../WritingCard";

type WritingsSectionProps = {
  title: string;
  writings: Parameters<typeof WritingCard>[0]["writing"][];
};

export function WritingsSection({ title, writings }: WritingsSectionProps) {
  if (!writings.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-10 text-center font-serif text-3xl font-bold md:text-4xl">{title}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {writings.map((writing, i) => (
            <WritingCard key={writing.id} writing={writing} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
