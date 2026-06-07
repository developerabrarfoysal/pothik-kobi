import { notFound } from "next/navigation";
import { getAdminWriting, getAdminCategories, getAdminTags } from "@/lib/actions/writings";
import { WritingForm } from "@/components/admin/WritingForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditWritingPage({ params }: Props) {
  const { id } = await params;
  const [writing, categories, tags] = await Promise.all([
    getAdminWriting(id),
    getAdminCategories(),
    getAdminTags(),
  ]);
  if (!writing) notFound();

  return <WritingForm categories={categories} tags={tags} writing={writing} />;
}
