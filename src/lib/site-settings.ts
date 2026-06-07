import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { CACHE_TAGS } from "./cache";
import type { SiteSettings } from "./validations";

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "পথিক কবি",
  siteTagline: "মুজাহিদ প্রিন্স — কবিতা, গল্প ও সাহিত্য",
  writerName: "মুজাহিদ প্রিন্স",
  writerBio: "বাংলাদেশের একজন কবি ও লেখক। বিদ্রোহী ভাবনা, প্রেম-বিরহ, দেশপ্রেম ও মানবতার কথা তাঁর কবিতায় সজীব।",
  writerPhotoId: null,
  logoId: null,
  faviconId: null,
  primaryColor: "#006A4E",
  secondaryColor: "#F42A41",
  accentColor: "#0066CC",
  contactEmail: "contact@pathikkobi.com",
  contactPhone: "",
  contactAddress: "বাংলাদেশ",
  socialLinks: [
    { platform: "facebook", url: "https://facebook.com" },
    { platform: "youtube", url: "https://youtube.com" },
  ],
  footerText: "© পথিক কবি — সকল স্বত্ব সংরক্ষিত",
};

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "global" },
    });
    if (!setting) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(setting.value as SiteSettings) };
  },
  ["site-settings"],
  { tags: [CACHE_TAGS.siteSettings], revalidate: 3600 }
);

export const getNavigation = unstable_cache(
  async () => {
    return prisma.navigationItem.findMany({
      where: { isVisible: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          where: { isVisible: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },
  ["navigation"],
  { tags: [CACHE_TAGS.navigation], revalidate: 3600 }
);

export async function updateSiteSettings(data: SiteSettings) {
  await prisma.siteSetting.upsert({
    where: { key: "global" },
    create: { key: "global", value: data },
    update: { value: data },
  });
}

export async function getMediaById(id: string | null | undefined) {
  if (!id) return null;
  return prisma.mediaAsset.findUnique({ where: { id } });
}
