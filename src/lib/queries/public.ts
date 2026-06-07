import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";
import { unstable_cache } from "next/cache";

export const getHomepage = unstable_cache(
  async () => {
    return prisma.page.findFirst({
      where: { isHomepage: true, status: "PUBLISHED" },
      include: {
        hero: { include: { backgroundImage: true } },
        sections: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } },
        seoMeta: { include: { ogImage: true } },
      },
    });
  },
  ["homepage"],
  { tags: [CACHE_TAGS.homepage], revalidate: 3600 }
);

export const getPageBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.page.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        hero: { include: { backgroundImage: true } },
        sections: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } },
        seoMeta: { include: { ogImage: true } },
      },
    });
  },
  ["page-by-slug"],
  { tags: [CACHE_TAGS.pages], revalidate: 3600 }
);

export const getPublishedWritings = unstable_cache(
  async (options?: { categorySlug?: string; limit?: number; featured?: boolean }) => {
    const where = {
      status: "PUBLISHED" as const,
      ...(options?.categorySlug
        ? { category: { slug: options.categorySlug } }
        : {}),
    };

    return prisma.writing.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: options?.limit,
      include: {
        category: true,
        featuredImage: true,
        tags: { include: { tag: true } },
      },
    });
  },
  ["published-writings"],
  { tags: [CACHE_TAGS.writings], revalidate: 3600 }
);

export const getWritingBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.writing.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        category: true,
        featuredImage: true,
        ogImage: true,
        tags: { include: { tag: true } },
        videos: { orderBy: { sortOrder: "asc" } },
        galleryItems: {
          orderBy: { sortOrder: "asc" },
          include: { media: true },
        },
        seoMeta: { include: { ogImage: true } },
      },
    });
  },
  ["writing-by-slug"],
  { tags: [CACHE_TAGS.writings], revalidate: 3600 }
);

export const getCategories = unstable_cache(
  async () => {
    return prisma.writingCategory.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { writings: { where: { status: "PUBLISHED" } } } },
      },
    });
  },
  ["categories"],
  { tags: [CACHE_TAGS.categories], revalidate: 3600 }
);

export const getGalleryAlbums = unstable_cache(
  async () => {
    return prisma.galleryAlbum.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          take: 8,
          include: { media: true },
        },
      },
    });
  },
  ["gallery-albums"],
  { tags: [CACHE_TAGS.gallery], revalidate: 3600 }
);

export async function incrementWritingViews(id: string) {
  await prisma.writing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getAllPublishedSlugs() {
  const [pages, writings] = await Promise.all([
    prisma.page.findMany({
      where: { status: "PUBLISHED", isHomepage: false },
      select: { slug: true, updatedAt: true },
    }),
    prisma.writing.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
  ]);
  return { pages, writings };
}
