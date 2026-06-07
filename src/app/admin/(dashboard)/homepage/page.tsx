import { getAdminPages } from "@/lib/actions/pages";
import { redirect } from "next/navigation";

export default async function HomepageBuilderPage() {
  const pages = await getAdminPages();
  const homepage = pages.find((p) => p.isHomepage);
  if (homepage) redirect(`/admin/pages/${homepage.id}`);
  redirect("/admin/pages");
}
