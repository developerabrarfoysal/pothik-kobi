import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/queries/public";
import { getSiteSettings } from "@/lib/site-settings";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { AnimatedHero } from "@/components/public/AnimatedHero";
import { ContactSection } from "@/components/public/sections/ContactSection";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("contact");
  return buildMetadata({
    title: page?.seoMeta?.title || "যোগাযোগ | পথিক কবি",
    description: page?.seoMeta?.description || "পথিক কবির সাথে যোগাযোগ করুন",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug("contact"), getSiteSettings()]);

  if (page?.sections.length) {
    return <SectionRenderer sections={page.sections} hero={page.hero} pageTitle={page.title} />;
  }

  return (
    <>
      <AnimatedHero title="যোগাযোগ" subtitle={settings.siteName} description="আপনার বার্তা পাঠান" />
      <ContactSection settings={settings} title="যোগাযোগ করুন" />
    </>
  );
}
