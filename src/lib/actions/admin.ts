"use server";

import { prisma } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/cache";
import { videoSchema, galleryAlbumSchema, navigationSchema, siteSettingSchema } from "@/lib/validations";
import { parseVideoUrl } from "@/lib/video-utils";
import { updateSiteSettings } from "@/lib/site-settings";
import { slugify } from "@/lib/utils";

export async function createVideo(data: unknown) {
  const session = await requireAdmin();
  const parsed = videoSchema.parse(data);
  const videoInfo = parseVideoUrl(parsed.originalUrl);
  if (!videoInfo) throw new Error("অবৈধ YouTube বা Facebook ভিডিও URL");

  const maxOrder = parsed.writingId
    ? await prisma.videoAttachment.aggregate({ where: { writingId: parsed.writingId }, _max: { sortOrder: true } })
    : { _max: { sortOrder: null as number | null } };

  const video = await prisma.videoAttachment.create({
    data: {
      title: parsed.title,
      provider: videoInfo.provider,
      originalUrl: videoInfo.originalUrl,
      embedUrl: videoInfo.embedUrl,
      thumbnail: videoInfo.thumbnail,
      writingId: parsed.writingId,
      sectionKey: parsed.sectionKey,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await logAudit(session.userId, "CREATE", "VideoAttachment", video.id);
  revalidatePublicContent();
  return video;
}

export async function deleteVideo(id: string) {
  const session = await requireAdmin();
  await prisma.videoAttachment.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "VideoAttachment", id);
  revalidatePublicContent();
}

export async function reorderVideos(writingId: string, orderedIds: string[]) {
  const session = await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.videoAttachment.update({ where: { id, writingId }, data: { sortOrder: index } })
    )
  );
  await logAudit(session.userId, "REORDER", "VideoAttachment", writingId);
  revalidatePublicContent();
}

export async function getAdminVideos() {
  await requireAdmin();
  return prisma.videoAttachment.findMany({
    orderBy: { createdAt: "desc" },
    include: { writing: { select: { title: true, slug: true } } },
  });
}

export async function createGalleryAlbum(data: unknown) {
  const session = await requireAdmin();
  const parsed = galleryAlbumSchema.parse(data);
  const maxOrder = await prisma.galleryAlbum.aggregate({ _max: { sortOrder: true } });

  const album = await prisma.galleryAlbum.create({
    data: {
      ...parsed,
      slug: parsed.slug || slugify(parsed.title),
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await logAudit(session.userId, "CREATE", "GalleryAlbum", album.id);
  revalidatePublicContent({ gallery: true });
  return album;
}

export async function updateGalleryAlbum(id: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = galleryAlbumSchema.partial().parse(data);
  const album = await prisma.galleryAlbum.update({ where: { id }, data: parsed });
  await logAudit(session.userId, "UPDATE", "GalleryAlbum", id);
  revalidatePublicContent({ gallery: true });
  return album;
}

export async function deleteGalleryAlbum(id: string) {
  const session = await requireAdmin();
  await prisma.galleryAlbum.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "GalleryAlbum", id);
  revalidatePublicContent({ gallery: true });
}

export async function addGalleryItem(albumId: string, mediaId: string, caption?: string) {
  const session = await requireAdmin();
  const maxOrder = await prisma.galleryItem.aggregate({ where: { albumId }, _max: { sortOrder: true } });

  const item = await prisma.galleryItem.create({
    data: {
      albumId,
      mediaId,
      caption,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
    include: { media: true },
  });

  await logAudit(session.userId, "CREATE", "GalleryItem", item.id);
  revalidatePublicContent({ gallery: true });
  return item;
}

export async function deleteGalleryItem(id: string) {
  const session = await requireAdmin();
  await prisma.galleryItem.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "GalleryItem", id);
  revalidatePublicContent({ gallery: true });
}

export async function reorderGalleryItems(albumId: string, orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.galleryItem.update({ where: { id, albumId }, data: { sortOrder: index } })
    )
  );
  revalidatePublicContent({ gallery: true });
}

export async function getAdminGallery() {
  await requireAdmin();
  return prisma.galleryAlbum.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: { orderBy: { sortOrder: "asc" }, include: { media: true } },
    },
  });
}

export async function createNavigationItem(data: unknown) {
  const session = await requireAdmin();
  const parsed = navigationSchema.parse(data);
  const maxOrder = await prisma.navigationItem.aggregate({ _max: { sortOrder: true } });

  const item = await prisma.navigationItem.create({
    data: { ...parsed, sortOrder: (maxOrder._max.sortOrder ?? -1) + 1 },
  });

  await logAudit(session.userId, "CREATE", "NavigationItem", item.id);
  revalidatePublicContent({ navigation: true });
  return item;
}

export async function updateNavigationItem(id: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = navigationSchema.partial().parse(data);
  const item = await prisma.navigationItem.update({ where: { id }, data: parsed });
  await logAudit(session.userId, "UPDATE", "NavigationItem", id);
  revalidatePublicContent({ navigation: true });
  return item;
}

export async function deleteNavigationItem(id: string) {
  const session = await requireAdmin();
  await prisma.navigationItem.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "NavigationItem", id);
  revalidatePublicContent({ navigation: true });
}

export async function reorderNavigation(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.navigationItem.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  revalidatePublicContent({ navigation: true });
}

export async function getAdminNavigation() {
  await requireAdmin();
  return prisma.navigationItem.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function saveSiteSettings(data: unknown) {
  const session = await requireAdmin();
  const parsed = siteSettingSchema.parse(data);
  await updateSiteSettings(parsed);
  await logAudit(session.userId, "UPDATE", "SiteSetting", "global");
  revalidatePublicContent({ settings: true, navigation: true });
  return parsed;
}

export async function submitContactForm(data: unknown) {
  const { contactSchema } = await import("@/lib/validations");
  const parsed = contactSchema.parse(data);

  const message = await prisma.contactMessage.create({ data: parsed });
  return message;
}

export async function getContactMessages() {
  await requireAdmin();
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function markContactRead(id: string) {
  const session = await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  await logAudit(session.userId, "UPDATE", "ContactMessage", id);
}

export async function deleteContactMessage(id: string) {
  const session = await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "ContactMessage", id);
}

export async function getDashboardStats() {
  await requireAdmin();
  const [pages, writings, media, messages, categories] = await Promise.all([
    prisma.page.count(),
    prisma.writing.count(),
    prisma.mediaAsset.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.writingCategory.count(),
  ]);
  return { pages, writings, media, unreadMessages: messages, categories };
}

export async function getAuditLogs(limit = 20) {
  await requireAdmin();
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true, email: true } } },
  });
}
