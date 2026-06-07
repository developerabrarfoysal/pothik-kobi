import { getAdminNavigation } from "@/lib/actions/admin";
import { NavigationManager } from "@/components/admin/NavigationManager";

export default async function AdminNavigationPage() {
  const nav = await getAdminNavigation();
  return <NavigationManager initial={nav} />;
}
