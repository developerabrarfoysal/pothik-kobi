import { getPublishedWritings, getCategories, getGalleryAlbums } from "@/lib/queries/public";
import { getSiteSettings } from "@/lib/site-settings";
import { AnimatedHero } from "./AnimatedHero";
import { WritingsSection } from "./sections/WritingsSection";
import { CategoryTabsSection } from "./sections/CategoryTabsSection";
import { AboutWriterSection } from "./sections/AboutWriterSection";
import { QuoteBlockSection } from "./sections/QuoteBlockSection";
import { GallerySection } from "./sections/GallerySection";
import { VideoGallerySection } from "./sections/VideoGallerySection";
import { RichTextSection } from "./sections/RichTextSection";
import { ContactSection } from "./sections/ContactSection";
import { CTASection } from "./sections/CTASection";
import { CustomGridSection } from "./sections/CustomGridSection";
import { CustomCardsSection } from "./sections/CustomCardsSection";
import type { PageSection, PageHero } from "@prisma/client";
import type { ReactNode } from "react";

type SectionRendererProps = {
  sections: PageSection[];
  hero?: (PageHero & { backgroundImage?: { storageUrl: string } | null }) | null;
  pageTitle?: string;
};

async function renderSection(
  section: PageSection,
  settings: Awaited<ReturnType<typeof getSiteSettings>>,
  hero: SectionRendererProps["hero"],
  pageTitle?: string
): Promise<ReactNode> {
  const config = section.config as Record<string, unknown>;

  switch (section.type) {
    case "HERO_3D":
      return hero ? null : (
        <AnimatedHero
          key={section.id}
          title={String(config.title || pageTitle || settings.siteName)}
          subtitle={String(config.subtitle || settings.siteTagline || "")}
          description={config.description ? String(config.description) : undefined}
        />
      );

    case "FEATURED_WRITINGS": {
      const writings = await getPublishedWritings({ limit: Number(config.limit) || 6 });
      return <WritingsSection key={section.id} title={section.title || "নির্বাচিত লেখা"} writings={writings} />;
    }

    case "LATEST_WRITINGS": {
      const writings = await getPublishedWritings({ limit: Number(config.limit) || 9 });
      return <WritingsSection key={section.id} title={section.title || "সাম্প্রতিক লেখা"} writings={writings} />;
    }

    case "CATEGORY_TABS": {
      const categories = await getCategories();
      return <CategoryTabsSection key={section.id} title={section.title || "বিভাগ অনুযায়ী"} categories={categories} />;
    }

    case "ABOUT_WRITER":
      return <AboutWriterSection key={section.id} settings={settings} config={config} />;

    case "QUOTE_BLOCK":
      return <QuoteBlockSection key={section.id} config={config} title={section.title} />;

    case "IMAGE_GALLERY": {
      const albums = await getGalleryAlbums();
      return <GallerySection key={section.id} title={section.title} albums={albums} config={config} />;
    }

    case "VIDEO_GALLERY":
      return <VideoGallerySection key={section.id} title={section.title} config={config} />;

    case "CUSTOM_RICH_TEXT":
    case "HTML_SAFE_BLOCK":
      return <RichTextSection key={section.id} title={section.title} config={config} />;

    case "CUSTOM_GRID":
      return <CustomGridSection key={section.id} title={section.title} config={config} />;

    case "CUSTOM_CARDS":
      return <CustomCardsSection key={section.id} title={section.title} config={config} />;

    case "CONTACT_BLOCK":
      return <ContactSection key={section.id} settings={settings} title={section.title} />;

    case "CTA_BLOCK":
      return <CTASection key={section.id} config={config} title={section.title} />;

    default:
      return null;
  }
}

export async function SectionRenderer({ sections, hero, pageTitle }: SectionRendererProps) {
  const settings = await getSiteSettings();
  const rendered = await Promise.all(
    sections.map((section) => renderSection(section, settings, hero, pageTitle))
  );

  return (
    <>
      {hero && (
        <AnimatedHero
          title={hero.title}
          subtitle={hero.subtitle}
          description={hero.description}
          backgroundImageUrl={hero.backgroundImage?.storageUrl}
        />
      )}
      {rendered}
    </>
  );
}
