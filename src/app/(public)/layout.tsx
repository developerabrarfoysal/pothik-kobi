import type { Metadata } from "next";
import { getSiteSettings, getNavigation, getMediaById } from "@/lib/site-settings";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { PageTransition } from "@/components/public/PageTransition";
import { buildWebsiteJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const favicon = settings.faviconId ? await getMediaById(settings.faviconId) : null;
  return favicon?.storageUrl && !favicon.storageUrl.startsWith("data:")
    ? { icons: { icon: favicon.storageUrl } }
    : {};
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()]);
  const logo = settings.logoId ? await getMediaById(settings.logoId) : null;

  const jsonLd = buildWebsiteJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`:root { --primary: ${settings.primaryColor}; --secondary: ${settings.secondaryColor}; --accent: ${settings.accentColor}; }`}</style>
      <SiteHeader
        siteName={settings.siteName}
        logoUrl={logo?.storageUrl}
        navItems={navigation.map((n) => ({
          id: n.id,
          label: n.label,
          href: n.href,
          children: n.children?.map((c) => ({ id: c.id, label: c.label, href: c.href })),
        }))}
        primaryColor={settings.primaryColor}
      />
      <main className="flex min-h-screen flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
