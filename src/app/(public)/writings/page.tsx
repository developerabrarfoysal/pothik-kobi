import type { Metadata } from "next";
import { getPageBySlug, getPublishedWritings, getCategories } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { AnimatedHero } from "@/components/public/AnimatedHero";
import { WritingCard } from "@/components/public/WritingCard";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("writings");
  return buildMetadata({
    title: page?.seoMeta?.title || "লেখালেখি | পথিক কবি",
    description: page?.seoMeta?.description || "মুজাহিদ প্রিন্সের কবিতা, গল্প ও সাহিত্য",
    path: "/writings",
  });
}

export default async function WritingsPage() {
  const [page, writings, categories] = await Promise.all([
    getPageBySlug("writings"),
    getPublishedWritings({ limit: 50 }),
    getCategories(),
  ]);

  if (page?.sections.length) {
    return <SectionRenderer sections={page.sections} hero={page.hero} pageTitle={page.title} />;
  }

  return (
    <>
      <AnimatedHero
        title="লেখালেখি"
        subtitle="পথিক কবি"
        description="কবিতা, গল্প ও সাহিত্য — বিভাগ অনুযায়ী"
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
                style={{ backgroundColor: cat.color || "var(--primary)" }}
              >
                {cat.name} ({cat._count.writings})
              </span>
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {writings.map((w, i) => (
              <WritingCard key={w.id} writing={w} index={i} />
            ))}
          </div>
          {writings.length === 0 && (
            <p className="text-center text-muted">এখনও কোনো লেখা প্রকাশিত হয়নি।</p>
          )}
        </div>
      </section>
    </>
  );
}
