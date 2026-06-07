import { getAdminCategories } from "@/lib/actions/writings";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoriesManager initial={categories} />;
}
