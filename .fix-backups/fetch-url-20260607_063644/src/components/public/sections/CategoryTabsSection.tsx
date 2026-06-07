"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WritingCard } from "../WritingCard";

type Category = {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  _count?: { writings: number };
};

type CategoryTabsSectionProps = {
  title: string;
  categories: Category[];
};

export function CategoryTabsSection({ title, categories }: CategoryTabsSectionProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(categories[0]?.slug || null);
  const [writings, setWritings] = useState<Parameters<typeof WritingCard>[0]["writing"][]>([]);
  const [loading, setLoading] = useState(false);

  const loadCategory = async (slug: string) => {
    setActiveSlug(slug);
    setLoading(true);
    try {
      const res = await fetch(`/api/writings?category=${slug}&limit=6`);
      const data = await res.json();
      setWritings(data.writings || []);
    } finally {
      setLoading(false);
    }
  };

  if (categories.length && !writings.length && activeSlug && !loading) {
    loadCategory(activeSlug);
  }

  return (
    <section className="bg-gradient-to-b from-transparent to-primary/5 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center font-serif text-3xl font-bold">{title}</h2>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => loadCategory(cat.slug)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeSlug === cat.slug
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white text-foreground hover:bg-primary/10"
              }`}
              style={activeSlug === cat.slug && cat.color ? { backgroundColor: cat.color } : undefined}
            >
              {cat.name}
              {cat._count && <span className="ml-1 opacity-70">({cat._count.writings})</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted">
              লোড হচ্ছে...
            </motion.p>
          ) : (
            <motion.div
              key={activeSlug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {writings.map((w, i) => (
                <WritingCard key={w.id} writing={w} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
