"use server";

import { prisma } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/cache";
import { writingSchema, categorySchema, seoSchema } from "@/lib/validations";
import { slugify, estimateReadingTime } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { ContentStatus } from "@prisma/client";

export async function createWriting(data: unknown) {
  const session = await requireAdmin();
  const parsed = writingSchema.parse(data);

  const writing = await prisma.writing.create({
    data: {
      title: parsed.title,
      slug: parsed.slug || slugify(parsed.title),
      excerpt: parsed.excerpt,
      content: sanitizeHtml(parsed.content),
      featuredImageId: parsed.featuredImageId,
      categoryId: parsed.categoryId,
      status: parsed.status,
      publishedAt: parsed.status === "PUBLISHED" ? (parsed.publishedAt ? new Date(parsed.publishedAt) : new Date()) : null,
      readingTime: estimateReadingTime(parsed.content),
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      ogImageId: parsed.ogImageId,
      tags: parsed.tagIds?.length
        ? { create: parsed.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      seoMeta: { create: {} },
    },
  });

  await logAudit(session.userId, "CREATE", "Writing", writing.id);
  revalidatePublicContent({ writings: true });
  return writing;
}

export async function updateWriting(id: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = writingSchema.partial().parse(data);

  if (parsed.tagIds) {
    await prisma.writingTagOnWriting.deleteMany({ where: { writingId: id } });
    if (parsed.tagIds.length) {
      await prisma.writingTagOnWriting.createMany({
        data: parsed.tagIds.map((tagId) => ({ writingId: id, tagId })),
      });
    }
  }

  const writing = await prisma.writing.update({
    where: { id },
    data: {
      ...(parsed.title !== undefined ? { title: parsed.title } : {}),
      ...(parsed.slug !== undefined ? { slug: parsed.slug } : {}),
      ...(parsed.excerpt !== undefined ? { excerpt: parsed.excerpt } : {}),
      ...(parsed.content !== undefined
        ? { content: sanitizeHtml(parsed.content), readingTime: estimateReadingTime(parsed.content) }
        : {}),
      ...(parsed.featuredImageId !== undefined ? { featuredImageId: parsed.featuredImageId } : {}),
      ...(parsed.categoryId !== undefined ? { categoryId: parsed.categoryId } : {}),
      ...(parsed.status !== undefined
        ? {
            status: parsed.status,
            publishedAt:
              parsed.status === "PUBLISHED"
                ? parsed.publishedAt
                  ? new Date(parsed.publishedAt)
                  : new Date()
                : null,
          }
        : {}),
      ...(parsed.seoTitle !== undefined ? { seoTitle: parsed.seoTitle } : {}),
      ...(parsed.seoDescription !== undefined ? { seoDescription: parsed.seoDescription } : {}),
      ...(parsed.ogImageId !== undefined ? { ogImageId: parsed.ogImageId } : {}),
    },
  });

  await logAudit(session.userId, "UPDATE", "Writing", id);
  revalidatePublicContent({ writings: true, writingSlug: writing.slug });
  return writing;
}

export async function deleteWriting(id: string) {
  const session = await requireAdmin();
  const writing = await prisma.writing.findUnique({ where: { id }, select: { slug: true } });
  await prisma.writing.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "Writing", id);
  revalidatePublicContent({ writings: true, writingSlug: writing?.slug });
}

export async function createCategory(data: unknown) {
  const session = await requireAdmin();
  const parsed = categorySchema.parse(data);

  const maxOrder = await prisma.writingCategory.aggregate({ _max: { sortOrder: true } });

  const category = await prisma.writingCategory.create({
    data: {
      ...parsed,
      slug: parsed.slug || slugify(parsed.name),
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await logAudit(session.userId, "CREATE", "WritingCategory", category.id);
  revalidatePublicContent();
  return category;
}

export async function updateCategory(id: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = categorySchema.partial().parse(data);
  const category = await prisma.writingCategory.update({ where: { id }, data: parsed });
  await logAudit(session.userId, "UPDATE", "WritingCategory", id);
  revalidatePublicContent();
  return category;
}

export async function deleteCategory(id: string) {
  const session = await requireAdmin();
  await prisma.writingCategory.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "WritingCategory", id);
  revalidatePublicContent();
}

export async function reorderCategories(orderedIds: string[]) {
  const session = await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.writingCategory.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  await logAudit(session.userId, "REORDER", "WritingCategory");
  revalidatePublicContent();
}

export async function getAdminWritings() {
  await requireAdmin();
  return prisma.writing.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, featuredImage: true },
  });
}

export async function getAdminWriting(id: string) {
  await requireAdmin();
  return prisma.writing.findUnique({
    where: { id },
    include: {
      category: true,
      featuredImage: true,
      ogImage: true,
      tags: { include: { tag: true } },
      videos: { orderBy: { sortOrder: "asc" } },
      galleryItems: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      seoMeta: { include: { ogImage: true } },
    },
  });
}

export async function getAdminCategories() {
  await requireAdmin();
  return prisma.writingCategory.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function updateWritingSeo(id: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = seoSchema.parse(data);

  const seo = await prisma.seoMeta.upsert({
    where: { writingId: id },
    create: { writingId: id, ...parsed, canonicalUrl: parsed.canonicalUrl || undefined },
    update: { ...parsed, canonicalUrl: parsed.canonicalUrl || undefined },
  });

  await logAudit(session.userId, "UPDATE", "WritingSeo", seo.id);
  revalidatePublicContent({ writings: true });
  return seo;
}

export async function toggleWritingStatus(id: string, status: ContentStatus) {
  return updateWriting(id, {
    status,
    publishedAt: status === "PUBLISHED" ? new Date().toISOString() : null,
  });
}

export async function getAdminTags() {
  await requireAdmin();
  return prisma.writingTag.findMany({ orderBy: { name: "asc" } });
}

export async function createTag(name: string) {
  const session = await requireAdmin();
  const tag = await prisma.writingTag.upsert({
    where: { slug: slugify(name) },
    update: { name },
    create: { name, slug: slugify(name) },
  });
  await logAudit(session.userId, "CREATE", "WritingTag", tag.id);
  return tag;
}

export async function addWritingGalleryItem(writingId: string, mediaId: string, caption?: string) {
  const session = await requireAdmin();
  const maxOrder = await prisma.writingGalleryItem.aggregate({
    where: { writingId },
    _max: { sortOrder: true },
  });
  const item = await prisma.writingGalleryItem.create({
    data: {
      writingId,
      mediaId,
      caption,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
    include: { media: true },
  });
  await logAudit(session.userId, "CREATE", "WritingGalleryItem", item.id);
  revalidatePublicContent({ writings: true });
  return item;
}

export async function deleteWritingGalleryItem(id: string) {
  const session = await requireAdmin();
  await prisma.writingGalleryItem.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "WritingGalleryItem", id);
  revalidatePublicContent({ writings: true });
}
