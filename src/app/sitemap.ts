import type { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/queries/public";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const { pages, writings } = await getAllPublishedSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/writings`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((p) => !["home", "writings", "about", "contact"].includes(p.slug))
    .map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const writingRoutes: MetadataRoute.Sitemap = writings.map((w) => ({
    url: `${baseUrl}/writings/${w.slug}`,
    lastModified: w.publishedAt || w.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...pageRoutes, ...writingRoutes];
}
