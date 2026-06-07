import Link from "next/link";

type CustomCardsSectionProps = {
  title?: string | null;
  config: Record<string, unknown>;
};

export function CustomCardsSection({ title, config }: CustomCardsSectionProps) {
  const cards = (config.cards as { title: string; excerpt: string; href?: string }[]) || [];
  if (!cards.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {title && <h2 className="mb-10 text-center font-serif text-3xl font-bold">{title}</h2>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => {
            const content = (
              <>
                <h3 className="font-serif text-xl font-bold">{card.title}</h3>
                <p className="mt-2 text-muted">{card.excerpt}</p>
              </>
            );
            return card.href ? (
              <Link key={i} href={card.href} className="block rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
                {content}
              </Link>
            ) : (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
