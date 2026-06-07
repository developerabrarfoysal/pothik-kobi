import { getAdminWritings } from "@/lib/actions/writings";
import { WritingsManager } from "@/components/admin/WritingsManager";

export default async function AdminWritingsPage() {
  const writings = await getAdminWritings();
  return <WritingsManager writings={writings} />;
}
