"use client";

import { LazyVideoPlayer } from "@/components/shared/LazyVideoPlayer";

type VideoGallerySectionProps = {
  title?: string | null;
  config: Record<string, unknown>;
};

export function VideoGallerySection({ title, config }: VideoGallerySectionProps) {
  const videos = (config.videos as { embedUrl: string; thumbnail?: string; title?: string; provider?: string }[]) || [];
  if (!videos.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {title && <h2 className="mb-10 text-center font-serif text-3xl font-bold">{title}</h2>}
        <div className="grid gap-6 md:grid-cols-2">
          {videos.map((video, i) => (
            <LazyVideoPlayer key={i} {...video} />
          ))}
        </div>
      </div>
    </section>
  );
}
