import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWritingBySlug, getPublishedWritings } from "@/lib/queries/public";
import { buildMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getSiteUrl, formatBanglaDate } from "@/lib/utils";
import { MediaImage } from "@/components/shared/MediaImage";
import { LazyVideoPlayer } from "@/components/shared/LazyVideoPlayer";
import { AnimatedHero } from "@/components/public/AnimatedHero";
import { WritingCard } from "@/components/public/WritingCard";
import { incrementWritingViews } from "@/lib/queries/public";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);
  if (!writing) return {};

  return buildMetadata({
    title: writing.seoTitle || writing.seoMeta?.title || writing.title,
    description: writing.seoDescription || writing.seoMeta?.description || writing.excerpt,
    ogImageUrl: writing.ogImage?.storageUrl || writing.seoMeta?.ogImage?.storageUrl || writing.featuredImage?.storageUrl,
    noIndex: writing.seoMeta?.noIndex,
    path: `/writings/${slug}`,
  });
}

export default async function WritingDetailPage({ params }: Props) {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);
  if (!writing) notFound();

  await incrementWritingViews(writing.id);

  const related = writing.category
    ? await getPublishedWritings({ categorySlug: writing.category.slug, limit: 4 })
    : [];

  const filteredRelated = related.filter((w) => w.id !== writing.id).slice(0, 3);
  const url = `${getSiteUrl()}/writings/${slug}`;

  const articleJsonLd = buildArticleJsonLd({
    title: writing.title,
    description: writing.excerpt,
    url,
    imageUrl: writing.featuredImage?.storageUrl,
    datePublished: writing.publishedAt?.toISOString(),
    dateModified: writing.updatedAt.toISOString(),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "হোম", url: getSiteUrl() },
    { name: "লেখালেখি", url: `${getSiteUrl()}/writings` },
    { name: writing.title, url },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <AnimatedHero title={writing.title} subtitle={writing.category?.name} description={writing.excerpt} />

      <article className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted">
            {writing.publishedAt && <time>{formatBanglaDate(writing.publishedAt)}</time>}
            <span>•</span>
            <span>{writing.readingTime} মিনিট পড়া</span>
            {writing.category && (
              <>
                <span>•</span>
                <Link href={`/writings?category=${writing.category.slug}`} className="text-primary hover:underline">
                  {writing.category.name}
                </Link>
              </>
            )}
          </div>

          {writing.featuredImage && (
            <div className="relative mb-10 aspect-video overflow-hidden rounded-2xl">
              <MediaImage media={writing.featuredImage} fill className="object-cover" priority sizes="800px" />
            </div>
          )}

          <div className="prose-bn text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: writing.content }} />

          {writing.videos.length > 0 && (
            <div className="mt-12 space-y-6">
              <h2 className="font-serif text-2xl font-bold">ভিডিও</h2>
              {writing.videos.map((video) => (
                <LazyVideoPlayer
                  key={video.id}
                  embedUrl={video.embedUrl}
                  thumbnail={video.thumbnail}
                  title={video.title}
                  provider={video.provider}
                />
              ))}
            </div>
          )}

          {writing.galleryItems.length > 0 && (
            <div className="mt-12 grid grid-cols-2 gap-4">
              {writing.galleryItems.map((item) => (
                <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl">
                  <MediaImage media={item.media} fill className="object-cover" sizes="400px" />
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      {filteredRelated.length > 0 && (
        <section className="border-t bg-primary/5 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 font-serif text-2xl font-bold">সম্পর্কিত লেখা</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRelated.map((w, i) => (
                <WritingCard key={w.id} writing={w} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
