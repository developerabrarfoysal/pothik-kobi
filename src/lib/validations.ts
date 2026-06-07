import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("বৈধ ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর").max(100),
  email: z.string().email("বৈধ ইমেইল দিন"),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, "বার্তা কমপক্ষে ১০ অক্ষর").max(5000),
});

export const seoSchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(320).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  ogImageId: z.string().optional().nullable(),
  noIndex: z.boolean().default(false),
});

export const pageSchema = z.object({
  title: z.string().min(1, "শিরোনাম প্রয়োজন"),
  slug: z.string().min(1, "স্লাগ প্রয়োজন"),
  excerpt: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  isHomepage: z.boolean().default(false),
});

export const pageHeroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  backgroundImageId: z.string().optional().nullable(),
  overlayColor: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const pageSectionSchema = z.object({
  type: z.enum([
    "HERO_3D", "FEATURED_WRITINGS", "LATEST_WRITINGS", "CATEGORY_TABS",
    "ABOUT_WRITER", "QUOTE_BLOCK", "IMAGE_GALLERY", "VIDEO_GALLERY",
    "CUSTOM_RICH_TEXT", "CUSTOM_GRID", "CUSTOM_CARDS", "CONTACT_BLOCK",
    "CTA_BLOCK", "HTML_SAFE_BLOCK",
  ]),
  title: z.string().optional(),
  isVisible: z.boolean().default(true),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const writingSchema = z.object({
  title: z.string().min(1, "শিরোনাম প্রয়োজন"),
  slug: z.string().min(1, "স্লাগ প্রয়োজন"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "বিষয়বস্তু প্রয়োজন"),
  featuredImageId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string().optional().nullable(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImageId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
  isVisible: z.boolean().default(true),
});

export const navigationSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  isVisible: z.boolean().default(true),
  openInNew: z.boolean().default(false),
  parentId: z.string().optional().nullable(),
});

export const galleryAlbumSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  isVisible: z.boolean().default(true),
});

export const videoSchema = z.object({
  title: z.string().optional(),
  originalUrl: z.string().url("বৈধ ভিডিও URL দিন"),
  writingId: z.string().optional().nullable(),
  sectionKey: z.string().optional().nullable(),
});

export const mediaUpdateSchema = z.object({
  altText: z.string().max(300).optional(),
  caption: z.string().max(500).optional(),
});

export const siteSettingSchema = z.object({
  siteName: z.string().min(1),
  siteTagline: z.string().optional(),
  writerName: z.string().min(1),
  writerBio: z.string().optional(),
  writerPhotoId: z.string().optional().nullable(),
  logoId: z.string().optional().nullable(),
  faviconId: z.string().optional().nullable(),
  primaryColor: z.string().default("#006A4E"),
  secondaryColor: z.string().default("#F42A41"),
  accentColor: z.string().default("#0066CC"),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
  })).default([]),
  footerText: z.string().optional(),
});

export type SiteSettings = z.infer<typeof siteSettingSchema>;
