import Link from "next/link";

type CTASectionProps = {
  title?: string | null;
  config: Record<string, unknown>;
};

export function CTASection({ title, config }: CTASectionProps) {
  const heading = String(config.heading || title || "");
  const text = String(config.text || "");
  const buttonText = String(config.buttonText || "আরও পড়ুন");
  const buttonHref = String(config.buttonHref || "/writings");

  if (!heading) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl bg-gradient-to-r from-primary via-accent to-secondary p-8 text-center text-white md:p-12">
          <h2 className="font-serif text-3xl font-bold">{heading}</h2>
          {text && <p className="mt-4 text-white/90">{text}</p>}
          <Link href={buttonHref} className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-medium text-primary hover:bg-white/90">
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
