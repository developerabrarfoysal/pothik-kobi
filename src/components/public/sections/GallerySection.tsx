"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MediaImage } from "@/components/shared/MediaImage";
import { X } from "lucide-react";

type GallerySectionProps = {
  title?: string | null;
  albums: {
    id: string;
    title: string;
    slug: string;
    items: { id: string; caption?: string | null; media: { storageUrl: string; altText?: string | null; originalName: string } }[];
  }[];
  config: Record<string, unknown>;
};

export function GallerySection({ title, albums, config }: GallerySectionProps) {
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(null);
  const albumSlug = config.albumSlug as string | undefined;
  const displayAlbums = albumSlug
    ? albums.filter((a) => a.slug === albumSlug || a.title === albumSlug)
    : albums;
  const items = displayAlbums.flatMap((a) => a.items);

  if (!items.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {title && <h2 className="mb-10 text-center font-serif text-3xl font-bold">{title}</h2>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setLightbox({ url: item.media.storageUrl, alt: item.media.altText || item.caption || "" })}
              className="relative aspect-square overflow-hidden rounded-xl"
            >
              <MediaImage media={item.media} fill className="object-cover" sizes="300px" />
            </motion.button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute right-4 top-4 text-white" onClick={() => setLightbox(null)}>
            <X className="h-8 w-8" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.url} alt={lightbox.alt} className="max-h-[90vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
