"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MediaImage } from "@/components/shared/MediaImage";
import { formatBanglaDate } from "@/lib/utils";

type WritingCardProps = {
  writing: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    publishedAt?: Date | string | null;
    readingTime: number;
    featuredImage?: { storageUrl: string; altText?: string | null; originalName: string } | null;
    category?: { name: string; slug: string; color?: string | null } | null;
  };
  index?: number;
};

export function WritingCard({ writing, index = 0 }: WritingCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-xl"
    >
      <Link href={`/writings/${writing.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
          {writing.featuredImage && (
            <MediaImage
              media={writing.featuredImage}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          )}
          {writing.category && (
            <span
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: writing.category.color || "var(--primary)" }}
            >
              {writing.category.name}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-serif text-xl font-bold leading-snug transition-colors group-hover:text-primary">
            {writing.title}
          </h3>
          {writing.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-muted">{writing.excerpt}</p>
          )}
          <div className="mt-4 flex items-center gap-3 text-xs text-muted">
            {writing.publishedAt && <span>{formatBanglaDate(writing.publishedAt)}</span>}
            <span>•</span>
            <span>{writing.readingTime} মিনিট পড়া</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
