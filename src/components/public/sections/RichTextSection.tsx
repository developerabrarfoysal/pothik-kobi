type RichTextSectionProps = {
  title?: string | null;
  config: Record<string, unknown>;
};

export function RichTextSection({ title, config }: RichTextSectionProps) {
  const html = String(config.html || "");
  if (!html) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        {title && <h2 className="mb-8 font-serif text-3xl font-bold">{title}</h2>}
        <div className="prose-bn" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}
