"use server";

import { prisma } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/cache";
import { pageSchema, pageHeroSchema, pageSectionSchema, seoSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { Prisma, type SectionType, type ContentStatus } from "@prisma/client";

function toJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function createPage(data: {
  title: string;
  slug?: string;
  excerpt?: string;
  status: ContentStatus;
  isHomepage?: boolean;
}) {
  const session = await requireAdmin();
  const parsed = pageSchema.parse({
    ...data,
    slug: data.slug || slugify(data.title),
  });

  if (parsed.isHomepage) {
    await prisma.page.updateMany({ where: { isHomepage: true }, data: { isHomepage: false } });
  }

  const page = await prisma.page.create({
    data: {
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt,
      status: parsed.status,
      isHomepage: parsed.isHomepage,
      hero: {
        create: {
          title: parsed.title,
          subtitle: parsed.excerpt,
        },
      },
      seoMeta: { create: {} },
    },
  });

  await logAudit(session.userId, "CREATE", "Page", page.id);
  revalidatePublicContent();
  return page;
}

export async function updatePage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    status?: ContentStatus;
    isHomepage?: boolean;
  }
) {
  const session = await requireAdmin();

  if (data.isHomepage) {
    await prisma.page.updateMany({ where: { isHomepage: true }, data: { isHomepage: false } });
  }

  const page = await prisma.page.update({ where: { id }, data });
  await logAudit(session.userId, "UPDATE", "Page", id);
  revalidatePublicContent({ slug: page.isHomepage ? undefined : page.slug });
  return page;
}

export async function deletePage(id: string) {
  const session = await requireAdmin();
  const page = await prisma.page.findUnique({ where: { id } });
  if (page?.isHomepage) throw new Error("হোমপেজ মুছে ফেলা যাবে না");

  await prisma.page.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "Page", id);
  revalidatePublicContent();
}

export async function updatePageHero(pageId: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = pageHeroSchema.parse(data);

  const hero = await prisma.pageHero.upsert({
    where: { pageId },
    create: { pageId, ...parsed, config: parsed.config ? toJson(parsed.config) : {} },
    update: { ...parsed, config: parsed.config ? toJson(parsed.config) : {} },
  });

  await logAudit(session.userId, "UPDATE", "PageHero", hero.id);
  revalidatePublicContent({ homepage: true, pages: true });
  return hero;
}

export async function createPageSection(pageId: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = pageSectionSchema.parse(data);

  const maxOrder = await prisma.pageSection.aggregate({
    where: { pageId },
    _max: { sortOrder: true },
  });

  const section = await prisma.pageSection.create({
    data: {
      pageId,
      type: parsed.type as SectionType,
      title: parsed.title,
      isVisible: parsed.isVisible,
      config: toJson(parsed.config),
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await logAudit(session.userId, "CREATE", "PageSection", section.id);
  revalidatePublicContent();
  return section;
}

export async function updatePageSection(id: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = pageSectionSchema.partial().parse(data);

  const config = parsed.config
    ? parsed.type === "HTML_SAFE_BLOCK" || parsed.type === "CUSTOM_RICH_TEXT"
      ? { ...parsed.config, html: parsed.config.html ? sanitizeHtml(String(parsed.config.html)) : undefined }
      : parsed.config
    : undefined;

  const section = await prisma.pageSection.update({
    where: { id },
    data: {
      ...(parsed.type ? { type: parsed.type as SectionType } : {}),
      ...(parsed.title !== undefined ? { title: parsed.title } : {}),
      ...(parsed.isVisible !== undefined ? { isVisible: parsed.isVisible } : {}),
      ...(config !== undefined ? { config: toJson(config) } : {}),
    },
  });

  await logAudit(session.userId, "UPDATE", "PageSection", id);
  revalidatePublicContent();
  return section;
}

export async function deletePageSection(id: string) {
  const session = await requireAdmin();
  await prisma.pageSection.delete({ where: { id } });
  await logAudit(session.userId, "DELETE", "PageSection", id);
  revalidatePublicContent();
}

export async function reorderPageSections(pageId: string, orderedIds: string[]) {
  const session = await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.pageSection.update({ where: { id, pageId }, data: { sortOrder: index } })
    )
  );
  await logAudit(session.userId, "REORDER", "PageSection", pageId);
  revalidatePublicContent();
}

export async function updatePageSeo(pageId: string, data: unknown) {
  const session = await requireAdmin();
  const parsed = seoSchema.parse(data);

  const seo = await prisma.seoMeta.upsert({
    where: { pageId },
    create: { pageId, ...parsed, canonicalUrl: parsed.canonicalUrl || undefined },
    update: { ...parsed, canonicalUrl: parsed.canonicalUrl || undefined },
  });

  await logAudit(session.userId, "UPDATE", "SeoMeta", seo.id);
  revalidatePublicContent();
  return seo;
}

export async function getAdminPages() {
  await requireAdmin();
  return prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      hero: true,
      _count: { select: { sections: true } },
      seoMeta: true,
    },
  });
}

export async function getAdminPage(id: string) {
  await requireAdmin();
  return prisma.page.findUnique({
    where: { id },
    include: {
      hero: { include: { backgroundImage: true } },
      sections: { orderBy: { sortOrder: "asc" } },
      seoMeta: { include: { ogImage: true } },
    },
  });
}
