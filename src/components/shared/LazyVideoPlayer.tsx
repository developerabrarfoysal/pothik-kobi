"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  embedUrl: string;
  thumbnail?: string | null;
  title?: string | null;
  provider?: string;
  className?: string;
};

export function LazyVideoPlayer({ embedUrl, thumbnail, title, provider, className }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={cn("relative aspect-video overflow-hidden rounded-2xl bg-black", className)}>
        <iframe
          src={embedUrl}
          title={title || "ভিডিও"}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-900 shadow-lg transition-transform hover:scale-[1.02]",
        className
      )}
      aria-label={title || "ভিডিও চালান"}
    >
      {thumbnail ? (
        <Image src={thumbnail} alt={title || "ভিডিও"} fill className="object-cover opacity-80" sizes="(max-width:768px) 100vw, 50vw" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform group-hover:scale-110">
          <Play className="ml-1 h-7 w-7 text-primary" fill="currentColor" />
        </div>
      </div>
      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-left text-sm font-medium text-white">{title}</p>
          {provider && <p className="text-xs text-white/70">{provider === "YOUTUBE" ? "YouTube" : "Facebook"}</p>}
        </div>
      )}
    </button>
  );
}
