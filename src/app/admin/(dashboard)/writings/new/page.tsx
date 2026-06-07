import { getAdminCategories, getAdminTags } from "@/lib/actions/writings";
import { WritingForm } from "@/components/admin/WritingForm";

export default async function NewWritingPage() {
  const [categories, tags] = await Promise.all([getAdminCategories(), getAdminTags()]);
  return <WritingForm categories={categories} tags={tags} />;
}
