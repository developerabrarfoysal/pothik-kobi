import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { AnimatedHero } from "@/components/public/AnimatedHero";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  return buildMetadata({
    title: page?.seoMeta?.title || "আমার সম্পর্কে | পথিক কবি",
    description: page?.seoMeta?.description || "মুজাহিদ প্রিন্স — পথিক কবির পরিচয়",
    path: "/about",
  });
}

export default async function AboutPage() {
  const page = await getPageBySlug("about");

  if (page?.sections.length) {
    return <SectionRenderer sections={page.sections} hero={page.hero} pageTitle={page.title} />;
  }

  const settings = await getSiteSettings();
  return (
    <>
      <AnimatedHero title="আমার সম্পর্কে" subtitle={settings.siteName} description={settings.siteTagline} />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-serif text-3xl font-bold">{settings.writerName}</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">{settings.writerBio}</p>
        </div>
      </section>
    </>
  );
}
