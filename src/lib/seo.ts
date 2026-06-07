import type { Metadata } from "next";
import { getSiteUrl } from "./utils";

type SeoInput = {
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  noIndex?: boolean;
  path?: string;
};

export function buildMetadata(input: SeoInput): Metadata {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "পথিক কবি";
  const title = input.title || siteName;
  const description =
    input.description ||
    "মুজাহিদ প্রিন্স — পথিক কবির কবিতা, গল্প ও সাহিত্য";

  const canonical =
    input.canonicalUrl ||
    (input.path ? `${getSiteUrl()}${input.path}` : getSiteUrl());

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: "bn_BD",
      type: "website",
      ...(input.ogImageUrl ? { images: [{ url: input.ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(input.ogImageUrl ? { images: [input.ogImageUrl] } : {}),
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "পথিক কবি",
    alternateName: "Pothik Kobi",
    url: getSiteUrl(),
    inLanguage: "bn-BD",
    author: buildPersonJsonLd(),
  };
}

export function buildPersonJsonLd() {
  return {
    "@type": "Person",
    name: "মুজাহিদ প্রিন্স",
    alternateName: "Muzahid Prince",
    url: getSiteUrl(),
    jobTitle: "কবি ও লেখক",
  };
}

export function buildArticleJsonLd(article: {
  title: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    inLanguage: "bn-BD",
    author: buildPersonJsonLd(),
    publisher: {
      "@type": "Organization",
      name: "পথিক কবি",
      url: getSiteUrl(),
    },
    ...(article.imageUrl ? { image: article.imageUrl } : {}),
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
