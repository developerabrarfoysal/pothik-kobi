import { getAdminPages } from "@/lib/actions/pages";
import { PagesManager } from "@/components/admin/PagesManager";

export default async function AdminPagesPage() {
  const pages = await getAdminPages();
  return <PagesManager initialPages={pages} />;
}
