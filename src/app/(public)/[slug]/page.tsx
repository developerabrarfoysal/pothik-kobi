import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/public/SectionRenderer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};

  return buildMetadata({
    title: page.seoMeta?.title || page.title,
    description: page.seoMeta?.description || page.excerpt,
    ogImageUrl: page.seoMeta?.ogImage?.storageUrl,
    noIndex: page.seoMeta?.noIndex,
    path: `/${slug}`,
  });
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page || page.isHomepage) notFound();

  return <SectionRenderer sections={page.sections} hero={page.hero} pageTitle={page.title} />;
}
