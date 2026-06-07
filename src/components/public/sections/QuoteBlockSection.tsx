"use client";

import { motion } from "framer-motion";

type QuoteBlockSectionProps = {
  title?: string | null;
  config: Record<string, unknown>;
};

export function QuoteBlockSection({ title, config }: QuoteBlockSectionProps) {
  const quote = String(config.quote || "");
  const author = String(config.author || "মুজাহিদ প্রিন্স");

  if (!quote) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        {title && <h2 className="mb-8 text-center font-serif text-3xl font-bold">{title}</h2>}
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border-l-4 border-secondary bg-gradient-to-r from-secondary/5 to-accent/5 p-8 md:p-12"
        >
          <span className="absolute -top-4 left-6 font-serif text-6xl text-secondary/30">&ldquo;</span>
          <p className="font-serif text-xl leading-relaxed md:text-2xl">{quote}</p>
          <footer className="mt-6 text-right text-sm font-medium text-primary">— {author}</footer>
        </motion.blockquote>
      </div>
    </section>
  );
}
