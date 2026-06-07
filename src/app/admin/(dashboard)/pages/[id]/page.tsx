import { notFound } from "next/navigation";
import { getAdminPage } from "@/lib/actions/pages";
import { PageEditor } from "@/components/admin/PageEditor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminPageEditPage({ params }: Props) {
  const { id } = await params;
  const page = await getAdminPage(id);
  if (!page) notFound();

  return (
    <PageEditor
      page={{
        ...page,
        isHomepage: page.isHomepage,
        sections: page.sections.map((s) => ({
          ...s,
          config: (s.config as Record<string, unknown>) || {},
        })),
        hero: page.hero
          ? {
              ...page.hero,
              backgroundImage: page.hero.backgroundImage,
            }
          : null,
        seoMeta: page.seoMeta
          ? {
              ...page.seoMeta,
              ogImage: page.seoMeta.ogImage,
            }
          : null,
      }}
    />
  );
}
