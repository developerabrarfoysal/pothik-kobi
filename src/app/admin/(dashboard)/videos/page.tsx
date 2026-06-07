import { getAdminVideos } from "@/lib/actions/admin";
import { VideosManager } from "@/components/admin/VideosManager";

export default async function AdminVideosPage() {
  const videos = await getAdminVideos();
  return <VideosManager initial={videos} />;
}
