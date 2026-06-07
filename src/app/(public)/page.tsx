import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomepage } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/public/SectionRenderer";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomepage();
  if (!page) return buildMetadata({ title: "পথিক কবি | মুজাহিদ প্রিন্স" });

  return buildMetadata({
    title: page.seoMeta?.title || page.title,
    description: page.seoMeta?.description || page.excerpt,
    ogImageUrl: page.seoMeta?.ogImage?.storageUrl,
    noIndex: page.seoMeta?.noIndex,
    path: "/",
  });
}

export default async function HomePage() {
  const page = await getHomepage();
  if (!page) notFound();

  return (
    <SectionRenderer
      sections={page.sections}
      hero={page.hero}
      pageTitle={page.title}
    />
  );
}
