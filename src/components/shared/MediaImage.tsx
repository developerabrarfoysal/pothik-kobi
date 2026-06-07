"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type MediaAsset = {
  id?: string;
  storageUrl: string;
  altText?: string | null;
  originalName: string;
  width?: number | null;
  height?: number | null;
};

type MediaImageProps = {
  media?: MediaAsset | null;
  src?: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function MediaImage({
  media,
  src,
  alt,
  fill,
  width = 800,
  height = 600,
  className,
  priority,
  sizes,
}: MediaImageProps) {
  const imageSrc = src || media?.storageUrl;
  const imageAlt = alt || media?.altText || media?.originalName || "ছবি";

  if (!imageSrc) {
    return (
      <div className={cn("bg-gradient-to-br from-primary/10 to-accent/10", className)} />
    );
  }

  if (imageSrc.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={imageAlt}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className={className}
        priority={priority}
        sizes={sizes || "100vw"}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={imageAlt}
      width={media?.width || width}
      height={media?.height || height}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
